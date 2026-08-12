from rest_framework import serializers


class CrearSesionConsultaVozSerializer(serializers.Serializer):
    pacienteId = serializers.UUIDField()


class TranscribirConsultaVozSerializer(serializers.Serializer):
    audio = serializers.FileField(required=False)
    texto = serializers.CharField(required=False, allow_blank=False, trim_whitespace=True, max_length=12000)

    def validate_audio(self, archivo):
        if archivo.size > 25 * 1024 * 1024:
            raise serializers.ValidationError("El audio no puede superar 25 MB.")
        return archivo

    def validate(self, attrs):
        if not attrs.get("audio") and not attrs.get("texto"):
            raise serializers.ValidationError("Adjunte un audio o envíe el campo texto.")
        return attrs


class EditarSesionConsultaVozSerializer(serializers.Serializer):
    secciones = serializers.JSONField()

    def validate_secciones(self, valor):
        if not isinstance(valor, dict):
            raise serializers.ValidationError("Las secciones deben ser un objeto.")
        return valor


class PublicarConsultaVozSerializer(serializers.Serializer):
    secciones = serializers.JSONField(required=False)

    def validate_secciones(self, valor):
        if not isinstance(valor, dict):
            raise serializers.ValidationError("Las secciones deben ser un objeto.")
        return valor
