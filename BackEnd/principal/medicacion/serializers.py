from rest_framework import serializers

from .models import (
    DiaHorarioPrescripcion,
    DosisProgramada,
    HorarioPrescripcion,
    Medicamento,
    Prescripcion,
    ReporteDosis,
)
from .services import registrar_reporte_dosis


class MedicamentoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Medicamento
        fields = "__all__"
        read_only_fields = ("id", "creado_en", "actualizado_en")


class DiaHorarioPrescripcionSerializer(serializers.ModelSerializer):
    class Meta:
        model = DiaHorarioPrescripcion
        fields = "__all__"
        read_only_fields = ("id",)


class HorarioPrescripcionSerializer(serializers.ModelSerializer):
    dias = DiaHorarioPrescripcionSerializer(many=True, read_only=True)

    class Meta:
        model = HorarioPrescripcion
        fields = "__all__"
        read_only_fields = ("id",)

    def validate(self, attrs):
        hora = attrs.get("hora", getattr(self.instance, "hora", None))
        intervalo = attrs.get("intervalo_horas", getattr(self.instance, "intervalo_horas", None))
        if not hora and not intervalo:
            raise serializers.ValidationError("Indique una hora o un intervalo en horas.")
        return attrs


class PrescripcionSerializer(serializers.ModelSerializer):
    medicamento_detalle = MedicamentoSerializer(source="medicamento", read_only=True)
    horarios = HorarioPrescripcionSerializer(many=True, read_only=True)

    class Meta:
        model = Prescripcion
        fields = "__all__"
        read_only_fields = ("id", "medico", "creado_en", "actualizado_en")

    def validate(self, attrs):
        paciente = attrs.get("paciente", getattr(self.instance, "paciente", None))
        consulta = attrs.get("consulta", getattr(self.instance, "consulta", None))
        plan = attrs.get("plan_tratamiento", getattr(self.instance, "plan_tratamiento", None))
        if consulta and paciente and consulta.paciente_id != paciente.id:
            raise serializers.ValidationError({"consulta": "La consulta pertenece a otro paciente."})
        if plan and paciente and plan.paciente_id != paciente.id:
            raise serializers.ValidationError({"plan_tratamiento": "El plan pertenece a otro paciente."})
        desde = attrs.get("fecha_inicio", getattr(self.instance, "fecha_inicio", None))
        hasta = attrs.get("fecha_fin", getattr(self.instance, "fecha_fin", None))
        if desde and hasta and hasta < desde:
            raise serializers.ValidationError({"fecha_fin": "La fecha final no puede ser anterior al inicio."})
        return attrs


class DosisProgramadaSerializer(serializers.ModelSerializer):
    class Meta:
        model = DosisProgramada
        fields = "__all__"
        read_only_fields = ("id", "actualizado_en")

    def validate(self, attrs):
        prescripcion = attrs.get("prescripcion", getattr(self.instance, "prescripcion", None))
        horario = attrs.get("horario", getattr(self.instance, "horario", None))
        if prescripcion and horario and horario.prescripcion_id != prescripcion.id:
            raise serializers.ValidationError({"horario": "El horario pertenece a otra prescripcion."})
        return attrs


class ReporteDosisSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReporteDosis
        fields = "__all__"
        read_only_fields = ("id", "reportada_por", "reportada_en")

    def validate(self, attrs):
        respuesta = attrs.get("respuesta")
        motivo = attrs.get("motivo_no_toma", "")
        if respuesta == ReporteDosis.Respuesta.NO_TOMADA and not motivo:
            raise serializers.ValidationError({"motivo_no_toma": "Indique por que no se tomo la dosis."})
        if respuesta != ReporteDosis.Respuesta.NO_TOMADA and motivo:
            raise serializers.ValidationError({"motivo_no_toma": "El motivo solo aplica a una dosis no tomada."})
        return attrs

    def create(self, validated_data):
        return registrar_reporte_dosis(**validated_data)

