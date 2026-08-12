from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import EstadoServicioSerializer


class EstadoServicioAPIView(APIView):
    """Comprobación liviana para verificar que la API está respondiendo."""

    authentication_classes = []
    permission_classes = [AllowAny]

    def get(self, request):
        datos = {
            "servicio": "HemoRuta API",
            "estado": "disponible",
            "version": "v1",
        }
        serializer = EstadoServicioSerializer(datos)
        return Response(serializer.data)
