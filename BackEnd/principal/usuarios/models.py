import uuid
from pathlib import Path

from django.conf import settings
from django.contrib.auth.models import AbstractUser
from django.core.exceptions import ValidationError
from django.db import models

from nucleo.models import ModeloBaseUUID

from .managers import UsuarioManager


def ruta_foto_perfil(usuario, nombre_archivo):
    extension = Path(nombre_archivo).suffix.lower().lstrip(".") or "jpg"
    return f"perfiles/{usuario.id}/{uuid.uuid4().hex}.{extension}"


class Usuario(AbstractUser, ModeloBaseUUID):
    class Rol(models.TextChoices):
        ADMINISTRADOR = "ADMINISTRADOR", "Administrador"
        MEDICO = "MEDICO", "Médico"
        PACIENTE = "PACIENTE", "Paciente o responsable"

    class Estado(models.TextChoices):
        PENDIENTE = "PENDIENTE", "Pendiente"
        ACTIVO = "ACTIVO", "Activo"
        INACTIVO = "INACTIVO", "Inactivo"
        BLOQUEADO = "BLOQUEADO", "Bloqueado"

    email = models.EmailField("correo electrónico", unique=True, null=True, blank=True)
    dni = models.CharField("DNI", max_length=8, unique=True, null=True, blank=True)
    telefono = models.CharField("teléfono", max_length=20, blank=True)
    foto_perfil = models.FileField(
        "foto de perfil",
        upload_to=ruta_foto_perfil,
        blank=True,
        null=True,
    )
    rol = models.CharField(max_length=20, choices=Rol.choices, default=Rol.PACIENTE)
    estado = models.CharField(
        max_length=12,
        choices=Estado.choices,
        default=Estado.PENDIENTE,
    )
    requiere_cambio_password = models.BooleanField(default=True)
    is_active = models.BooleanField(
        "activo",
        default=False,
        help_text="Indica si la cuenta puede autenticarse.",
    )

    objects = UsuarioManager()

    class Meta:
        ordering = ("first_name", "last_name", "username")
        indexes = [
            models.Index(fields=("rol", "estado"), name="usuario_rol_estado_idx"),
        ]
        verbose_name = "usuario"
        verbose_name_plural = "usuarios"

    def __str__(self):
        nombre = self.get_full_name().strip()
        return nombre or self.username

    @property
    def nombre_completo(self):
        return self.get_full_name().strip() or self.username


class PerfilMedico(ModeloBaseUUID):
    class EstadoLaboral(models.TextChoices):
        ACTIVO = "ACTIVO", "Activo"
        INACTIVO = "INACTIVO", "Inactivo"

    usuario = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="perfil_medico",
    )
    numero_colegiatura = models.CharField(
        "número de colegiatura",
        max_length=30,
        unique=True,
        null=True,
        blank=True,
    )
    especialidad = models.CharField(max_length=120, blank=True)
    cargo = models.CharField(max_length=120, blank=True)
    estado_laboral = models.CharField(
        max_length=10,
        choices=EstadoLaboral.choices,
        default=EstadoLaboral.ACTIVO,
    )

    class Meta:
        ordering = ("usuario__first_name", "usuario__last_name")
        verbose_name = "perfil médico"
        verbose_name_plural = "perfiles médicos"

    def __str__(self):
        return f"Dr(a). {self.usuario.nombre_completo}"

    def clean(self):
        super().clean()
        if self.usuario_id and self.usuario.rol != Usuario.Rol.MEDICO:
            raise ValidationError(
                {"usuario": "El perfil médico solo puede asociarse a un usuario médico."}
            )
