from django.urls import path
from rest_framework.routers import DefaultRouter

from .facades import AgendaPacienteMedicoAPIView
from .views import CitaViewSet

app_name = "citas"

router = DefaultRouter()
router.register("citas", CitaViewSet, basename="cita")

urlpatterns = [
    path(
        "medico/pacientes/<uuid:paciente_id>/agenda/",
        AgendaPacienteMedicoAPIView.as_view(),
        name="medico-agenda-paciente",
    ),
] + router.urls
