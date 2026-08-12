from __future__ import annotations

import uuid

from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import models
from django.db.models import Q
from django.utils import timezone

from pacientes.models import Paciente


class Diagnostico(models.Model):
    class Estado(models.TextChoices):
        ACTIVO = "ACTIVO", "Activo"
        RESUELTO = "RESUELTO", "Resuelto"
        DESCARTADO = "DESCARTADO", "Descartado"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    paciente = models.ForeignKey(Paciente, on_delete=models.CASCADE, related_name="diagnosticos")
    codigo_cie10 = models.CharField(max_length=16, blank=True)
    nombre = models.CharField(max_length=200)
    descripcion = models.TextField(blank=True)
    fecha_diagnostico = models.DateField(default=timezone.localdate)
    es_principal = models.BooleanField(default=False)
    estado = models.CharField(max_length=16, choices=Estado.choices, default=Estado.ACTIVO)
    medico = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="diagnosticos_registrados",
    )
    creado_en = models.DateTimeField(auto_now_add=True)
    actualizado_en = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("-es_principal", "-fecha_diagnostico")
        constraints = [
            models.UniqueConstraint(
                fields=("paciente",),
                condition=Q(es_principal=True, estado="ACTIVO"),
                name="un_diagnostico_principal_activo",
            )
        ]
        indexes = [models.Index(fields=("paciente", "estado"), name="diagnostico_pac_estado_idx")]

    def __str__(self) -> str:
        return f"{self.paciente}: {self.nombre}"

    def clean(self) -> None:
        super().clean()
        if getattr(self.medico, "rol", None) != "MEDICO":
            raise ValidationError({"medico": "El diagnostico debe ser registrado por un medico."})


class ConsultaClinica(models.Model):
    class Estado(models.TextChoices):
        BORRADOR = "BORRADOR", "Borrador"
        COMPLETADA = "COMPLETADA", "Completada"
        ANULADA = "ANULADA", "Anulada"

    class Origen(models.TextChoices):
        MANUAL = "MANUAL", "Registro manual"
        VOZ = "VOZ", "Dictado por voz"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    paciente = models.ForeignKey(Paciente, on_delete=models.PROTECT, related_name="consultas")
    medico = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="consultas_medicas",
    )
    cita = models.OneToOneField(
        "citas.Cita",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="consulta_clinica",
    )
    titulo = models.CharField(max_length=180, default="Consulta medica")
    resumen = models.TextField(blank=True)
    origen = models.CharField(max_length=12, choices=Origen.choices, default=Origen.MANUAL)
    estado = models.CharField(max_length=16, choices=Estado.choices, default=Estado.BORRADOR)
    iniciada_en = models.DateTimeField(default=timezone.now)
    completada_en = models.DateTimeField(null=True, blank=True)
    anulada_en = models.DateTimeField(null=True, blank=True)
    motivo_anulacion = models.TextField(blank=True)
    creado_en = models.DateTimeField(auto_now_add=True)
    actualizado_en = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("-iniciada_en",)
        indexes = [
            models.Index(fields=("paciente", "-iniciada_en"), name="consulta_pac_fecha_idx"),
            models.Index(fields=("estado",), name="consulta_estado_idx"),
        ]

    def __str__(self) -> str:
        return f"{self.titulo} - {self.paciente}"

    def clean(self) -> None:
        super().clean()
        if getattr(self.medico, "rol", None) != "MEDICO":
            raise ValidationError({"medico": "La consulta debe pertenecer a un medico."})
        if self.cita_id and self.cita.paciente_id != self.paciente_id:
            raise ValidationError({"cita": "La cita seleccionada pertenece a otro paciente."})
        if self.estado == self.Estado.COMPLETADA and not self.completada_en:
            raise ValidationError({"completada_en": "Una consulta completada requiere fecha de cierre."})


class SeccionConsulta(models.Model):
    class Tipo(models.TextChoices):
        MOTIVO = "MOTIVO", "Motivo de consulta"
        EVOLUCION = "EVOLUCION", "Evolucion clinica"
        TRATAMIENTO = "TRATAMIENTO", "Tratamiento indicado"
        MEDICACION = "MEDICACION", "Medicacion indicada"
        INDICACIONES = "INDICACIONES", "Indicaciones para casa"
        PROXIMO_CONTROL = "PROXIMO_CONTROL", "Proximo control"
        OTRO = "OTRO", "Otro"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    consulta = models.ForeignKey(ConsultaClinica, on_delete=models.CASCADE, related_name="secciones")
    tipo = models.CharField(max_length=24, choices=Tipo.choices)
    titulo = models.CharField(max_length=160)
    contenido = models.TextField(blank=True)
    orden = models.PositiveSmallIntegerField(default=0)
    creado_en = models.DateTimeField(auto_now_add=True)
    actualizado_en = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("orden", "id")
        constraints = [
            models.UniqueConstraint(fields=("consulta", "tipo"), name="seccion_tipo_unico_por_consulta")
        ]

    def __str__(self) -> str:
        return f"{self.consulta}: {self.titulo}"


class ItemSeccionConsulta(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    seccion = models.ForeignKey(SeccionConsulta, on_delete=models.CASCADE, related_name="items")
    etiqueta = models.CharField(max_length=140, blank=True)
    descripcion = models.TextField()
    valor = models.CharField(max_length=180, blank=True)
    unidad = models.CharField(max_length=40, blank=True)
    orden = models.PositiveSmallIntegerField(default=0)

    class Meta:
        ordering = ("orden", "id")

    def __str__(self) -> str:
        return self.etiqueta or self.descripcion[:80]


class PlanTratamiento(models.Model):
    class Estado(models.TextChoices):
        BORRADOR = "BORRADOR", "Borrador"
        VIGENTE = "VIGENTE", "Vigente"
        FINALIZADO = "FINALIZADO", "Finalizado"
        CANCELADO = "CANCELADO", "Cancelado"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    paciente = models.ForeignKey(Paciente, on_delete=models.PROTECT, related_name="planes_tratamiento")
    consulta_origen = models.ForeignKey(
        ConsultaClinica,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="planes_generados",
    )
    medico = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="planes_tratamiento_indicados",
    )
    nombre = models.CharField(max_length=180, default="Plan de tratamiento")
    indicacion_general = models.TextField(blank=True)
    estado = models.CharField(max_length=16, choices=Estado.choices, default=Estado.BORRADOR)
    vigente_desde = models.DateField(default=timezone.localdate)
    vigente_hasta = models.DateField(null=True, blank=True)
    creado_en = models.DateTimeField(auto_now_add=True)
    actualizado_en = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("-vigente_desde", "-creado_en")
        indexes = [models.Index(fields=("paciente", "estado"), name="plan_pac_estado_idx")]

    def __str__(self) -> str:
        return f"{self.nombre} - {self.paciente}"

    def clean(self) -> None:
        super().clean()
        if getattr(self.medico, "rol", None) != "MEDICO":
            raise ValidationError({"medico": "El plan debe ser indicado por un medico."})
        if self.consulta_origen_id and self.consulta_origen.paciente_id != self.paciente_id:
            raise ValidationError({"consulta_origen": "La consulta pertenece a otro paciente."})
        if self.vigente_hasta and self.vigente_hasta < self.vigente_desde:
            raise ValidationError({"vigente_hasta": "La vigencia final no puede ser anterior al inicio."})


class ItemPlanTratamiento(models.Model):
    class Tipo(models.TextChoices):
        TRATAMIENTO = "TRATAMIENTO", "Tratamiento indicado"
        MEDICACION = "MEDICACION", "Medicacion indicada"
        CUIDADO_CASA = "CUIDADO_CASA", "Indicaciones para casa"
        EXAMEN = "EXAMEN", "Examen solicitado"
        CONTROL = "CONTROL", "Proximo control"
        OTRO = "OTRO", "Otro"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    plan = models.ForeignKey(PlanTratamiento, on_delete=models.CASCADE, related_name="items")
    tipo = models.CharField(max_length=20, choices=Tipo.choices)
    titulo = models.CharField(max_length=160)
    descripcion = models.TextField()
    orden = models.PositiveSmallIntegerField(default=0)

    class Meta:
        ordering = ("orden", "id")

    def __str__(self) -> str:
        return f"{self.get_tipo_display()}: {self.titulo}"

