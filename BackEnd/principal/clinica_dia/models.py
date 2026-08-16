from __future__ import annotations

from datetime import time

from django.conf import settings
from django.core.exceptions import ValidationError
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models
from django.db.models import F, Q

from citas.models import Cita
from nucleo.models import ModeloBaseUUID
from pacientes.models import Paciente


class SolicitudQuimioterapia(ModeloBaseUUID):
    class Prioridad(models.TextChoices):
        ALTA = "ALTA", "Alta"
        MEDIA = "MEDIA", "Media"
        BAJA = "BAJA", "Baja"

    class Estado(models.TextChoices):
        PENDIENTE = "PENDIENTE", "Pendiente de programación"
        PROGRAMADA = "PROGRAMADA", "Programada"
        CONFIRMADA = "CONFIRMADA", "Confirmada"
        COMPLETADA = "COMPLETADA", "Completada"
        CANCELADA = "CANCELADA", "Cancelada"

    class Origen(models.TextChoices):
        IMPORTACION = "IMPORTACION", "Importación XLSX"
        MANUAL = "MANUAL", "Registro manual"

    paciente = models.ForeignKey(
        Paciente,
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name="solicitudes_quimioterapia",
    )
    dni = models.CharField(max_length=8, db_index=True)
    nombre_completo_importado = models.CharField(max_length=241)
    historia_clinica_importada = models.CharField(max_length=32, blank=True)
    fecha_nacimiento_importada = models.DateField(null=True, blank=True)
    telefono = models.CharField(max_length=20, blank=True)
    procedencia = models.CharField(max_length=160)
    diagnostico = models.CharField(max_length=240, blank=True)
    protocolo = models.CharField(max_length=240, blank=True)
    prioridad = models.CharField(
        max_length=8,
        choices=Prioridad.choices,
        default=Prioridad.MEDIA,
        db_index=True,
    )
    fecha_preferida = models.DateField(null=True, blank=True, db_index=True)
    hora_preferida = models.TimeField(null=True, blank=True)
    duracion_minutos = models.PositiveSmallIntegerField(
        validators=(MinValueValidator(15), MaxValueValidator(210)),
    )
    estado = models.CharField(
        max_length=16,
        choices=Estado.choices,
        default=Estado.PENDIENTE,
        db_index=True,
    )
    origen = models.CharField(max_length=16, choices=Origen.choices)
    codigo_externo = models.CharField(max_length=80, null=True, blank=True, unique=True)
    lote_importacion = models.UUIDField(null=True, blank=True, db_index=True)
    fila_importacion = models.PositiveIntegerField(null=True, blank=True)
    huella_importacion = models.CharField(max_length=64, null=True, blank=True, unique=True)
    observaciones = models.TextField(blank=True)
    creada_por = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="solicitudes_quimioterapia_creadas",
    )

    class Meta:
        ordering = ("-prioridad", "fecha_preferida", "creado_en")
        indexes = [
            models.Index(
                fields=("estado", "prioridad", "fecha_preferida"),
                name="quim_sol_pendiente_idx",
            ),
        ]
        constraints = [
            models.CheckConstraint(
                condition=Q(duracion_minutos__gte=15, duracion_minutos__lte=210),
                name="quim_sol_duracion_rango",
            ),
        ]

    def __str__(self) -> str:
        return f"{self.nombre_completo} - {self.protocolo}"

    @property
    def nombre_completo(self) -> str:
        if self.paciente_id:
            return self.paciente.nombre_completo
        return self.nombre_completo_importado


class ProgramacionQuimioterapia(ModeloBaseUUID):
    class Turno(models.TextChoices):
        T1 = "T1", "08:00 - 11:00"
        T2 = "T2", "11:00 - 14:00"
        T3 = "T3", "14:00 - 17:30"

    class Estado(models.TextChoices):
        PROGRAMADA = "PROGRAMADA", "Programada"
        CONFIRMADA = "CONFIRMADA", "Confirmada"
        COMPLETADA = "COMPLETADA", "Completada"
        CANCELADA = "CANCELADA", "Cancelada"

    class Origen(models.TextChoices):
        AUTOMATICA = "AUTOMATICA", "Agenda automática"
        MANUAL = "MANUAL", "Programación manual"
        AJUSTE = "AJUSTE", "Ajuste administrativo"

    class EstadoRecordatorio(models.TextChoices):
        PENDIENTE = "PENDIENTE", "Pendiente"
        ENVIADO = "ENVIADO", "Enviado"
        NO_REQUERIDO = "NO_REQUERIDO", "No requerido"

    solicitud = models.ForeignKey(
        SolicitudQuimioterapia,
        on_delete=models.PROTECT,
        related_name="programaciones",
    )
    cita = models.OneToOneField(
        Cita,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="programacion_quimioterapia",
    )
    fecha = models.DateField(db_index=True)
    turno = models.CharField(max_length=2, choices=Turno.choices)
    hora_inicio = models.TimeField()
    hora_fin = models.TimeField()
    cama = models.PositiveSmallIntegerField(
        validators=(MinValueValidator(1), MaxValueValidator(8)),
    )
    estado = models.CharField(
        max_length=16,
        choices=Estado.choices,
        default=Estado.PROGRAMADA,
        db_index=True,
    )
    origen = models.CharField(max_length=12, choices=Origen.choices)
    observaciones = models.TextField(blank=True)
    programada_por = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="quimioterapias_programadas",
    )
    confirmada_en = models.DateTimeField(null=True, blank=True)
    confirmada_por = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="quimioterapias_confirmadas",
    )
    cancelada_en = models.DateTimeField(null=True, blank=True)
    cancelada_por = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="quimioterapias_canceladas",
    )
    motivo_cancelacion = models.CharField(max_length=255, blank=True)
    recordatorio_estado = models.CharField(
        max_length=16,
        choices=EstadoRecordatorio.choices,
        default=EstadoRecordatorio.PENDIENTE,
        db_index=True,
    )
    recordatorio_en = models.DateTimeField(null=True, blank=True)
    recordatorio_por = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="recordatorios_quimioterapia_marcados",
    )
    recordatorio_observacion = models.CharField(max_length=255, blank=True)

    class Meta:
        ordering = ("fecha", "hora_inicio", "cama")
        indexes = [
            models.Index(fields=("fecha", "turno", "estado"), name="quim_prog_agenda_idx"),
            models.Index(
                fields=("recordatorio_estado", "fecha"),
                name="quim_prog_record_idx",
            ),
        ]
        constraints = [
            models.CheckConstraint(
                condition=Q(cama__gte=1, cama__lte=8),
                name="quim_prog_cama_rango",
            ),
            models.CheckConstraint(
                condition=Q(hora_fin__gt=F("hora_inicio")),
                name="quim_prog_horas_validas",
            ),
            models.UniqueConstraint(
                fields=("fecha", "turno", "cama"),
                condition=~Q(estado="CANCELADA"),
                name="quim_prog_slot_unico",
            ),
            models.UniqueConstraint(
                fields=("solicitud",),
                condition=~Q(estado="CANCELADA"),
                name="quim_prog_solicitud_activa",
            ),
        ]

    def __str__(self) -> str:
        return f"{self.fecha} {self.turno} - Cama {self.cama}"

    def clean(self) -> None:
        super().clean()
        horario = HORARIOS_TURNO.get(self.turno)
        if horario and (self.hora_inicio, self.hora_fin) != horario[:2]:
            raise ValidationError("Las horas deben corresponder al turno seleccionado.")
        if horario and self.solicitud_id and self.solicitud.duracion_minutos > horario[2]:
            raise ValidationError(
                {"turno": "La duración de la solicitud excede la capacidad del turno."}
            )


class CambioProgramacionQuimioterapia(ModeloBaseUUID):
    class Accion(models.TextChoices):
        CREADA = "CREADA", "Creada"
        AJUSTADA = "AJUSTADA", "Ajustada"
        CONFIRMADA = "CONFIRMADA", "Confirmada"
        COMPLETADA = "COMPLETADA", "Completada"
        CANCELADA = "CANCELADA", "Cancelada"
        RECORDATORIO = "RECORDATORIO", "Recordatorio actualizado"

    programacion = models.ForeignKey(
        ProgramacionQuimioterapia,
        on_delete=models.CASCADE,
        related_name="historial",
    )
    accion = models.CharField(max_length=16, choices=Accion.choices)
    datos_anteriores = models.JSONField(default=dict, blank=True)
    datos_nuevos = models.JSONField(default=dict, blank=True)
    motivo = models.CharField(max_length=255, blank=True)
    realizada_por = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="cambios_programacion_quimioterapia",
    )

    class Meta:
        ordering = ("-creado_en",)


HORARIOS_TURNO = {
    ProgramacionQuimioterapia.Turno.T1: (time(8, 0), time(11, 0), 180),
    ProgramacionQuimioterapia.Turno.T2: (time(11, 0), time(14, 0), 180),
    ProgramacionQuimioterapia.Turno.T3: (time(14, 0), time(17, 30), 210),
}
