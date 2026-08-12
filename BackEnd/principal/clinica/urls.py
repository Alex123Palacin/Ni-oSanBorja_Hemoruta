from django.urls import path
from rest_framework.routers import DefaultRouter

from .facades import HistorialPacienteMedicoAPIView, TratamientoPacienteAPIView
from .views import (
    ConsultaClinicaViewSet,
    DiagnosticoViewSet,
    ItemPlanTratamientoViewSet,
    ItemSeccionConsultaViewSet,
    PlanTratamientoViewSet,
    SeccionConsultaViewSet,
)

app_name = "clinica"

router = DefaultRouter()
router.register("diagnosticos", DiagnosticoViewSet, basename="diagnostico")
router.register("consultas", ConsultaClinicaViewSet, basename="consulta")
router.register("secciones-consulta", SeccionConsultaViewSet, basename="seccion-consulta")
router.register("items-seccion-consulta", ItemSeccionConsultaViewSet, basename="item-seccion-consulta")
router.register("planes-tratamiento", PlanTratamientoViewSet, basename="plan-tratamiento")
router.register("items-plan-tratamiento", ItemPlanTratamientoViewSet, basename="item-plan-tratamiento")

urlpatterns = [
    path(
        "medico/pacientes/<uuid:paciente_id>/historial/",
        HistorialPacienteMedicoAPIView.as_view(),
        name="medico-historial-paciente",
    ),
    path("paciente/tratamiento/", TratamientoPacienteAPIView.as_view(), name="paciente-tratamiento"),
] + router.urls
