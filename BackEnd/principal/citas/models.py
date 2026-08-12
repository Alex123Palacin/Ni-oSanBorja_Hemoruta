from __future__ import annotations

import uuid

from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import models
from django.db.models import F, Q

from pacientes.models import Paciente


class Cita(models.Model):
    class Estado(models.TextChoices):
        PENDIENTE = "PENDIENTE", "Pendiente de confirmacion"
        CONFIRMADA = "CONFIRMADA", "Confirmada"
        COMPLETADA = "COMPLETADA", "Completada"
        CANCELADA = "CANCELADA", "Cancelada"
        NO_ASISTIO = "NO_ASISTIO", "No asistio"

    class Origen(models.TextChoices):
        HOSPITAL = "HOSPITAL", "Hospital"
        FAMILIA = "FAMILIA", "Declarada por la familia"

    class Tipo(models.TextChoices):
        CONSULTA = "CONSULTA", "Consulta medica"
        CONTROL = "CONTROL", "Control"
        LABORATORIO = "LABORATORIO", "Laboratorio"
        PROCEDIMIENTO = "PROCEDIMIENTO", "Procedimiento"
        OTRO = "OTRO", "Otro"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    paciente = models.ForeignKey(Paciente, on_delete=models.CASCADE, related_name="citas")
    medico = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name="citas_como_medico",
    )
    tipo = models.CharField(max_length=20, choices=Tipo.choices, default=Tipo.CONSULTA)
    inicio = models.DateTimeField()
    fin = models.DateTimeField(null=True, blank=True)
    estado = models.CharField(max_length=20, choices=Estado.choices, default=Estado.PENDIENTE)
    origen = models.CharField(max_length=16, choices=Origen.choices, default=Origen.HOSPITAL)
    especialidad = models.CharField(max_length=120, blank=True)
    sede = models.CharField(max_length=160, default="Hospital del Nino San Borja")
    consultorio = models.CharField(max_length=80, blank=True)
    motivo = models.CharField(max_length=240, blank=True)
    observaciones = models.TextField(blank=True)
    creada_por = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="citas_registradas",
    )
    confirmada_por = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="citas_confirmadas",
    )
    confirmada_en = models.DateTimeField(null=True, blank=True)
    creado_en = models.DateTimeField(auto_now_add=True)
    actualizado_en = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("inicio",)
        indexes = [
            models.Index(fields=("paciente", "inicio"), name="cita_paciente_inicio_idx"),
            models.Index(fields=("medico", "inicio"), name="cita_medico_inicio_idx"),
            models.Index(fields=("estado", "inicio"), name="cita_estado_inicio_idx"),
        ]
        constraints = [
            models.CheckConstraint(
                condition=Q(fin__isnull=True) | Q(fin__gt=F("inicio")),
                name="cita_fin_posterior_inicio",
            )
        ]

    def __str__(self) -> str:
        return f"{self.paciente} - {self.inicio:%Y-%m-%d %H:%M}"

    def clean(self) -> None:
        super().clean()
        if self.medico_id and getattr(self.medico, "rol", None) != "MEDICO":
            raise ValidationError({"medico": "El usuario seleccionado no tiene rol MEDICO."})
        if self.fin and self.fin <= self.inicio:
            raise ValidationError({"fin": "La hora final debe ser posterior al inicio."})
        if self.estado == self.Estado.CONFIRMADA and not self.confirmada_en:
            raise ValidationError({"confirmada_en": "Una cita confirmada requiere fecha de confirmacion."})

