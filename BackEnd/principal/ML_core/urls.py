from django.urls import include, path

from .views import (
    CrearSesionConsultaVozAPIView,
    DetalleSesionConsultaVozAPIView,
    PublicarConsultaVozAPIView,
    TranscribirConsultaVozAPIView,
)

app_name = "ml_core"

urlpatterns = [
    path("ml/asistente-paciente/", include(("ML_core.asistente_urls", "asistente_paciente"))),
    path("ml/consultas-voz/", CrearSesionConsultaVozAPIView.as_view(), name="crear-sesion-voz"),
    path(
        "ml/consultas-voz/<uuid:sesion_id>/",
        DetalleSesionConsultaVozAPIView.as_view(),
        name="detalle-sesion-voz",
    ),
    path(
        "ml/consultas-voz/<uuid:sesion_id>/transcribir/",
        TranscribirConsultaVozAPIView.as_view(),
        name="transcribir-sesion-voz",
    ),
    path(
        "ml/consultas-voz/<uuid:sesion_id>/publicar/",
        PublicarConsultaVozAPIView.as_view(),
        name="publicar-sesion-voz",
    ),
]
