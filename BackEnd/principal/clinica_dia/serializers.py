from __future__ import annotations

from datetime import time

from django.utils import timezone
from rest_framework import serializers

from pacientes.models import Paciente

from .models import ProgramacionQuimioterapia, SolicitudQuimioterapia
from .services import es_dia_habil


class PacienteClinicaDiaSerializer(serializers.ModelSerializer):
    nombre_completo = serializers.CharField(read_only=True)

    class Meta:
        model = Paciente
        fields = ("id", "historia_clinica", "nombre_completo")


class SolicitudQuimioterapiaSerializer(serializers.ModelSerializer):
    paciente = PacienteClinicaDiaSerializer(read_only=True)
    nombre_completo = serializers.CharField(read_only=True)
    codigo_externo = serializers.SerializerMethodField()

    class Meta:
        model = SolicitudQuimioterapia
        fields = (
            "id",
            "codigo_externo",
            "paciente",
            "dni",
            "nombre_completo",
            "historia_clinica_importada",
            "telefono",
            "procedencia",
            "diagnostico",
            "protocolo",
            "prioridad",
            "fecha_preferida",
            "hora_preferida",
            "duracion_minutos",
            "estado",
            "origen",
            "observaciones",
            "creado_en",
            "actualizado_en",
        )

    def get_codigo_externo(self, obj) -> str:
        return obj.codigo_externo or ""


class ProgramacionQuimioterapiaSerializer(serializers.ModelSerializer):
    solicitud = SolicitudQuimioterapiaSerializer(read_only=True)
    turno_etiqueta = serializers.CharField(source="get_turno_display", read_only=True)

    class Meta:
        model = ProgramacionQuimioterapia
        fields = (
            "id",
            "solicitud",
            "fecha",
            "turno",
            "turno_etiqueta",
            "hora_inicio",
            "hora_fin",
            "cama",
            "estado",
            "origen",
            "observaciones",
            "confirmada_en",
            "recordatorio_estado",
            "recordatorio_en",
            "recordatorio_observacion",
            "creado_en",
            "actualizado_en",
        )


class SolicitudQuimioterapiaCrearSerializer(serializers.Serializer):
    paciente_id = serializers.PrimaryKeyRelatedField(
        source="paciente",
        queryset=Paciente.objects.all(),
        required=False,
        allow_null=True,
    )
    codigo_solicitud = serializers.CharField(max_length=80, required=False, allow_blank=True)
    dni = serializers.RegexField(r"^\d{8}$")
    nombres_completos = serializers.CharField(max_length=241)
    historia_clinica = serializers.CharField(max_length=32, required=False, allow_blank=True)
    telefono = serializers.CharField(max_length=20, required=False, allow_blank=True)
    procedencia = serializers.CharField(max_length=160)
    diagnostico = serializers.CharField(max_length=240, required=False, allow_blank=True)
    protocolo_quimioterapia = serializers.CharField(
        max_length=240, required=False, allow_blank=True
    )
    prioridad = serializers.ChoiceField(
        choices=SolicitudQuimioterapia.Prioridad.choices,
        default=SolicitudQuimioterapia.Prioridad.MEDIA,
    )
    fecha_solicitada = serializers.DateField(required=False, allow_null=True)
    hora_preferida = serializers.TimeField(required=False, allow_null=True)
    duracion_horas = serializers.DecimalField(max_digits=3, decimal_places=2)
    observaciones = serializers.CharField(required=False, allow_blank=True)

    def validate_duracion_horas(self, valor):
        minutos = int(valor * 60)
        if minutos < 15 or minutos > 210 or valor * 60 != minutos:
            raise serializers.ValidationError(
                "Debe equivaler a una cantidad exacta entre 15 y 210 minutos."
            )
        return valor

    def validate_fecha_solicitada(self, valor):
        if valor and not es_dia_habil(valor):
            raise serializers.ValidationError("Debe ser un día hábil, de lunes a viernes.")
        return valor

    def validate_hora_preferida(self, valor):
        if valor and not (time(8, 0) <= valor < time(17, 30)):
            raise serializers.ValidationError("Debe estar entre las 08:00 y las 17:29.")
        return valor

    def validate(self, attrs):
        paciente_indicado = attrs.get("paciente")
        dni = attrs["dni"]
        historia = attrs.get("historia_clinica", "").strip()
        paciente_por_dni = Paciente.objects.filter(dni=dni).first()
        paciente_por_historia = (
            Paciente.objects.filter(historia_clinica=historia).first() if historia else None
        )
        candidatos = {
            paciente.pk: paciente
            for paciente in (paciente_indicado, paciente_por_dni, paciente_por_historia)
            if paciente
        }
        if len(candidatos) > 1:
            raise serializers.ValidationError(
                "El paciente, DNI e historia clínica no corresponden a la misma ficha."
            )
        paciente = next(iter(candidatos.values()), None)
        if paciente and paciente.dni and paciente.dni != dni:
            raise serializers.ValidationError({"dni": "No coincide con la ficha del paciente."})
        if paciente and historia and paciente.historia_clinica != historia:
            raise serializers.ValidationError(
                {"historia_clinica": "No coincide con la ficha del paciente."}
            )
        attrs["paciente"] = paciente
        codigo = attrs.get("codigo_solicitud", "").strip()
        if codigo and SolicitudQuimioterapia.objects.filter(codigo_externo=codigo).exists():
            raise serializers.ValidationError(
                {"codigo_solicitud": "Ya existe una solicitud con este código."}
            )
        return attrs

    def create(self, validated_data):
        paciente = validated_data.pop("paciente", None)
        duracion_horas = validated_data.pop("duracion_horas")
        return SolicitudQuimioterapia.objects.create(
            paciente=paciente,
            dni=validated_data["dni"],
            nombre_completo_importado=validated_data["nombres_completos"].strip(),
            historia_clinica_importada=validated_data.get("historia_clinica", "").strip(),
            telefono=validated_data.get("telefono", "").strip(),
            procedencia=validated_data.get("procedencia", "").strip(),
            diagnostico=validated_data.get("diagnostico", "").strip(),
            protocolo=validated_data.get("protocolo_quimioterapia", "").strip(),
            prioridad=validated_data["prioridad"],
            fecha_preferida=validated_data.get("fecha_solicitada"),
            hora_preferida=validated_data.get("hora_preferida"),
            duracion_minutos=int(duracion_horas * 60),
            observaciones=validated_data.get("observaciones", "").strip(),
            codigo_externo=validated_data.get("codigo_solicitud") or None,
            origen=SolicitudQuimioterapia.Origen.MANUAL,
            creada_por=self.context["request"].user,
        )


class ImportarSolicitudesSerializer(serializers.Serializer):
    archivo = serializers.FileField()

    def validate_archivo(self, archivo):
        if not archivo.name.lower().endswith(".xlsx"):
            raise serializers.ValidationError("Solo se admite un archivo XLSX.")
        if archivo.size > 5 * 1024 * 1024:
            raise serializers.ValidationError("El archivo no debe superar 5 MB.")
        return archivo


class GenerarAgendaSerializer(serializers.Serializer):
    fecha_desde = serializers.DateField(default=timezone.localdate)
    fecha_hasta = serializers.DateField(required=False, allow_null=True)
    solicitud_ids = serializers.ListField(
        child=serializers.UUIDField(), required=False, allow_empty=False
    )


class ProgramarSolicitudSerializer(serializers.Serializer):
    solicitud_id = serializers.PrimaryKeyRelatedField(
        source="solicitud", queryset=SolicitudQuimioterapia.objects.all()
    )
    fecha = serializers.DateField()
    turno = serializers.ChoiceField(choices=ProgramacionQuimioterapia.Turno.choices)
    cama = serializers.IntegerField(min_value=1, max_value=8)
    observaciones = serializers.CharField(required=False, allow_blank=True)
    crear_recordatorio = serializers.BooleanField(default=True)


class AjustarProgramacionSerializer(serializers.Serializer):
    solicitud_id = serializers.PrimaryKeyRelatedField(
        source="solicitud_nueva",
        queryset=SolicitudQuimioterapia.objects.all(),
        required=False,
    )
    fecha = serializers.DateField(required=False)
    turno = serializers.ChoiceField(
        choices=ProgramacionQuimioterapia.Turno.choices, required=False
    )
    cama = serializers.IntegerField(min_value=1, max_value=8, required=False)
    motivo = serializers.CharField(max_length=255)
    crear_recordatorio = serializers.BooleanField(required=False)

    def validate(self, attrs):
        if not any(campo in attrs for campo in ("solicitud_nueva", "fecha", "turno", "cama")):
            raise serializers.ValidationError("Indique al menos un cambio de programación.")
        return attrs


class CancelarProgramacionSerializer(serializers.Serializer):
    motivo = serializers.CharField(max_length=255)
    reprogramar = serializers.BooleanField(default=False)


class RecordatorioSerializer(serializers.Serializer):
    estado = serializers.ChoiceField(
        choices=ProgramacionQuimioterapia.EstadoRecordatorio.choices
    )
    observacion = serializers.CharField(max_length=255, required=False, allow_blank=True)


class ConfirmarAgendaSerializer(serializers.Serializer):
    fecha = serializers.DateField()
