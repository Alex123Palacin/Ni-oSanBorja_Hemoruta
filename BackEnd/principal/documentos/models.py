from __future__ import annotations

import uuid
from pathlib import Path

from django.conf import settings
from django.db import models

from clinica.models import ConsultaClinica
from pacientes.models import Paciente


def ruta_documento_paciente(instance: "DocumentoPaciente", nombre_archivo: str) -> str:
    extension = Path(nombre_archivo).suffix.lower()
    return f"pacientes/{instance.paciente_id}/documentos/{instance.id}{extension}"


class DocumentoPaciente(models.Model):
    class Tipo(models.TextChoices):
        INFORME_MEDICO = "INFORME_MEDICO", "Informe medico"
        LABORATORIO = "LABORATORIO", "Resultado de laboratorio"
        PLAN_TRATAMIENTO = "PLAN_TRATAMIENTO", "Plan de tratamiento"
        IMAGEN = "IMAGEN", "Imagen clinica"
        OTRO = "OTRO", "Otro"

    class Estado(models.TextChoices):
        PENDIENTE = "PENDIENTE", "Pendiente de revision"
        DISPONIBLE = "DISPONIBLE", "Disponible"
        RECHAZADO = "RECHAZADO", "Rechazado"
        ARCHIVADO = "ARCHIVADO", "Archivado"

    class Origen(models.TextChoices):
        APP = "APP", "Aplicacion movil"
        MEDICO = "MEDICO", "Medico"
        SISTEMA = "SISTEMA", "Sistema hospitalario"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    paciente = models.ForeignKey(Paciente, on_delete=models.CASCADE, related_name="documentos")
    consulta = models.ForeignKey(
        ConsultaClinica,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="documentos",
    )
    tipo = models.CharField(max_length=24, choices=Tipo.choices, default=Tipo.OTRO)
    titulo = models.CharField(max_length=180)
    descripcion = models.TextField(blank=True)
    archivo = models.FileField(upload_to=ruta_documento_paciente, max_length=500, blank=True)
    nombre_original = models.CharField(max_length=255, blank=True)
    tipo_mime = models.CharField(max_length=120, blank=True)
    tamano_bytes = models.PositiveBigIntegerField(default=0)
    sha256 = models.CharField(max_length=64, blank=True)
    fecha_documento = models.DateField(null=True, blank=True)
    origen = models.CharField(max_length=12, choices=Origen.choices, default=Origen.APP)
    estado = models.CharField(max_length=16, choices=Estado.choices, default=Estado.PENDIENTE)
    subido_por = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="documentos_subidos",
    )
    creado_en = models.DateTimeField(auto_now_add=True)
    actualizado_en = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("-fecha_documento", "-creado_en")
        indexes = [
            models.Index(fields=("paciente", "estado", "-creado_en"), name="documento_pac_estado_idx"),
            models.Index(fields=("tipo",), name="documento_tipo_idx"),
        ]

    def __str__(self) -> str:
        return f"{self.titulo} - {self.paciente}"

