from django.urls import path
from rest_framework.routers import DefaultRouter

from .facades import (
    HistorialSintomasPacienteMedicoAPIView,
    ListaSeguimientoMedicoAPIView,
    RegistrarSintomasPacienteAPIView,
    SeguimientoPacienteMedicoAPIView,
)
from .views import (
    AlertaSeguimientoViewSet,
    CatalogoSintomaViewSet,
    EventoSeguimientoViewSet,
    ReporteSintomasViewSet,
    SemaforoPacienteViewSet,
)

app_name = "seguimiento"

router = DefaultRouter()
router.register("catalogo-sintomas", CatalogoSintomaViewSet, basename="catalogo-sintoma")
router.register("reportes-sintomas", ReporteSintomasViewSet, basename="reporte-sintomas")
router.register("eventos-seguimiento", EventoSeguimientoViewSet, basename="evento-seguimiento")
router.register("semaforos", SemaforoPacienteViewSet, basename="semaforo-paciente")
router.register("alertas", AlertaSeguimientoViewSet, basename="alerta-seguimiento")

urlpatterns = [
    path("medico/seguimiento/", ListaSeguimientoMedicoAPIView.as_view(), name="medico-seguimiento"),
    path(
        "medico/pacientes/<uuid:paciente_id>/seguimiento/",
        SeguimientoPacienteMedicoAPIView.as_view(),
        name="medico-seguimiento-paciente",
    ),
    path(
        "medico/pacientes/<uuid:paciente_id>/sintomas/",
        HistorialSintomasPacienteMedicoAPIView.as_view(),
        name="medico-sintomas-paciente",
    ),
    path("paciente/sintomas/", RegistrarSintomasPacienteAPIView.as_view(), name="paciente-sintomas"),
] + router.urls
