from __future__ import annotations

import uuid

from django.db import models

from clinica.models import ConsultaClinica


def estructura_consulta_vacia() -> dict:
    return {
        "motivoConsulta": "",
        "evolucionClinica": "",
        "tratamientoIndicado": "",
        "medicacionIndicada": [],
        "indicacionesCasa": "",
        "proximoControl": {"fecha": "", "hora": "", "detalle": ""},
    }


class SesionConsultaVoz(models.Model):
    class Estado(models.TextChoices):
        BORRADOR = "BORRADOR", "Borrador"
        LISTO = "LISTO", "Listo para revisar"
        PUBLICADO = "PUBLICADO", "Publicado"
        CANCELADO = "CANCELADO", "Cancelado"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    consulta = models.OneToOneField(
        ConsultaClinica,
        on_delete=models.CASCADE,
        related_name="sesion_voz",
    )
    estado = models.CharField(max_length=16, choices=Estado.choices, default=Estado.BORRADOR)
    pregunta_actual = models.CharField(max_length=300, blank=True)
    preguntas_omitidas = models.JSONField(default=list, blank=True)
    transcripcion = models.TextField(blank=True)
    intervenciones = models.JSONField(default=list, blank=True)
    datos_estructurados = models.JSONField(default=estructura_consulta_vacia, blank=True)
    ia_disponible = models.BooleanField(default=True)
    mensaje_ia = models.CharField(max_length=300, blank=True)
    creado_en = models.DateTimeField(auto_now_add=True)
    actualizado_en = models.DateTimeField(auto_now=True)
    publicado_en = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ("-creado_en",)

    def __str__(self) -> str:
        return f"Consulta por voz - {self.consulta.paciente}"
