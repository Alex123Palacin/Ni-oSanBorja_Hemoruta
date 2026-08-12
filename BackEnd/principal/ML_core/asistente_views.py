from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from pacientes.permissions import SoloPacienteOResponsable, paciente_del_usuario

from .asistente_serializers import ConsultarAsistentePacienteSerializer
from .servicio_asistente_paciente import consultar_asistente_paciente


class ConsultarAsistentePacienteAPIView(APIView):
    permission_classes = (IsAuthenticated, SoloPacienteOResponsable)

    def post(self, request):
        serializer = ConsultarAsistentePacienteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        paciente = paciente_del_usuario(request.user)
        if not paciente:
            return Response(
                {"detalle": "La cuenta no está vinculada a un paciente."},
                status=status.HTTP_404_NOT_FOUND,
            )
        resultado = consultar_asistente_paciente(
            paciente=paciente,
            mensaje=serializer.validated_data["mensaje"],
            ruta_actual=serializer.validated_data["rutaActual"],
            usuario=request.user,
        )
        return Response(resultado)
