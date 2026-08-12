import uuid

from django.db.models import Q
from django.shortcuts import get_object_or_404
from rest_framework import serializers
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from pacientes.facades import queryset_pacientes_resumen, serializar_paciente_lista
from pacientes.paginacion import paginar_resultados
from pacientes.permissions import SoloMedico, SoloPacienteOResponsable, paciente_del_usuario, pacientes_visibles_para

from .models import CatalogoSintoma, EventoSeguimiento, ReporteSintomas
from .services import registrar_reporte_sintomas


def _serializar_evento(evento):
    origen = {
        EventoSeguimiento.Origen.APP: "APP_MOVIL",
        EventoSeguimiento.Origen.WEB: "APP_MOVIL",
        EventoSeguimiento.Origen.MEDICO: "MEDICO",
        EventoSeguimiento.Origen.SISTEMA: "MEDICO",
    }[evento.origen]
    tipo = "SINTOMA" if evento.tipo == EventoSeguimiento.Tipo.SINTOMAS else evento.tipo
    return {
        "id": str(evento.id),
        "tipo": tipo,
        "origen": origen,
        "ocurridoEn": evento.ocurrido_en.isoformat(),
        "resumen": evento.resumen,
        "estado": evento.estado,
    }


def _serializar_reporte_sintomas(reporte):
    evento = getattr(reporte, "evento_seguimiento", None)
    return {
        "id": str(reporte.id),
        "intensidad": reporte.intensidad,
        "intensidadTexto": reporte.get_intensidad_display(),
        "duracion": reporte.duracion,
        "duracionTexto": reporte.get_duracion_display(),
        "evolucion": reporte.evolucion,
        "evolucionTexto": reporte.get_evolucion_display(),
        "observadoEn": reporte.observado_en.isoformat(),
        "descripcion": reporte.descripcion,
        "origen": reporte.origen,
        "origenTexto": reporte.get_origen_display(),
        "reportadoEn": reporte.reportado_en.isoformat(),
        "estado": evento.estado if evento else "RECIBIDO",
        "reportadoPor": {
            "id": str(reporte.reportado_por_id),
            "nombre": reporte.reportado_por.nombre_completo,
        },
        "sintomas": [
            {
                "id": str(sintoma_reportado.sintoma_id),
                "codigo": sintoma_reportado.sintoma.codigo,
                "nombre": sintoma_reportado.sintoma.nombre,
                "detalle": sintoma_reportado.detalle,
            }
            for sintoma_reportado in reporte.sintomas_reportados.all()
        ],
    }


class ListaSeguimientoMedicoAPIView(APIView):
    permission_classes = (IsAuthenticated, SoloMedico)

    def get(self, request):
        queryset = queryset_pacientes_resumen(request.user).filter(eventos_seguimiento__isnull=False).distinct()
        return paginar_resultados(request, queryset, serializar_paciente_lista)


class SeguimientoPacienteMedicoAPIView(APIView):
    permission_classes = (IsAuthenticated, SoloMedico)

    def get(self, request, paciente_id):
        get_object_or_404(pacientes_visibles_para(request.user), pk=paciente_id)
        queryset = EventoSeguimiento.objects.filter(paciente_id=paciente_id)
        termino = request.query_params.get("q", "").strip()
        if termino:
            queryset = queryset.filter(Q(resumen__icontains=termino) | Q(detalle__icontains=termino))
        tipo = request.query_params.get("tipo", "").strip().upper()
        mapa_tipos = {
            "SINTOMA": EventoSeguimiento.Tipo.SINTOMAS,
            "SINTOMAS": EventoSeguimiento.Tipo.SINTOMAS,
            "MEDICACION": EventoSeguimiento.Tipo.MEDICACION,
            "TRATAMIENTO": EventoSeguimiento.Tipo.TRATAMIENTO,
            "DOCUMENTO": EventoSeguimiento.Tipo.DOCUMENTO,
        }
        if tipo and tipo not in {"TODOS", "TODO"}:
            queryset = queryset.filter(tipo=mapa_tipos.get(tipo, tipo))
        return paginar_resultados(request, queryset.order_by("-ocurrido_en"), _serializar_evento)


class HistorialSintomasPacienteMedicoAPIView(APIView):
    permission_classes = (IsAuthenticated, SoloMedico)

    def get(self, request, paciente_id):
        get_object_or_404(pacientes_visibles_para(request.user), pk=paciente_id)
        queryset = (
            ReporteSintomas.objects.filter(paciente_id=paciente_id)
            .select_related("reportado_por", "evento_seguimiento")
            .prefetch_related("sintomas_reportados__sintoma")
            .order_by("-observado_en", "-reportado_en")
        )
        return paginar_resultados(
            request,
            queryset,
            _serializar_reporte_sintomas,
            tamano_predeterminado=50,
            tamano_maximo=100,
        )


class RegistrarSintomasPacienteSerializer(serializers.Serializer):
    sintomas = serializers.ListField(child=serializers.CharField(max_length=40), allow_empty=False)
    intensidad = serializers.CharField(max_length=20)
    duracion = serializers.CharField(max_length=30)
    evolucion = serializers.CharField(max_length=20)
    observadoEn = serializers.DateTimeField()
    observacion = serializers.CharField(max_length=250, required=False, allow_blank=True)

    def validate_intensidad(self, valor):
        mapa = {
            "LEVE": ReporteSintomas.Intensidad.LEVE,
            "MODERADO": ReporteSintomas.Intensidad.MODERADA,
            "MODERADA": ReporteSintomas.Intensidad.MODERADA,
            "FUERTE": ReporteSintomas.Intensidad.FUERTE,
        }
        normalizado = valor.strip().upper().replace("-", "_")
        if normalizado not in mapa:
            raise serializers.ValidationError("Intensidad no reconocida.")
        return mapa[normalizado]

    def validate_duracion(self, valor):
        mapa = {
            "MENOS_DE_1": ReporteSintomas.Duracion.MENOS_1_HORA,
            "MENOS_DE_1_HORA": ReporteSintomas.Duracion.MENOS_1_HORA,
            "MENOS_1_HORA": ReporteSintomas.Duracion.MENOS_1_HORA,
            "ENTRE_1_Y_6": ReporteSintomas.Duracion.ENTRE_1_6_HORAS,
            "ENTRE_1_6_HORAS": ReporteSintomas.Duracion.ENTRE_1_6_HORAS,
            "ENTRE_6_Y_24": ReporteSintomas.Duracion.ENTRE_6_24_HORAS,
            "ENTRE_6_24_HORAS": ReporteSintomas.Duracion.ENTRE_6_24_HORAS,
            "MAS_DE_24": ReporteSintomas.Duracion.MAS_24_HORAS,
            "MAS_DE_24_HORAS": ReporteSintomas.Duracion.MAS_24_HORAS,
            "MAS_24_HORAS": ReporteSintomas.Duracion.MAS_24_HORAS,
        }
        normalizado = valor.strip().upper().replace("-", "_")
        if normalizado not in mapa:
            raise serializers.ValidationError("Duracion no reconocida.")
        return mapa[normalizado]

    def validate_evolucion(self, valor):
        mapa = {
            "IGUAL": ReporteSintomas.Evolucion.IGUAL,
            "MEJORO": ReporteSintomas.Evolucion.MEJORO,
            "EMPEORO": ReporteSintomas.Evolucion.EMPEORO,
        }
        normalizado = valor.strip().upper().replace("Ó", "O")
        if normalizado not in mapa:
            raise serializers.ValidationError("Evolucion no reconocida.")
        return mapa[normalizado]


class RegistrarSintomasPacienteAPIView(APIView):
    permission_classes = (IsAuthenticated, SoloPacienteOResponsable)

    def post(self, request):
        serializer = RegistrarSintomasPacienteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        paciente = paciente_del_usuario(request.user)
        if not paciente:
            return Response({"detalle": "La cuenta no esta vinculada a un paciente."}, status=404)
        referencias = serializer.validated_data["sintomas"]
        ids = []
        codigos = []
        for referencia in referencias:
            try:
                ids.append(uuid.UUID(referencia))
            except (TypeError, ValueError, AttributeError):
                codigos.append(referencia.strip().lower())
        sintomas = list(CatalogoSintoma.objects.filter(Q(id__in=ids) | Q(codigo__in=codigos), activo=True))
        if len(sintomas) != len(set(referencias)):
            return Response({"sintomas": ["Uno o mas sintomas no existen o estan inactivos."]}, status=400)
        reporte = registrar_reporte_sintomas(
            paciente=paciente,
            sintomas=sintomas,
            intensidad=serializer.validated_data["intensidad"],
            duracion=serializer.validated_data["duracion"],
            evolucion=serializer.validated_data["evolucion"],
            observado_en=serializer.validated_data["observadoEn"],
            descripcion=serializer.validated_data.get("observacion", ""),
            origen=ReporteSintomas.Origen.APP,
            reportado_por=request.user,
        )
        estado = "ALERTA" if reporte.intensidad == ReporteSintomas.Intensidad.FUERTE else "RECIBIDO"
        return Response({"estado": estado, "registroId": str(reporte.id)}, status=201)
