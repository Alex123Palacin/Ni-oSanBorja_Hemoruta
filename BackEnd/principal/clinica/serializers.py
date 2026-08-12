from rest_framework import serializers

from .models import (
    ConsultaClinica,
    Diagnostico,
    ItemPlanTratamiento,
    ItemSeccionConsulta,
    PlanTratamiento,
    SeccionConsulta,
)


class DiagnosticoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Diagnostico
        fields = "__all__"
        read_only_fields = ("id", "medico", "creado_en", "actualizado_en")

    def validate(self, attrs):
        if self.instance and "paciente" in attrs and attrs["paciente"].pk != self.instance.paciente_id:
            raise serializers.ValidationError({"paciente": "No se puede trasladar un diagnostico de paciente."})
        return attrs


class ItemSeccionConsultaSerializer(serializers.ModelSerializer):
    class Meta:
        model = ItemSeccionConsulta
        fields = "__all__"
        read_only_fields = ("id",)

    def validate(self, attrs):
        if self.instance and "seccion" in attrs and attrs["seccion"].pk != self.instance.seccion_id:
            raise serializers.ValidationError({"seccion": "No se puede trasladar el item a otra seccion."})
        return attrs


class SeccionConsultaSerializer(serializers.ModelSerializer):
    items = ItemSeccionConsultaSerializer(many=True, read_only=True)

    class Meta:
        model = SeccionConsulta
        fields = "__all__"
        read_only_fields = ("id", "creado_en", "actualizado_en")

    def validate(self, attrs):
        if self.instance and "consulta" in attrs and attrs["consulta"].pk != self.instance.consulta_id:
            raise serializers.ValidationError({"consulta": "No se puede trasladar la seccion a otra consulta."})
        return attrs


class ConsultaClinicaSerializer(serializers.ModelSerializer):
    secciones = SeccionConsultaSerializer(many=True, read_only=True)
    medico_nombre = serializers.SerializerMethodField()

    class Meta:
        model = ConsultaClinica
        fields = "__all__"
        read_only_fields = ("id", "medico", "creado_en", "actualizado_en")

    def get_medico_nombre(self, obj) -> str:
        return obj.medico.get_full_name() or obj.medico.get_username()

    def validate(self, attrs):
        cita = attrs.get("cita", getattr(self.instance, "cita", None))
        paciente = attrs.get("paciente", getattr(self.instance, "paciente", None))
        if cita and paciente and cita.paciente_id != paciente.id:
            raise serializers.ValidationError({"cita": "La cita pertenece a otro paciente."})
        if self.instance and paciente and paciente.pk != self.instance.paciente_id:
            raise serializers.ValidationError({"paciente": "No se puede trasladar una consulta de paciente."})
        estado = attrs.get("estado", getattr(self.instance, "estado", None))
        completada_en = attrs.get("completada_en", getattr(self.instance, "completada_en", None))
        if estado == ConsultaClinica.Estado.COMPLETADA and not completada_en:
            raise serializers.ValidationError({"completada_en": "Indique la fecha de cierre."})
        return attrs


class ItemPlanTratamientoSerializer(serializers.ModelSerializer):
    class Meta:
        model = ItemPlanTratamiento
        fields = "__all__"
        read_only_fields = ("id",)

    def validate(self, attrs):
        if self.instance and "plan" in attrs and attrs["plan"].pk != self.instance.plan_id:
            raise serializers.ValidationError({"plan": "No se puede trasladar el item a otro plan."})
        return attrs


class PlanTratamientoSerializer(serializers.ModelSerializer):
    items = ItemPlanTratamientoSerializer(many=True, read_only=True)
    medico_nombre = serializers.SerializerMethodField()

    class Meta:
        model = PlanTratamiento
        fields = "__all__"
        read_only_fields = ("id", "medico", "creado_en", "actualizado_en")

    def get_medico_nombre(self, obj) -> str:
        return obj.medico.get_full_name() or obj.medico.get_username()

    def validate(self, attrs):
        consulta = attrs.get("consulta_origen", getattr(self.instance, "consulta_origen", None))
        paciente = attrs.get("paciente", getattr(self.instance, "paciente", None))
        if consulta and paciente and consulta.paciente_id != paciente.id:
            raise serializers.ValidationError({"consulta_origen": "La consulta pertenece a otro paciente."})
        if self.instance and paciente and paciente.pk != self.instance.paciente_id:
            raise serializers.ValidationError({"paciente": "No se puede trasladar un plan de paciente."})
        desde = attrs.get("vigente_desde", getattr(self.instance, "vigente_desde", None))
        hasta = attrs.get("vigente_hasta", getattr(self.instance, "vigente_hasta", None))
        if desde and hasta and hasta < desde:
            raise serializers.ValidationError({"vigente_hasta": "La fecha final no puede ser anterior al inicio."})
        return attrs
