from django.urls import path

from .asistente_views import ConsultarAsistentePacienteAPIView


urlpatterns = [
    path("consultar/", ConsultarAsistentePacienteAPIView.as_view(), name="consultar"),
]
