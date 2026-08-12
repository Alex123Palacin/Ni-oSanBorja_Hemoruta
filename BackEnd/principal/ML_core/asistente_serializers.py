from rest_framework import serializers


class ConsultarAsistentePacienteSerializer(serializers.Serializer):
    mensaje = serializers.CharField(max_length=1200, trim_whitespace=True)
    rutaActual = serializers.CharField(max_length=160, required=False, default="/paciente/inicio")

    def validate_rutaActual(self, valor):
        return valor if valor.startswith("/paciente/") else "/paciente/inicio"
