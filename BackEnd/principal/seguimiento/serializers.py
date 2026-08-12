from rest_framework import serializers

from .models import (
    AlertaSeguimiento,
    CatalogoSintoma,
    EventoSeguimiento,
    ReporteSintomas,
    SemaforoPaciente,
    SintomaReportado,
)
from .services import registrar_reporte_sintomas


class CatalogoSintomaSerializer(serializers.ModelSerializer):
    class Meta:
        model = CatalogoSintoma
        fields = "__all__"
        read_only_fields = ("id",)


class SintomaReportadoSerializer(serializers.ModelSerializer):
    nombre = serializers.CharField(source="sintoma.nombre", read_only=True)

    class Meta:
        model = SintomaReportado
        fields = "__all__"
        read_only_fields = ("id",)


class ReporteSintomasSerializer(serializers.ModelSerializer):
    sintomas = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=CatalogoSintoma.objects.filter(activo=True),
        write_only=True,
    )
    sintomas_reportados = SintomaReportadoSerializer(many=True, read_only=True)

    class Meta:
        model = ReporteSintomas
        fields = "__all__"
        read_only_fields = ("id", "reportado_por", "reportado_en")

    def validate_sintomas(self, sintomas):
        if not sintomas:
            raise serializers.ValidationError("Seleccione al menos un sintoma.")
        if len({sintoma.pk for sintoma in sintomas}) != len(sintomas):
            raise serializers.ValidationError("No repita sintomas en el mismo reporte.")
        return sintomas

    def create(self, validated_data):
        sintomas = validated_data.pop("sintomas")
        return registrar_reporte_sintomas(sintomas=sintomas, **validated_data)


class EventoSeguimientoSerializer(serializers.ModelSerializer):
    class Meta:
        model = EventoSeguimiento
        fields = "__all__"
        read_only_fields = ("id", "registrado_por", "creado_en", "actualizado_en")


class SemaforoPacienteSerializer(serializers.ModelSerializer):
    class Meta:
        model = SemaforoPaciente
        fields = "__all__"
        read_only_fields = ("id", "determinado_por", "vigente_desde", "vigente_hasta", "es_actual")


class AlertaSeguimientoSerializer(serializers.ModelSerializer):
    class Meta:
        model = AlertaSeguimiento
        fields = "__all__"
        read_only_fields = ("id", "abierta_en", "resuelta_en", "resuelta_por")

