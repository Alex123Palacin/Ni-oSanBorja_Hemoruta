from rest_framework import serializers


class EstadoServicioSerializer(serializers.Serializer):
    servicio = serializers.CharField(read_only=True)
    estado = serializers.CharField(read_only=True)
    version = serializers.CharField(read_only=True)
