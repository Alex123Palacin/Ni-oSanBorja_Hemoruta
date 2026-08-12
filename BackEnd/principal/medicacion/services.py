from django.db import transaction
from rest_framework.exceptions import ValidationError

from .models import DosisProgramada, ReporteDosis


def _crear_evento_seguimiento(reporte: ReporteDosis) -> None:
    from seguimiento.models import EventoSeguimiento

    dosis = reporte.dosis_programada
    prescripcion = dosis.prescripcion
    medicamento = prescripcion.medicamento.nombre_generico
    cantidad = f"{prescripcion.cantidad_dosis:g} {prescripcion.unidad_dosis}".strip()
    origen = {
        ReporteDosis.Origen.APP: EventoSeguimiento.Origen.APP,
        ReporteDosis.Origen.WEB: EventoSeguimiento.Origen.WEB,
        ReporteDosis.Origen.MEDICO: EventoSeguimiento.Origen.MEDICO,
    }[reporte.origen]
    estado, resumen = {
        ReporteDosis.Respuesta.TOMADA: (
            EventoSeguimiento.Estado.CUMPLIDO,
            f"{medicamento} {cantidad} confirmado",
        ),
        ReporteDosis.Respuesta.TARDE: (
            EventoSeguimiento.Estado.EN_SEGUIMIENTO,
            f"{medicamento} {cantidad} tomado con retraso",
        ),
        ReporteDosis.Respuesta.NO_TOMADA: (
            EventoSeguimiento.Estado.ALERTA,
            f"{medicamento} {cantidad} no tomado",
        ),
    }[reporte.respuesta]
    detalle = reporte.observacion
    if reporte.motivo_no_toma:
        detalle = f"Motivo: {reporte.get_motivo_no_toma_display()}. {detalle}".strip()

    EventoSeguimiento.objects.get_or_create(
        reporte_dosis=reporte,
        defaults={
            "paciente": prescripcion.paciente,
            "tipo": EventoSeguimiento.Tipo.MEDICACION,
            "origen": origen,
            "estado": estado,
            "resumen": resumen[:240],
            "detalle": detalle,
            "ocurrido_en": reporte.ocurrida_en,
            "registrado_por": reporte.reportada_por,
        },
    )


@transaction.atomic
def registrar_reporte_dosis(*, dosis_programada, reportada_por, **datos) -> ReporteDosis:
    dosis = DosisProgramada.objects.select_for_update().get(pk=dosis_programada.pk)
    if hasattr(dosis, "reporte"):
        raise ValidationError({"dosis_programada": "Esta dosis ya fue reportada."})

    respuesta = datos["respuesta"]
    motivo = datos.get("motivo_no_toma", "")
    if respuesta == ReporteDosis.Respuesta.NO_TOMADA and not motivo:
        raise ValidationError({"motivo_no_toma": "Indique por que no se tomo la dosis."})
    if respuesta != ReporteDosis.Respuesta.NO_TOMADA and motivo:
        raise ValidationError({"motivo_no_toma": "El motivo solo aplica a una dosis no tomada."})

    estados = {
        ReporteDosis.Respuesta.TOMADA: DosisProgramada.Estado.TOMADA,
        ReporteDosis.Respuesta.TARDE: DosisProgramada.Estado.TARDE,
        ReporteDosis.Respuesta.NO_TOMADA: DosisProgramada.Estado.OMITIDA,
    }
    reporte = ReporteDosis.objects.create(
        dosis_programada=dosis,
        reportada_por=reportada_por,
        **datos,
    )
    dosis.estado = estados[respuesta]
    dosis.save(update_fields=("estado", "actualizado_en"))
    _crear_evento_seguimiento(reporte)
    return reporte
