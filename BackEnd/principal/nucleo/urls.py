from django.urls import path

from .views import EstadoServicioAPIView

app_name = "nucleo"

urlpatterns = [
    path("salud/", EstadoServicioAPIView.as_view(), name="estado-servicio"),
]
