from django.urls import path
from rest_framework.routers import DefaultRouter

from .facades import MedicacionPacienteAPIView, RegistrarTomaPacienteAPIView
from .views import (
    DiaHorarioPrescripcionViewSet,
    DosisProgramadaViewSet,
    HorarioPrescripcionViewSet,
    MedicamentoViewSet,
    PrescripcionViewSet,
    ReporteDosisViewSet,
)

app_name = "medicacion"

router = DefaultRouter()
router.register("medicamentos", MedicamentoViewSet, basename="medicamento")
router.register("prescripciones", PrescripcionViewSet, basename="prescripcion")
router.register("horarios-prescripcion", HorarioPrescripcionViewSet, basename="horario-prescripcion")
router.register("dias-horario", DiaHorarioPrescripcionViewSet, basename="dia-horario")
router.register("dosis-programadas", DosisProgramadaViewSet, basename="dosis-programada")
router.register("reportes-dosis", ReporteDosisViewSet, basename="reporte-dosis")

urlpatterns = [
    path("paciente/medicacion/", MedicacionPacienteAPIView.as_view(), name="paciente-medicacion"),
    path(
        "paciente/medicacion/tomas/",
        RegistrarTomaPacienteAPIView.as_view(),
        name="paciente-medicacion-tomas",
    ),
] + router.urls
