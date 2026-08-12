from __future__ import annotations

import uuid

from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import models
from django.db.models import Q
from django.utils import timezone

from pacientes.models import Paciente


class CatalogoSintoma(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    codigo = models.SlugField(max_length=40, unique=True)
    nombre = models.CharField(max_length=100, unique=True)
    descripcion = models.CharField(max_length=240, blank=True)
    activo = models.BooleanField(default=True)

    class Meta:
        ordering = ("nombre",)

    def __str__(self) -> str:
        return self.nombre


class ReporteSintomas(models.Model):
    class Intensidad(models.TextChoices):
        LEVE = "LEVE", "Leve"
        MODERADA = "MODERADA", "Moderada"
        FUERTE = "FUERTE", "Fuerte"

    class Duracion(models.TextChoices):
        MENOS_1_HORA = "MENOS_1_HORA", "Menos de 1 hora"
        ENTRE_1_6_HORAS = "ENTRE_1_6_HORAS", "Entre 1 y 6 horas"
        ENTRE_6_24_HORAS = "ENTRE_6_24_HORAS", "Entre 6 y 24 horas"
        MAS_24_HORAS = "MAS_24_HORAS", "Mas de 24 horas"

    class Evolucion(models.TextChoices):
        IGUAL = "IGUAL", "Igual"
        MEJORO = "MEJORO", "Mejoro"
        EMPEORO = "EMPEORO", "Empeoro"

    class Origen(models.TextChoices):
        APP = "APP", "Aplicacion movil"
        WEB = "WEB", "Portal web"
        MEDICO = "MEDICO", "Medico"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    paciente = models.ForeignKey(Paciente, on_delete=models.CASCADE, related_name="reportes_sintomas")
    sintomas = models.ManyToManyField(CatalogoSintoma, through="SintomaReportado", related_name="reportes")
    intensidad = models.CharField(max_length=12, choices=Intensidad.choices)
    duracion = models.CharField(max_length=24, choices=Duracion.choices)
    evolucion = models.CharField(max_length=12, choices=Evolucion.choices)
    observado_en = models.DateTimeField()
    descripcion = models.CharField(max_length=250, blank=True)
    origen = models.CharField(max_length=12, choices=Origen.choices, default=Origen.APP)
    reportado_por = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="reportes_sintomas",
    )
    reportado_en = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ("-observado_en", "-reportado_en")
        indexes = [
            models.Index(fields=("paciente", "-observado_en"), name="sintoma_pac_fecha_idx"),
            models.Index(fields=("intensidad", "-observado_en"), name="sintoma_int_fecha_idx"),
        ]

    def __str__(self) -> str:
        return f"{self.paciente} - {self.get_intensidad_display()}"


class SintomaReportado(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    reporte = models.ForeignKey(ReporteSintomas, on_delete=models.CASCADE, related_name="sintomas_reportados")
    sintoma = models.ForeignKey(CatalogoSintoma, on_delete=models.PROTECT, related_name="apariciones")
    detalle = models.CharField(max_length=160, blank=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=("reporte", "sintoma"), name="sintoma_unico_por_reporte")
        ]

    def __str__(self) -> str:
        return f"{self.reporte}: {self.sintoma}"


class EventoSeguimiento(models.Model):
    class Tipo(models.TextChoices):
        MEDICACION = "MEDICACION", "Medicacion"
        SINTOMAS = "SINTOMAS", "Sintomas"
        TRATAMIENTO = "TRATAMIENTO", "Tratamiento"
        DOCUMENTO = "DOCUMENTO", "Documento"
        CONSULTA = "CONSULTA", "Consulta"
        OTRO = "OTRO", "Otro"

    class Origen(models.TextChoices):
        APP = "APP", "Aplicacion movil"
        WEB = "WEB", "Portal web"
        MEDICO = "MEDICO", "Medico"
        SISTEMA = "SISTEMA", "Sistema"

    class Estado(models.TextChoices):
        RECIBIDO = "RECIBIDO", "Recibido"
        EN_SEGUIMIENTO = "EN_SEGUIMIENTO", "En seguimiento"
        REVISADO = "REVISADO", "Revisado"
        CUMPLIDO = "CUMPLIDO", "Cumplido"
        ALERTA = "ALERTA", "Alerta"
        CERRADO = "CERRADO", "Cerrado"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    paciente = models.ForeignKey(Paciente, on_delete=models.CASCADE, related_name="eventos_seguimiento")
    tipo = models.CharField(max_length=16, choices=Tipo.choices)
    origen = models.CharField(max_length=12, choices=Origen.choices)
    estado = models.CharField(max_length=20, choices=Estado.choices, default=Estado.RECIBIDO)
    resumen = models.CharField(max_length=240)
    detalle = models.TextField(blank=True)
    ocurrido_en = models.DateTimeField()
    registrado_por = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="eventos_seguimiento_registrados",
    )
    reporte_sintomas = models.OneToOneField(
        ReporteSintomas,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="evento_seguimiento",
    )
    reporte_dosis = models.OneToOneField(
        "medicacion.ReporteDosis",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="evento_seguimiento",
    )
    documento = models.OneToOneField(
        "documentos.DocumentoPaciente",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="evento_seguimiento",
    )
    consulta = models.OneToOneField(
        "clinica.ConsultaClinica",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="evento_seguimiento",
    )
    creado_en = models.DateTimeField(auto_now_add=True)
    actualizado_en = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("-ocurrido_en", "-creado_en")
        indexes = [
            models.Index(fields=("paciente", "tipo", "-ocurrido_en"), name="evento_pac_tipo_fecha_idx"),
            models.Index(fields=("estado", "-ocurrido_en"), name="evento_estado_fecha_idx"),
        ]

    def __str__(self) -> str:
        return f"{self.get_tipo_display()} - {self.paciente}"

    def clean(self) -> None:
        super().clean()
        referencias = [self.reporte_sintomas, self.reporte_dosis, self.documento, self.consulta]
        referencias = [referencia for referencia in referencias if referencia is not None]
        if len(referencias) > 1:
            raise ValidationError("Un evento solo puede apuntar a un registro de origen.")
        for referencia in referencias:
            paciente = referencia.paciente if hasattr(referencia, "paciente") else None
            if paciente is None and hasattr(referencia, "dosis_programada"):
                paciente = referencia.dosis_programada.prescripcion.paciente
            if paciente and paciente.pk != self.paciente_id:
                raise ValidationError("El registro de origen pertenece a otro paciente.")


class SemaforoPaciente(models.Model):
    class Nivel(models.TextChoices):
        VERDE = "VERDE", "Verde"
        AMARILLO = "AMARILLO", "Amarillo"
        ROJO = "ROJO", "Rojo"

    class Origen(models.TextChoices):
        REGLA = "REGLA", "Regla automatica"
        MEDICO = "MEDICO", "Evaluacion medica"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    paciente = models.ForeignKey(Paciente, on_delete=models.CASCADE, related_name="historial_semaforo")
    nivel = models.CharField(max_length=12, choices=Nivel.choices)
    motivo = models.CharField(max_length=240)
    origen = models.CharField(max_length=12, choices=Origen.choices, default=Origen.REGLA)
    es_actual = models.BooleanField(default=True)
    vigente_desde = models.DateTimeField(default=timezone.now)
    vigente_hasta = models.DateTimeField(null=True, blank=True)
    determinado_por = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="semaforos_determinados",
    )

    class Meta:
        ordering = ("-vigente_desde",)
        constraints = [
            models.UniqueConstraint(
                fields=("paciente",),
                condition=Q(es_actual=True),
                name="un_semaforo_actual_por_paciente",
            )
        ]

    def __str__(self) -> str:
        return f"{self.paciente}: {self.get_nivel_display()}"


class AlertaSeguimiento(models.Model):
    class Prioridad(models.TextChoices):
        BAJA = "BAJA", "Baja"
        MEDIA = "MEDIA", "Media"
        ALTA = "ALTA", "Alta"
        CRITICA = "CRITICA", "Critica"

    class Estado(models.TextChoices):
        ABIERTA = "ABIERTA", "Abierta"
        EN_REVISION = "EN_REVISION", "En revision"
        RESUELTA = "RESUELTA", "Resuelta"
        DESCARTADA = "DESCARTADA", "Descartada"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    paciente = models.ForeignKey(Paciente, on_delete=models.CASCADE, related_name="alertas_seguimiento")
    evento = models.ForeignKey(
        EventoSeguimiento,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="alertas",
    )
    codigo = models.CharField(max_length=60)
    titulo = models.CharField(max_length=160)
    descripcion = models.TextField()
    prioridad = models.CharField(max_length=12, choices=Prioridad.choices, default=Prioridad.MEDIA)
    estado = models.CharField(max_length=16, choices=Estado.choices, default=Estado.ABIERTA)
    asignada_a = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="alertas_seguimiento_asignadas",
    )
    abierta_en = models.DateTimeField(auto_now_add=True)
    resuelta_en = models.DateTimeField(null=True, blank=True)
    resuelta_por = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="alertas_seguimiento_resueltas",
    )
    comentario_resolucion = models.TextField(blank=True)

    class Meta:
        ordering = ("-abierta_en",)
        indexes = [
            models.Index(fields=("estado", "prioridad", "-abierta_en"), name="alerta_estado_prior_idx"),
            models.Index(fields=("paciente", "estado"), name="alerta_pac_estado_idx"),
        ]

    def __str__(self) -> str:
        return f"{self.titulo} - {self.paciente}"

