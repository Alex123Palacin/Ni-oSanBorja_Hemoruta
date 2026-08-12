from django.db import transaction
from django.utils import timezone

from .models import (
    AlertaSeguimiento,
    EventoSeguimiento,
    ReporteSintomas,
    SemaforoPaciente,
    SintomaReportado,
)


@transaction.atomic
def cambiar_semaforo(*, paciente, nivel, motivo, origen, determinado_por=None) -> SemaforoPaciente:
    SemaforoPaciente.objects.select_for_update().filter(paciente=paciente, es_actual=True).update(
        es_actual=False,
        vigente_hasta=timezone.now(),
    )
    return SemaforoPaciente.objects.create(
        paciente=paciente,
        nivel=nivel,
        motivo=motivo,
        origen=origen,
        determinado_por=determinado_por,
    )


@transaction.atomic
def registrar_reporte_sintomas(*, sintomas, reportado_por, **datos) -> ReporteSintomas:
    reporte = ReporteSintomas.objects.create(reportado_por=reportado_por, **datos)
    SintomaReportado.objects.bulk_create(
        SintomaReportado(reporte=reporte, sintoma=sintoma) for sintoma in sintomas
    )
    nombres = ", ".join(sintoma.nombre for sintoma in sintomas)
    es_fuerte = reporte.intensidad == ReporteSintomas.Intensidad.FUERTE
    estado_evento = EventoSeguimiento.Estado.ALERTA if es_fuerte else EventoSeguimiento.Estado.RECIBIDO
    evento = EventoSeguimiento.objects.create(
        paciente=reporte.paciente,
        tipo=EventoSeguimiento.Tipo.SINTOMAS,
        origen=reporte.origen,
        estado=estado_evento,
        resumen=nombres[:240] or "Reporte de sintomas",
        detalle=reporte.descripcion,
        ocurrido_en=reporte.observado_en,
        registrado_por=reportado_por,
        reporte_sintomas=reporte,
    )

    nivel = SemaforoPaciente.Nivel.ROJO if es_fuerte else (
        SemaforoPaciente.Nivel.AMARILLO
        if reporte.intensidad == ReporteSintomas.Intensidad.MODERADA
        else SemaforoPaciente.Nivel.VERDE
    )
    cambiar_semaforo(
        paciente=reporte.paciente,
        nivel=nivel,
        motivo=f"Reporte de sintomas: {nombres}"[:240],
        origen=SemaforoPaciente.Origen.REGLA,
    )
    if es_fuerte:
        AlertaSeguimiento.objects.create(
            paciente=reporte.paciente,
            evento=evento,
            codigo="SINTOMA_FUERTE",
            titulo="Sintomas de intensidad fuerte",
            descripcion=f"La familia reporto: {nombres}"[:500],
            prioridad=AlertaSeguimiento.Prioridad.ALTA,
        )
    return reporte

