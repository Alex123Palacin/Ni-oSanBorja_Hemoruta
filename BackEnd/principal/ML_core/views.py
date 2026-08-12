from __future__ import annotations

from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from pacientes.permissions import SoloMedico, pacientes_visibles_para

from .esquemas import normalizar_estructura
from .models import SesionConsultaVoz
from .proveedores import ErrorTranscripcion, obtener_transcriptor
from .serializers import (
    CrearSesionConsultaVozSerializer,
    EditarSesionConsultaVozSerializer,
    PublicarConsultaVozSerializer,
    TranscribirConsultaVozSerializer,
)
from .servicios import crear_sesion, editar_estructura, incorporar_respuesta, publicar_sesion


def serializar_sesion(sesion: SesionConsultaVoz) -> dict:
    consulta = sesion.consulta
    paciente = consulta.paciente
    return {
        "id": str(sesion.id),
        "consultaId": str(consulta.id),
        "estado": sesion.estado,
        "paciente": {
            "id": str(paciente.id),
            "nombre": paciente.nombre_completo,
            "edad": paciente.edad,
            "historiaClinica": paciente.historia_clinica,
        },
        "preguntaActual": sesion.pregunta_actual,
        "preguntasOmitidas": sesion.preguntas_omitidas,
        "transcripcion": sesion.transcripcion,
        "intervenciones": sesion.intervenciones,
        "secciones": normalizar_estructura(sesion.datos_estructurados),
        "iaDisponible": sesion.ia_disponible,
        "mensajeIa": sesion.mensaje_ia,
        "creadoEn": sesion.creado_en.isoformat(),
        "actualizadoEn": sesion.actualizado_en.isoformat(),
        "publicadoEn": sesion.publicado_en.isoformat() if sesion.publicado_en else None,
    }


class BaseSesionVozAPIView(APIView):
    permission_classes = (IsAuthenticated, SoloMedico)

    def obtener_sesion(self, request, sesion_id) -> SesionConsultaVoz:
        return get_object_or_404(
            SesionConsultaVoz.objects.select_related("consulta__paciente", "consulta__medico"),
            pk=sesion_id,
            consulta__medico=request.user,
        )


class CrearSesionConsultaVozAPIView(BaseSesionVozAPIView):
    def post(self, request):
        serializer = CrearSesionConsultaVozSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        paciente = get_object_or_404(
            pacientes_visibles_para(request.user),
            pk=serializer.validated_data["pacienteId"],
        )
        sesion = crear_sesion(paciente=paciente, medico=request.user)
        return Response(serializar_sesion(sesion), status=status.HTTP_201_CREATED)


class DetalleSesionConsultaVozAPIView(BaseSesionVozAPIView):
    def get(self, request, sesion_id):
        return Response(serializar_sesion(self.obtener_sesion(request, sesion_id)))

    def patch(self, request, sesion_id):
        serializer = EditarSesionConsultaVozSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        sesion = editar_estructura(
            sesion=self.obtener_sesion(request, sesion_id),
            cambios=serializer.validated_data["secciones"],
        )
        return Response(serializar_sesion(sesion))


class TranscribirConsultaVozAPIView(BaseSesionVozAPIView):
    parser_classes = (MultiPartParser, FormParser, JSONParser)

    def post(self, request, sesion_id):
        serializer = TranscribirConsultaVozSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            texto = obtener_transcriptor().transcribir(
                serializer.validated_data.get("audio"),
                texto_alternativo=serializer.validated_data.get("texto", ""),
            )
        except ErrorTranscripcion as exc:
            return Response(
                {"detalle": str(exc), "codigo": "TRANSCRIPCION_NO_DISPONIBLE"},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )
        sesion = incorporar_respuesta(
            sesion=self.obtener_sesion(request, sesion_id),
            texto=texto,
        )
        return Response(serializar_sesion(sesion))


class PublicarConsultaVozAPIView(BaseSesionVozAPIView):
    def post(self, request, sesion_id):
        serializer = PublicarConsultaVozSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        sesion = self.obtener_sesion(request, sesion_id)
        resultado = publicar_sesion(
            sesion=sesion,
            cambios=serializer.validated_data.get("secciones"),
        )
        sesion.refresh_from_db()
        return Response(
            {**serializar_sesion(sesion), "publicacion": resultado},
            status=status.HTTP_201_CREATED,
        )
