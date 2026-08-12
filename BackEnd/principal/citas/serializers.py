from rest_framework import serializers

from .models import Cita


class CitaSerializer(serializers.ModelSerializer):
    medico_nombre = serializers.SerializerMethodField()

    class Meta:
        model = Cita
        fields = "__all__"
        read_only_fields = (
            "id",
            "creada_por",
            "confirmada_por",
            "confirmada_en",
            "creado_en",
            "actualizado_en",
        )

    def get_medico_nombre(self, obj) -> str:
        if not obj.medico:
            return ""
        return obj.medico.get_full_name() or obj.medico.get_username()

    def validate_medico(self, medico):
        if medico and getattr(medico, "rol", None) != "MEDICO":
            raise serializers.ValidationError("El usuario seleccionado no tiene rol MEDICO.")
        return medico

    def validate(self, attrs):
        inicio = attrs.get("inicio", getattr(self.instance, "inicio", None))
        fin = attrs.get("fin", getattr(self.instance, "fin", None))
        if inicio and fin and fin <= inicio:
            raise serializers.ValidationError({"fin": "La hora final debe ser posterior al inicio."})
        if self.instance and "paciente" in attrs and attrs["paciente"].pk != self.instance.paciente_id:
            raise serializers.ValidationError({"paciente": "No se puede trasladar una cita de paciente."})
        return attrs
