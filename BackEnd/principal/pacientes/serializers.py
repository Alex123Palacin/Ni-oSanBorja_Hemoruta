from django.db import transaction
from rest_framework import serializers

from .models import AsignacionMedica, CuentaMovilPaciente, Paciente, TutorPaciente


class TutorPacienteSerializer(serializers.ModelSerializer):
    class Meta:
        model = TutorPaciente
        fields = "__all__"
        read_only_fields = ("id", "creado_en", "actualizado_en")


class AsignacionMedicaSerializer(serializers.ModelSerializer):
    medico_nombre = serializers.SerializerMethodField()

    class Meta:
        model = AsignacionMedica
        fields = "__all__"
        read_only_fields = ("id", "asignado_por", "creado_en")

    def get_medico_nombre(self, obj) -> str:
        return obj.medico.get_full_name() or obj.medico.get_username()

    def validate_medico(self, medico):
        if getattr(medico, "rol", None) != "MEDICO":
            raise serializers.ValidationError("El usuario seleccionado no tiene rol MEDICO.")
        return medico


class CuentaMovilPacienteSerializer(serializers.ModelSerializer):
    class Meta:
        model = CuentaMovilPaciente
        fields = "__all__"
        read_only_fields = ("id", "ultimo_acceso_en", "habilitada_en", "creada_en")


class PacienteSerializer(serializers.ModelSerializer):
    nombre_completo = serializers.CharField(read_only=True)
    edad = serializers.IntegerField(read_only=True)
    tutores = TutorPacienteSerializer(many=True, read_only=True)
    asignaciones_medicas = AsignacionMedicaSerializer(many=True, read_only=True)
    cuenta_movil = CuentaMovilPacienteSerializer(read_only=True)

    class Meta:
        model = Paciente
        fields = "__all__"
        read_only_fields = ("id", "creado_por", "creado_en", "actualizado_en")
        extra_kwargs = {
            "fecha_nacimiento": {"required": True, "allow_null": False},
        }

    def validate_dni(self, dni):
        if dni and (not dni.isdigit() or len(dni) != 8):
            raise serializers.ValidationError("El DNI debe contener exactamente 8 digitos.")
        return dni


class PacienteListadoSerializer(serializers.ModelSerializer):
    nombre_completo = serializers.CharField(read_only=True)
    edad = serializers.IntegerField(read_only=True)

    class Meta:
        model = Paciente
        fields = (
            "id",
            "historia_clinica",
            "dni",
            "nombre_completo",
            "edad",
            "estado",
            "perfil_completo",
        )
