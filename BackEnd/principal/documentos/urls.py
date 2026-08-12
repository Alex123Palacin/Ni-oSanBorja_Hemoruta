from django.urls import path
from rest_framework.routers import DefaultRouter

from .facades import (
    ArchivoDocumentoMedicoAPIView,
    ArchivoDocumentoPacienteAPIView,
    DocumentosPacienteMedicoAPIView,
    DocumentosPacienteAPIView,
)
from .views import DocumentoPacienteViewSet

app_name = "documentos"

router = DefaultRouter()
router.register("documentos", DocumentoPacienteViewSet, basename="documento-paciente")

urlpatterns = [
    path("paciente/documentos/", DocumentosPacienteAPIView.as_view(), name="paciente-documentos"),
    path(
        "paciente/documentos/<uuid:documento_id>/archivo/",
        ArchivoDocumentoPacienteAPIView.as_view(),
        name="paciente-documento-archivo",
    ),
    path(
        "medico/pacientes/<uuid:paciente_id>/documentos/",
        DocumentosPacienteMedicoAPIView.as_view(),
        name="medico-documentos-paciente",
    ),
    path(
        "medico/documentos/<uuid:documento_id>/archivo/",
        ArchivoDocumentoMedicoAPIView.as_view(),
        name="medico-documento-archivo",
    ),
] + router.urls
