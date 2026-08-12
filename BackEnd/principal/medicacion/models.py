from __future__ import annotations

import uuid

from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import models
from django.db.models import F, Q
from django.utils import timezone

from clinica.models import ConsultaClinica, PlanTratamiento
from pacientes.models import Paciente


class Medicamento(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    nombre_generico = models.CharField(max_length=160)
    nombre_comercial = models.CharField(max_length=160, blank=True)
    forma_farmaceutica = models.CharField(max_length=80, blank=True)
    concentracion = models.CharField(max_length=80, blank=True)
    codigo = models.CharField(max_length=40, unique=True, null=True, blank=True)
    activo = models.BooleanField(default=True)
    creado_en = models.DateTimeField(auto_now_add=True)
    actualizado_en = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("nombre_generico", "concentracion")
        constraints = [
            models.UniqueConstraint(
                fields=("nombre_generico", "forma_farmaceutica", "concentracion"),
                name="medicamento_presentacion_unica",
            )
        ]

    def __str__(self) -> str:
        presentacion = " ".join(filter(None, (self.concentracion, self.forma_farmaceutica)))
        return f"{self.nombre_generico} {presentacion}".strip()


class Prescripcion(models.Model):
    class Estado(models.TextChoices):
        BORRADOR = "BORRADOR", "Borrador"
        ACTIVA = "ACTIVA", "Activa"
        PAUSADA = "PAUSADA", "Pausada"
        FINALIZADA = "FINALIZADA", "Finalizada"
        CANCELADA = "CANCELADA", "Cancelada"

    class Via(models.TextChoices):
        ORAL = "ORAL", "Oral"
        INTRAVENOSA = "INTRAVENOSA", "Intravenosa"
        SUBCUTANEA = "SUBCUTANEA", "Subcutanea"
        INTRAMUSCULAR = "INTRAMUSCULAR", "Intramuscular"
        TOPICA = "TOPICA", "Topica"
        OTRA = "OTRA", "Otra"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    paciente = models.ForeignKey(Paciente, on_delete=models.PROTECT, related_name="prescripciones")
    medicamento = models.ForeignKey(Medicamento, on_delete=models.PROTECT, related_name="prescripciones")
    consulta = models.ForeignKey(
        ConsultaClinica,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="prescripciones",
    )
    plan_tratamiento = models.ForeignKey(
        PlanTratamiento,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="prescripciones",
    )
    medico = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="prescripciones_indicadas",
    )
    cantidad_dosis = models.DecimalField(max_digits=8, decimal_places=2)
    unidad_dosis = models.CharField(max_length=30)
    via = models.CharField(max_length=20, choices=Via.choices, default=Via.ORAL)
    frecuencia_texto = models.CharField(max_length=160)
    indicaciones = models.TextField(blank=True)
    fecha_inicio = models.DateField(default=timezone.localdate)
    fecha_fin = models.DateField(null=True, blank=True)
    estado = models.CharField(max_length=16, choices=Estado.choices, default=Estado.BORRADOR)
    creado_en = models.DateTimeField(auto_now_add=True)
    actualizado_en = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("-fecha_inicio", "medicamento__nombre_generico")
        indexes = [models.Index(fields=("paciente", "estado"), name="prescripcion_pac_estado_idx")]

    def __str__(self) -> str:
        return f"{self.medicamento} - {self.paciente}"

    def clean(self) -> None:
        super().clean()
        if getattr(self.medico, "rol", None) != "MEDICO":
            raise ValidationError({"medico": "La prescripcion debe ser indicada por un medico."})
        if self.consulta_id and self.consulta.paciente_id != self.paciente_id:
            raise ValidationError({"consulta": "La consulta pertenece a otro paciente."})
        if self.plan_tratamiento_id and self.plan_tratamiento.paciente_id != self.paciente_id:
            raise ValidationError({"plan_tratamiento": "El plan pertenece a otro paciente."})
        if self.fecha_fin and self.fecha_fin < self.fecha_inicio:
            raise ValidationError({"fecha_fin": "La fecha final no puede ser anterior al inicio."})
        if self.cantidad_dosis <= 0:
            raise ValidationError({"cantidad_dosis": "La dosis debe ser mayor que cero."})


class HorarioPrescripcion(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    prescripcion = models.ForeignKey(Prescripcion, on_delete=models.CASCADE, related_name="horarios")
    hora = models.TimeField(null=True, blank=True)
    intervalo_horas = models.PositiveSmallIntegerField(null=True, blank=True)
    zona_horaria = models.CharField(max_length=64, default="America/Lima")
    activo = models.BooleanField(default=True)

    class Meta:
        ordering = ("hora", "intervalo_horas")
        constraints = [
            models.CheckConstraint(
                condition=Q(hora__isnull=False) | Q(intervalo_horas__isnull=False),
                name="horario_hora_o_intervalo",
            ),
            models.UniqueConstraint(
                fields=("prescripcion", "hora"),
                condition=Q(hora__isnull=False, activo=True),
                name="horario_hora_activa_unica",
            ),
        ]

    def __str__(self) -> str:
        return f"{self.prescripcion} - {self.hora or self.intervalo_horas}"


class DiaHorarioPrescripcion(models.Model):
    class Dia(models.IntegerChoices):
        LUNES = 0, "Lunes"
        MARTES = 1, "Martes"
        MIERCOLES = 2, "Miercoles"
        JUEVES = 3, "Jueves"
        VIERNES = 4, "Viernes"
        SABADO = 5, "Sabado"
        DOMINGO = 6, "Domingo"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    horario = models.ForeignKey(HorarioPrescripcion, on_delete=models.CASCADE, related_name="dias")
    dia_semana = models.PositiveSmallIntegerField(choices=Dia.choices)

    class Meta:
        ordering = ("dia_semana",)
        constraints = [
            models.UniqueConstraint(fields=("horario", "dia_semana"), name="dia_unico_por_horario")
        ]


class DosisProgramada(models.Model):
    class Estado(models.TextChoices):
        PENDIENTE = "PENDIENTE", "Pendiente"
        TOMADA = "TOMADA", "Tomada"
        TARDE = "TARDE", "Tomada tarde"
        OMITIDA = "OMITIDA", "No tomada"
        CANCELADA = "CANCELADA", "Cancelada"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    prescripcion = models.ForeignKey(Prescripcion, on_delete=models.CASCADE, related_name="dosis_programadas")
    horario = models.ForeignKey(
        HorarioPrescripcion,
        on_delete=models.PROTECT,
        related_name="dosis_programadas",
    )
    programada_para = models.DateTimeField()
    estado = models.CharField(max_length=16, choices=Estado.choices, default=Estado.PENDIENTE)
    actualizado_en = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("programada_para",)
        constraints = [
            models.UniqueConstraint(
                fields=("prescripcion", "programada_para"),
                name="dosis_programada_unica",
            )
        ]
        indexes = [models.Index(fields=("estado", "programada_para"), name="dosis_estado_fecha_idx")]

    def __str__(self) -> str:
        return f"{self.prescripcion} - {self.programada_para}"

    def clean(self) -> None:
        super().clean()
        if self.horario_id and self.horario.prescripcion_id != self.prescripcion_id:
            raise ValidationError({"horario": "El horario pertenece a otra prescripcion."})


class ReporteDosis(models.Model):
    class Respuesta(models.TextChoices):
        TOMADA = "TOMADA", "Si la tomo"
        TARDE = "TARDE", "La tomo tarde"
        NO_TOMADA = "NO_TOMADA", "No la tomo"

    class MotivoNoToma(models.TextChoices):
        OLVIDO = "OLVIDO", "Olvido"
        SIN_MEDICAMENTO = "SIN_MEDICAMENTO", "No habia medicamento"
        MALESTAR = "MALESTAR", "Malestar"
        OTRO = "OTRO", "Otro"

    class Origen(models.TextChoices):
        APP = "APP", "Aplicacion movil"
        WEB = "WEB", "Portal web"
        MEDICO = "MEDICO", "Medico"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    dosis_programada = models.OneToOneField(
        DosisProgramada,
        on_delete=models.PROTECT,
        related_name="reporte",
    )
    respuesta = models.CharField(max_length=16, choices=Respuesta.choices)
    motivo_no_toma = models.CharField(max_length=24, choices=MotivoNoToma.choices, blank=True)
    observacion = models.CharField(max_length=250, blank=True)
    ocurrida_en = models.DateTimeField()
    reportada_por = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="reportes_dosis",
    )
    origen = models.CharField(max_length=12, choices=Origen.choices, default=Origen.APP)
    reportada_en = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ("-reportada_en",)

    def __str__(self) -> str:
        return f"{self.dosis_programada} - {self.get_respuesta_display()}"

    def clean(self) -> None:
        super().clean()
        if self.respuesta == self.Respuesta.NO_TOMADA and not self.motivo_no_toma:
            raise ValidationError({"motivo_no_toma": "Indique por que no se tomo la dosis."})
        if self.respuesta != self.Respuesta.NO_TOMADA and self.motivo_no_toma:
            raise ValidationError({"motivo_no_toma": "El motivo solo aplica a una dosis no tomada."})

