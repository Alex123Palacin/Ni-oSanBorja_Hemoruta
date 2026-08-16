from __future__ import annotations

import uuid

from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import models
from django.db.models import Q
from django.utils import timezone


class Paciente(models.Model):
    class Sexo(models.TextChoices):
        FEMENINO = "F", "Femenino"
        MASCULINO = "M", "Masculino"
        OTRO = "O", "Otro"
        NO_ESPECIFICADO = "N", "No especificado"

    class Estado(models.TextChoices):
        PENDIENTE = "PENDIENTE", "Pendiente"
        ACTIVO = "ACTIVO", "Activo"
        INACTIVO = "INACTIVO", "Inactivo"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    historia_clinica = models.CharField(max_length=32, unique=True)
    dni = models.CharField(max_length=8, unique=True, null=True, blank=True)
    nombres = models.CharField(max_length=120)
    apellidos = models.CharField(max_length=120)
    fecha_nacimiento = models.DateField(null=True, blank=True)
    sexo = models.CharField(max_length=1, choices=Sexo.choices, default=Sexo.NO_ESPECIFICADO)
    grupo_sanguineo = models.CharField(max_length=8, blank=True)
    lugar_nacimiento = models.CharField(max_length=120, blank=True)
    nacionalidad = models.CharField(max_length=80, default="Peruana")
    procedencia = models.CharField(max_length=160, blank=True)
    direccion = models.CharField(max_length=255, blank=True)
    distrito = models.CharField(max_length=100, blank=True)
    idioma_preferido = models.CharField(max_length=40, default="Español")
    estado = models.CharField(max_length=16, choices=Estado.choices, default=Estado.PENDIENTE)
    perfil_completo = models.BooleanField(default=False)
    creado_por = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="pacientes_creados",
    )
    creado_en = models.DateTimeField(auto_now_add=True)
    actualizado_en = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("apellidos", "nombres")
        indexes = [
            models.Index(fields=("apellidos", "nombres"), name="paciente_nombre_idx"),
            models.Index(fields=("estado",), name="paciente_estado_idx"),
        ]

    def __str__(self) -> str:
        return f"{self.nombres} {self.apellidos} ({self.historia_clinica})"

    @property
    def nombre_completo(self) -> str:
        return f"{self.nombres} {self.apellidos}".strip()

    @property
    def edad(self) -> int:
        if not self.fecha_nacimiento:
            return 0
        hoy = timezone.localdate()
        return hoy.year - self.fecha_nacimiento.year - (
            (hoy.month, hoy.day) < (self.fecha_nacimiento.month, self.fecha_nacimiento.day)
        )

    def clean(self) -> None:
        super().clean()
        if self.fecha_nacimiento and self.fecha_nacimiento > timezone.localdate():
            raise ValidationError({"fecha_nacimiento": "La fecha de nacimiento no puede ser futura."})


class TutorPaciente(models.Model):
    class Parentesco(models.TextChoices):
        MADRE = "MADRE", "Madre"
        PADRE = "PADRE", "Padre"
        TUTOR = "TUTOR", "Tutor legal"
        OTRO = "OTRO", "Otro"

    class PreferenciaContacto(models.TextChoices):
        LLAMADA = "LLAMADA", "Llamada"
        APP = "APP", "Aplicacion"
        CORREO = "CORREO", "Correo electronico"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    paciente = models.ForeignKey(Paciente, on_delete=models.CASCADE, related_name="tutores")
    usuario = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="vinculos_tutor",
    )
    nombres = models.CharField(max_length=120)
    apellidos = models.CharField(max_length=120)
    dni = models.CharField(max_length=8, blank=True)
    parentesco = models.CharField(max_length=16, choices=Parentesco.choices)
    telefono_principal = models.CharField(max_length=20)
    telefono_alternativo = models.CharField(max_length=20, blank=True)
    telefono_emergencia = models.CharField(max_length=20, blank=True)
    correo = models.EmailField(blank=True)
    direccion = models.CharField(max_length=255, blank=True)
    distrito = models.CharField(max_length=100, blank=True)
    persona_autorizada_adicional = models.CharField(max_length=200, blank=True)
    preferencia_contacto = models.CharField(
        max_length=16,
        choices=PreferenciaContacto.choices,
        default=PreferenciaContacto.APP,
    )
    es_principal = models.BooleanField(default=False)
    autorizado = models.BooleanField(default=True)
    creado_en = models.DateTimeField(auto_now_add=True)
    actualizado_en = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("-es_principal", "apellidos", "nombres")
        constraints = [
            models.UniqueConstraint(
                fields=("paciente",),
                condition=Q(es_principal=True, autorizado=True),
                name="un_tutor_principal_autorizado",
            ),
            models.UniqueConstraint(
                fields=("paciente", "dni"),
                condition=~Q(dni=""),
                name="tutor_dni_unico_por_paciente",
            ),
        ]

    def __str__(self) -> str:
        return f"{self.nombres} {self.apellidos} - {self.get_parentesco_display()}"


class AsignacionMedica(models.Model):
    class Origen(models.TextChoices):
        AUTOMATICA = "AUTOMATICA", "Asignación automática"
        MANUAL = "MANUAL", "Reasignación manual"
        REEQUILIBRIO = "REEQUILIBRIO", "Reequilibrio asistencial"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    paciente = models.ForeignKey(Paciente, on_delete=models.CASCADE, related_name="asignaciones_medicas")
    medico = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="asignaciones_como_medico",
    )
    es_principal = models.BooleanField(default=True)
    activa = models.BooleanField(default=True)
    fecha_inicio = models.DateField(default=timezone.localdate)
    fecha_fin = models.DateField(null=True, blank=True)
    asignado_por = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="asignaciones_medicas_realizadas",
    )
    origen = models.CharField(
        max_length=16,
        choices=Origen.choices,
        default=Origen.AUTOMATICA,
    )
    motivo = models.CharField(max_length=255, blank=True)
    cerrado_en = models.DateTimeField(null=True, blank=True)
    cerrada_por = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="asignaciones_medicas_cerradas",
    )
    creado_en = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ("-activa", "-es_principal", "-fecha_inicio")
        indexes = [
            models.Index(
                fields=("medico", "activa", "es_principal"),
                name="asig_med_carga_idx",
            ),
            models.Index(
                fields=("paciente", "-creado_en"),
                name="asig_pac_hist_idx",
            ),
        ]
        constraints = [
            models.UniqueConstraint(
                fields=("paciente",),
                condition=Q(activa=True, es_principal=True),
                name="un_medico_principal_activo",
            ),
            models.UniqueConstraint(
                fields=("paciente", "medico"),
                condition=Q(activa=True),
                name="asignacion_medica_activa_unica",
            ),
        ]

    def __str__(self) -> str:
        return f"{self.paciente} - {self.medico}"

    def clean(self) -> None:
        super().clean()
        if getattr(self.medico, "rol", None) != "MEDICO":
            raise ValidationError({"medico": "El usuario asignado debe tener rol MEDICO."})
        if self.fecha_fin and self.fecha_fin < self.fecha_inicio:
            raise ValidationError({"fecha_fin": "La fecha de fin no puede ser anterior al inicio."})
        if self.activa and (self.fecha_fin or self.cerrado_en):
            raise ValidationError(
                "Una asignación activa no puede tener fecha de cierre."
            )


class CuentaMovilPaciente(models.Model):
    class Estado(models.TextChoices):
        PENDIENTE = "PENDIENTE", "Pendiente"
        ACTIVA = "ACTIVA", "Activa"
        SUSPENDIDA = "SUSPENDIDA", "Suspendida"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    paciente = models.OneToOneField(Paciente, on_delete=models.CASCADE, related_name="cuenta_movil")
    usuario = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="cuentas_paciente",
    )
    alias = models.CharField(max_length=80, unique=True)
    estado = models.CharField(max_length=16, choices=Estado.choices, default=Estado.PENDIENTE)
    dispositivo = models.CharField(max_length=120, blank=True)
    ultimo_acceso_en = models.DateTimeField(null=True, blank=True)
    habilitada_en = models.DateTimeField(null=True, blank=True)
    creada_en = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = "cuentas moviles de pacientes"

    def __str__(self) -> str:
        return f"{self.alias} - {self.paciente}"
