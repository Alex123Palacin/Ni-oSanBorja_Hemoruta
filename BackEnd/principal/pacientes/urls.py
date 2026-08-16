from django.urls import path
from rest_framework.routers import DefaultRouter

from .facades import (
    FichaPacienteMedicoAPIView,
    InicioPacienteAPIView,
    ListaPacientesMedicoAPIView,
)
from .views import (
    AsignacionMedicaViewSet,
    CuentaMovilPacienteViewSet,
    PacienteViewSet,
    TutorPacienteViewSet,
)

app_name = "pacientes"

router = DefaultRouter()
router.register("pacientes", PacienteViewSet, basename="paciente")
router.register("tutores-paciente", TutorPacienteViewSet, basename="tutor-paciente")
router.register("asignaciones-medicas", AsignacionMedicaViewSet, basename="asignacion-medica")
router.register("cuentas-moviles-paciente", CuentaMovilPacienteViewSet, basename="cuenta-movil-paciente")

urlpatterns = [
    path("medico/pacientes/", ListaPacientesMedicoAPIView.as_view(), name="medico-pacientes"),
    path(
        "medico/pacientes/<uuid:paciente_id>/ficha/",
        FichaPacienteMedicoAPIView.as_view(),
        name="medico-ficha-paciente",
    ),
    path("paciente/inicio/", InicioPacienteAPIView.as_view(), name="paciente-inicio"),
] + router.urls
