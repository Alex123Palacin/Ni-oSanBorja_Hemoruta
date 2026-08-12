from pathlib import Path

from django.db import transaction
from django.http import FileResponse
from django.shortcuts import get_object_or_404
from django.urls import reverse
from rest_framework import status
from rest_framework.exceptions import NotFound
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from pacientes.paginacion import paginar_resultados
from pacientes.permissions import (
    SoloMedico,
    SoloPacienteOResponsable,
    paciente_del_usuario,
    pacientes_visibles_para,
    puede_acceder_paciente,
)

from .models import DocumentoPaciente
from .serializers import CargaDocumentoPacienteSerializer
from .services import registrar_evento_documento


ESTADOS_VISIBLES_PARA_PACIENTE = (
    DocumentoPaciente.Estado.PENDIENTE,
    DocumentoPaciente.Estado.DISPONIBLE,
)


def _serializar_documento(documento):
    ruta_archivo = None
    if documento.archivo:
        ruta_archivo = reverse(
            "documentos:paciente-documento-archivo",
            kwargs={"documento_id": documento.id},
        )

    return {
        "id": str(documento.id),
        "nombre": documento.titulo,
        "nombreOriginal": documento.nombre_original,
        "descripcion": documento.descripcion,
        "tipo": documento.tipo,
        "tipoMime": documento.tipo_mime,
        "tamanoBytes": documento.tamano_bytes,
        "fechaDocumento": documento.fecha_documento.isoformat() if documento.fecha_documento else None,
        "creadoEn": documento.creado_en.isoformat(),
        "estado": documento.estado,
        "origen": documento.origen,
        "archivoDisponible": bool(documento.archivo),
        "url": ruta_archivo,
    }


def _respuesta_archivo(request, documento):
    if not documento.archivo:
        raise NotFound("El documento no tiene un archivo adjunto.")

    try:
        archivo = documento.archivo.open("rb")
    except FileNotFoundError as error:
        raise NotFound("El archivo del documento no esta disponible.") from error

    descargar = request.query_params.get("descargar", "").lower() in {"1", "true", "si"}
    nombre_archivo = documento.nombre_original or Path(documento.archivo.name).name
    return FileResponse(
        archivo,
        as_attachment=descargar,
        filename=nombre_archivo,
        content_type=documento.tipo_mime or "application/octet-stream",
    )


class DocumentosPacienteAPIView(APIView):
    permission_classes = (IsAuthenticated, SoloPacienteOResponsable)
    parser_classes = (MultiPartParser, FormParser)

    def get(self, request):
        paciente = paciente_del_usuario(request.user)
        if not paciente:
            return Response({"detalle": "La cuenta no esta vinculada a un paciente."}, status=404)
        queryset = DocumentoPaciente.objects.filter(
            paciente=paciente,
            estado__in=ESTADOS_VISIBLES_PARA_PACIENTE,
        ).order_by("-fecha_documento", "-creado_en")
        return paginar_resultados(request, queryset, _serializar_documento)

    def post(self, request):
        paciente = paciente_del_usuario(request.user)
        if not paciente:
            return Response(
                {"detalle": "La cuenta no esta vinculada a un paciente."},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = CargaDocumentoPacienteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        with transaction.atomic():
            documento = serializer.save(
                paciente=paciente,
                consulta=None,
                origen=DocumentoPaciente.Origen.APP,
                estado=DocumentoPaciente.Estado.PENDIENTE,
                subido_por=request.user,
            )
            registrar_evento_documento(documento)
        return Response(_serializar_documento(documento), status=status.HTTP_201_CREATED)


class ArchivoDocumentoPacienteAPIView(APIView):
    permission_classes = (IsAuthenticated, SoloPacienteOResponsable)

    def get(self, request, documento_id):
        paciente = paciente_del_usuario(request.user)
        if not paciente:
            raise NotFound("La cuenta no esta vinculada a un paciente.")

        documento = get_object_or_404(
            DocumentoPaciente,
            id=documento_id,
            paciente=paciente,
            estado__in=ESTADOS_VISIBLES_PARA_PACIENTE,
        )
        return _respuesta_archivo(request, documento)


class ArchivoDocumentoMedicoAPIView(APIView):
    permission_classes = (IsAuthenticated, SoloMedico)

    def get(self, request, documento_id):
        documento = get_object_or_404(
            DocumentoPaciente.objects.select_related("paciente"),
            id=documento_id,
            estado__in=ESTADOS_VISIBLES_PARA_PACIENTE,
        )
        if not puede_acceder_paciente(request.user, documento.paciente):
            raise NotFound("El documento no existe para los pacientes asignados.")
        return _respuesta_archivo(request, documento)


class DocumentosPacienteMedicoAPIView(APIView):
    permission_classes = (IsAuthenticated, SoloMedico)

    def get(self, request, paciente_id):
        paciente = get_object_or_404(pacientes_visibles_para(request.user), pk=paciente_id)
        documentos = DocumentoPaciente.objects.filter(
            paciente=paciente,
            estado__in=ESTADOS_VISIBLES_PARA_PACIENTE,
        ).order_by("-fecha_documento", "-creado_en")
        return paginar_resultados(
            request,
            documentos,
            _serializar_documento,
            tamano_predeterminado=50,
            tamano_maximo=100,
        )
