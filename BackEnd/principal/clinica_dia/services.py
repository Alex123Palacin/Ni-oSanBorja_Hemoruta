from __future__ import annotations

from datetime import date, datetime, timedelta

from django.core.exceptions import ValidationError
from django.db import IntegrityError, transaction
from django.utils import timezone

from citas.models import Cita

from .models import (
    HORARIOS_TURNO,
    CambioProgramacionQuimioterapia,
    ProgramacionQuimioterapia,
    SolicitudQuimioterapia,
)


DIAS_MAXIMOS_AGENDA = 30


def es_dia_habil(fecha: date) -> bool:
    return fecha.weekday() < 5


def siguiente_dia_habil(fecha: date) -> date:
    candidato = fecha
    while not es_dia_habil(candidato):
        candidato += timedelta(days=1)
    return candidato


def _validar_dia_habil(fecha: date) -> None:
    if not es_dia_habil(fecha):
        raise ValidationError({"fecha": "La Clínica de Día programa de lunes a viernes."})


def _validar_fecha_agendable(fecha: date) -> None:
    _validar_dia_habil(fecha)
    if fecha < timezone.localdate():
        raise ValidationError({"fecha": "No se puede programar en una fecha pasada."})


def _serializar_estado(programacion: ProgramacionQuimioterapia) -> dict:
    return {
        "solicitud_id": str(programacion.solicitud_id),
        "fecha": programacion.fecha.isoformat(),
        "turno": programacion.turno,
        "cama": programacion.cama,
        "estado": programacion.estado,
        "recordatorio_estado": programacion.recordatorio_estado,
    }


def _registrar_cambio(
    programacion: ProgramacionQuimioterapia,
    *,
    accion: str,
    usuario,
    anterior: dict | None = None,
    nuevo: dict | None = None,
    motivo: str = "",
) -> None:
    CambioProgramacionQuimioterapia.objects.create(
        programacion=programacion,
        accion=accion,
        datos_anteriores=anterior or {},
        datos_nuevos=nuevo or {},
        motivo=motivo.strip(),
        realizada_por=usuario,
    )


def _sincronizar_cita(programacion: ProgramacionQuimioterapia) -> None:
    solicitud = programacion.solicitud
    if not solicitud.paciente_id:
        if programacion.cita_id:
            programacion.cita.estado = Cita.Estado.CANCELADA
            programacion.cita.save(update_fields=("estado", "actualizado_en"))
        return

    zona = timezone.get_current_timezone()
    inicio = timezone.make_aware(
        datetime.combine(programacion.fecha, programacion.hora_inicio),
        zona,
    )
    fin = inicio + timedelta(minutes=solicitud.duracion_minutos)
    estado_cita = {
        ProgramacionQuimioterapia.Estado.PROGRAMADA: Cita.Estado.PENDIENTE,
        ProgramacionQuimioterapia.Estado.CONFIRMADA: Cita.Estado.CONFIRMADA,
        ProgramacionQuimioterapia.Estado.COMPLETADA: Cita.Estado.COMPLETADA,
        ProgramacionQuimioterapia.Estado.CANCELADA: Cita.Estado.CANCELADA,
    }[programacion.estado]
    valores = {
        "paciente": solicitud.paciente,
        "tipo": Cita.Tipo.PROCEDIMIENTO,
        "inicio": inicio,
        "fin": fin,
        "estado": estado_cita,
        "origen": Cita.Origen.HOSPITAL,
        "especialidad": "Clínica de Día",
        "consultorio": f"Cama {programacion.cama}",
        "motivo": f"Quimioterapia{f' - {solicitud.protocolo}' if solicitud.protocolo else ''}",
        "observaciones": programacion.observaciones,
        "creada_por": programacion.programada_por,
        "confirmada_por": programacion.confirmada_por,
        "confirmada_en": programacion.confirmada_en,
    }
    if programacion.cita_id:
        cita = programacion.cita
        for campo, valor in valores.items():
            setattr(cita, campo, valor)
        cita.save(update_fields=tuple(valores) + ("actualizado_en",))
        return
    cita = Cita.objects.create(**valores)
    programacion.cita = cita
    programacion.save(update_fields=("cita", "actualizado_en"))


def _crear_programacion_en_transaccion(
    *,
    solicitud: SolicitudQuimioterapia,
    fecha: date,
    turno: str,
    cama: int,
    usuario,
    origen: str,
    observaciones: str = "",
    crear_recordatorio: bool = True,
) -> ProgramacionQuimioterapia:
    _validar_fecha_agendable(fecha)
    if turno not in HORARIOS_TURNO:
        raise ValidationError({"turno": "El turno seleccionado no es válido."})
    hora_inicio, hora_fin, capacidad = HORARIOS_TURNO[turno]
    if solicitud.duracion_minutos > capacidad:
        raise ValidationError(
            {"turno": "La duración de la solicitud excede la capacidad del turno."}
        )
    if solicitud.estado in (
        SolicitudQuimioterapia.Estado.CANCELADA,
        SolicitudQuimioterapia.Estado.COMPLETADA,
    ):
        raise ValidationError({"solicitud_id": "La solicitud ya no puede programarse."})
    if solicitud.programaciones.exclude(
        estado=ProgramacionQuimioterapia.Estado.CANCELADA
    ).exists():
        raise ValidationError({"solicitud_id": "La solicitud ya tiene una programación vigente."})

    programacion = ProgramacionQuimioterapia(
        solicitud=solicitud,
        fecha=fecha,
        turno=turno,
        hora_inicio=hora_inicio,
        hora_fin=hora_fin,
        cama=cama,
        origen=origen,
        observaciones=observaciones.strip(),
        programada_por=usuario,
        recordatorio_estado=(
            ProgramacionQuimioterapia.EstadoRecordatorio.PENDIENTE
            if crear_recordatorio and solicitud.telefono
            else ProgramacionQuimioterapia.EstadoRecordatorio.NO_REQUERIDO
        ),
    )
    programacion.full_clean()
    programacion.save()
    solicitud.estado = SolicitudQuimioterapia.Estado.PROGRAMADA
    solicitud.save(update_fields=("estado", "actualizado_en"))
    _sincronizar_cita(programacion)
    _registrar_cambio(
        programacion,
        accion=CambioProgramacionQuimioterapia.Accion.CREADA,
        usuario=usuario,
        nuevo=_serializar_estado(programacion),
    )
    return programacion


def crear_programacion(**datos) -> ProgramacionQuimioterapia:
    try:
        with transaction.atomic():
            solicitud = SolicitudQuimioterapia.objects.select_for_update(of=("self",)).get(
                pk=datos.pop("solicitud").pk
            )
            return _crear_programacion_en_transaccion(solicitud=solicitud, **datos)
    except IntegrityError as error:
        raise ValidationError(
            "La cama ya está ocupada en ese turno o la solicitud ya fue programada."
        ) from error


@transaction.atomic
def ajustar_programacion(
    programacion: ProgramacionQuimioterapia,
    *,
    usuario,
    fecha: date | None = None,
    turno: str | None = None,
    cama: int | None = None,
    solicitud_nueva: SolicitudQuimioterapia | None = None,
    crear_recordatorio: bool | None = None,
    motivo: str = "",
) -> ProgramacionQuimioterapia:
    programacion = (
        ProgramacionQuimioterapia.objects.select_for_update(of=("self",))
        .select_related("solicitud", "cita")
        .get(pk=programacion.pk)
    )
    if programacion.estado in (
        ProgramacionQuimioterapia.Estado.CANCELADA,
        ProgramacionQuimioterapia.Estado.COMPLETADA,
    ):
        raise ValidationError("Una programación finalizada no puede ajustarse.")
    anterior = _serializar_estado(programacion)
    if solicitud_nueva and solicitud_nueva.pk != programacion.solicitud_id:
        if programacion.estado == ProgramacionQuimioterapia.Estado.CONFIRMADA:
            raise ValidationError(
                {"solicitud_id": "Una programación confirmada no puede ceder su cupo."}
            )
        solicitud_nueva = (
            SolicitudQuimioterapia.objects.select_for_update(of=("self",))
            .select_related("paciente")
            .get(pk=solicitud_nueva.pk)
        )
        if solicitud_nueva.estado != SolicitudQuimioterapia.Estado.PENDIENTE:
            raise ValidationError(
                {"solicitud_id": "Solo puede ocupar el cupo una solicitud pendiente."}
            )
        if solicitud_nueva.programaciones.exclude(
            estado=ProgramacionQuimioterapia.Estado.CANCELADA
        ).exists():
            raise ValidationError(
                {"solicitud_id": "La solicitud seleccionada ya tiene programación vigente."}
            )
    nueva_fecha = fecha or programacion.fecha
    nuevo_turno = turno or programacion.turno
    nueva_cama = programacion.cama if cama is None else cama
    _validar_fecha_agendable(nueva_fecha)
    if nuevo_turno not in HORARIOS_TURNO:
        raise ValidationError({"turno": "El turno seleccionado no es válido."})
    hora_inicio, hora_fin, capacidad = HORARIOS_TURNO[nuevo_turno]
    if solicitud_nueva and solicitud_nueva.pk != programacion.solicitud_id:
        if solicitud_nueva.duracion_minutos > capacidad:
            raise ValidationError({"turno": "La duración de la nueva solicitud excede el turno."})
        cancelar_programacion(
            programacion,
            usuario=usuario,
            motivo=motivo or "Paciente retirado del cupo por ajuste administrativo.",
            reprogramar=True,
        )
        try:
            nueva_programacion = _crear_programacion_en_transaccion(
                solicitud=solicitud_nueva,
                fecha=nueva_fecha,
                turno=nuevo_turno,
                cama=nueva_cama,
                usuario=usuario,
                origen=ProgramacionQuimioterapia.Origen.AJUSTE,
                crear_recordatorio=True if crear_recordatorio is None else crear_recordatorio,
            )
        except IntegrityError as error:
            raise ValidationError("La cama seleccionada ya está ocupada en ese turno.") from error
        return nueva_programacion

    if programacion.solicitud.duracion_minutos > capacidad:
        raise ValidationError({"turno": "La duración excede la capacidad del turno."})

    programacion.fecha = nueva_fecha
    programacion.turno = nuevo_turno
    programacion.hora_inicio = hora_inicio
    programacion.hora_fin = hora_fin
    programacion.cama = nueva_cama
    programacion.origen = ProgramacionQuimioterapia.Origen.AJUSTE
    if crear_recordatorio is not None:
        programacion.recordatorio_estado = (
            ProgramacionQuimioterapia.EstadoRecordatorio.PENDIENTE
            if crear_recordatorio and programacion.solicitud.telefono
            else ProgramacionQuimioterapia.EstadoRecordatorio.NO_REQUERIDO
        )
        programacion.recordatorio_en = None
        programacion.recordatorio_por = None
    try:
        programacion.full_clean()
        programacion.save()
    except IntegrityError as error:
        raise ValidationError("La cama seleccionada ya está ocupada en ese turno.") from error
    _sincronizar_cita(programacion)
    _registrar_cambio(
        programacion,
        accion=CambioProgramacionQuimioterapia.Accion.AJUSTADA,
        usuario=usuario,
        anterior=anterior,
        nuevo=_serializar_estado(programacion),
        motivo=motivo or "Ajuste administrativo de agenda.",
    )
    return programacion


@transaction.atomic
def confirmar_programacion(programacion: ProgramacionQuimioterapia, *, usuario):
    programacion = (
        ProgramacionQuimioterapia.objects.select_for_update(of=("self",))
        .select_related("solicitud", "cita")
        .get(pk=programacion.pk)
    )
    if programacion.estado == ProgramacionQuimioterapia.Estado.CONFIRMADA:
        return programacion, False
    if programacion.estado != ProgramacionQuimioterapia.Estado.PROGRAMADA:
        raise ValidationError("Solo una programación pendiente puede confirmarse.")
    anterior = _serializar_estado(programacion)
    programacion.estado = ProgramacionQuimioterapia.Estado.CONFIRMADA
    programacion.confirmada_en = timezone.now()
    programacion.confirmada_por = usuario
    programacion.solicitud.estado = SolicitudQuimioterapia.Estado.CONFIRMADA
    programacion.solicitud.save(update_fields=("estado", "actualizado_en"))
    programacion.save(
        update_fields=("estado", "confirmada_en", "confirmada_por", "actualizado_en")
    )
    _sincronizar_cita(programacion)
    _registrar_cambio(
        programacion,
        accion=CambioProgramacionQuimioterapia.Accion.CONFIRMADA,
        usuario=usuario,
        anterior=anterior,
        nuevo=_serializar_estado(programacion),
    )
    return programacion, True


@transaction.atomic
def confirmar_agenda(*, fecha: date, usuario) -> dict:
    _validar_dia_habil(fecha)
    programaciones = list(
        ProgramacionQuimioterapia.objects.select_for_update(of=("self",))
        .select_related("solicitud", "cita")
        .filter(
            fecha=fecha,
            estado__in=(
                ProgramacionQuimioterapia.Estado.PROGRAMADA,
                ProgramacionQuimioterapia.Estado.CONFIRMADA,
            ),
        )
        .order_by("turno", "cama")
    )
    confirmadas = 0
    ya_confirmadas = 0
    for programacion in programaciones:
        if programacion.estado == ProgramacionQuimioterapia.Estado.CONFIRMADA:
            ya_confirmadas += 1
            continue
        _, cambio = confirmar_programacion(programacion, usuario=usuario)
        confirmadas += int(cambio)
    return {
        "fecha": fecha.isoformat(),
        "total": len(programaciones),
        "confirmadas": confirmadas,
        "ya_confirmadas": ya_confirmadas,
    }


@transaction.atomic
def completar_programacion(programacion: ProgramacionQuimioterapia, *, usuario):
    programacion = (
        ProgramacionQuimioterapia.objects.select_for_update(of=("self",))
        .select_related("solicitud", "cita")
        .get(pk=programacion.pk)
    )
    if programacion.estado == ProgramacionQuimioterapia.Estado.COMPLETADA:
        return programacion, False
    if programacion.estado != ProgramacionQuimioterapia.Estado.CONFIRMADA:
        raise ValidationError("Solo una programación confirmada puede marcarse como completada.")
    ahora = timezone.localtime()
    hora_local = ahora.time().replace(tzinfo=None)
    if programacion.fecha > ahora.date() or (
        programacion.fecha == ahora.date() and hora_local < programacion.hora_fin
    ):
        raise ValidationError(
            "La atención solo puede completarse cuando haya finalizado su turno programado."
        )
    anterior = _serializar_estado(programacion)
    programacion.estado = ProgramacionQuimioterapia.Estado.COMPLETADA
    programacion.solicitud.estado = SolicitudQuimioterapia.Estado.COMPLETADA
    programacion.solicitud.save(update_fields=("estado", "actualizado_en"))
    programacion.save(update_fields=("estado", "actualizado_en"))
    _sincronizar_cita(programacion)
    _registrar_cambio(
        programacion,
        accion=CambioProgramacionQuimioterapia.Accion.COMPLETADA,
        usuario=usuario,
        anterior=anterior,
        nuevo=_serializar_estado(programacion),
    )
    return programacion, True


@transaction.atomic
def cancelar_programacion(
    programacion: ProgramacionQuimioterapia,
    *,
    usuario,
    motivo: str,
    reprogramar: bool,
):
    programacion = (
        ProgramacionQuimioterapia.objects.select_for_update(of=("self",))
        .select_related("solicitud", "cita")
        .get(pk=programacion.pk)
    )
    if programacion.estado == ProgramacionQuimioterapia.Estado.CANCELADA:
        return programacion, False
    if programacion.estado == ProgramacionQuimioterapia.Estado.COMPLETADA:
        raise ValidationError("Una atención completada no puede cancelarse.")
    anterior = _serializar_estado(programacion)
    programacion.estado = ProgramacionQuimioterapia.Estado.CANCELADA
    programacion.cancelada_en = timezone.now()
    programacion.cancelada_por = usuario
    programacion.motivo_cancelacion = motivo.strip()
    programacion.recordatorio_estado = ProgramacionQuimioterapia.EstadoRecordatorio.NO_REQUERIDO
    programacion.solicitud.estado = (
        SolicitudQuimioterapia.Estado.PENDIENTE
        if reprogramar
        else SolicitudQuimioterapia.Estado.CANCELADA
    )
    programacion.solicitud.save(update_fields=("estado", "actualizado_en"))
    programacion.save(
        update_fields=(
            "estado",
            "cancelada_en",
            "cancelada_por",
            "motivo_cancelacion",
            "recordatorio_estado",
            "actualizado_en",
        )
    )
    _sincronizar_cita(programacion)
    _registrar_cambio(
        programacion,
        accion=CambioProgramacionQuimioterapia.Accion.CANCELADA,
        usuario=usuario,
        anterior=anterior,
        nuevo=_serializar_estado(programacion),
        motivo=motivo,
    )
    return programacion, True


@transaction.atomic
def actualizar_recordatorio(
    programacion: ProgramacionQuimioterapia,
    *,
    usuario,
    estado: str,
    observacion: str = "",
) -> ProgramacionQuimioterapia:
    programacion = ProgramacionQuimioterapia.objects.select_for_update(of=("self",)).get(
        pk=programacion.pk
    )
    if programacion.estado in (
        ProgramacionQuimioterapia.Estado.CANCELADA,
        ProgramacionQuimioterapia.Estado.COMPLETADA,
    ):
        raise ValidationError("No se gestionan recordatorios de una programación finalizada.")
    anterior = _serializar_estado(programacion)
    programacion.recordatorio_estado = estado
    programacion.recordatorio_en = (
        timezone.now()
        if estado == ProgramacionQuimioterapia.EstadoRecordatorio.ENVIADO
        else None
    )
    programacion.recordatorio_por = usuario
    programacion.recordatorio_observacion = observacion.strip()
    programacion.save(
        update_fields=(
            "recordatorio_estado",
            "recordatorio_en",
            "recordatorio_por",
            "recordatorio_observacion",
            "actualizado_en",
        )
    )
    _registrar_cambio(
        programacion,
        accion=CambioProgramacionQuimioterapia.Accion.RECORDATORIO,
        usuario=usuario,
        anterior=anterior,
        nuevo=_serializar_estado(programacion),
        motivo=observacion,
    )
    return programacion


def _turnos_para_solicitud(solicitud: SolicitudQuimioterapia) -> list[str]:
    return [
        turno
        for turno, (_, _, capacidad) in HORARIOS_TURNO.items()
        if solicitud.duracion_minutos <= capacidad
    ]


def _fechas_habiles(desde: date, hasta: date):
    actual = desde
    while actual <= hasta:
        if es_dia_habil(actual):
            yield actual
        actual += timedelta(days=1)


@transaction.atomic
def generar_agenda_automatica(
    *,
    fecha_desde: date,
    fecha_hasta: date | None,
    usuario,
    solicitud_ids: list | None = None,
) -> tuple[list[ProgramacionQuimioterapia], list[dict]]:
    if fecha_desde < timezone.localdate():
        raise ValidationError({"fecha_desde": "No se puede generar agenda en fechas pasadas."})
    fecha_desde = siguiente_dia_habil(fecha_desde)
    fecha_hasta = fecha_hasta or (fecha_desde + timedelta(days=DIAS_MAXIMOS_AGENDA))
    if fecha_hasta < fecha_desde:
        raise ValidationError({"fecha_hasta": "Debe ser igual o posterior a fecha_desde."})
    if (fecha_hasta - fecha_desde).days > DIAS_MAXIMOS_AGENDA:
        raise ValidationError(
            {"fecha_hasta": f"La ventana máxima es de {DIAS_MAXIMOS_AGENDA} días."}
        )

    solicitudes = SolicitudQuimioterapia.objects.select_for_update(of=("self",)).filter(
        estado=SolicitudQuimioterapia.Estado.PENDIENTE,
    )
    if solicitud_ids is not None:
        solicitudes = solicitudes.filter(pk__in=solicitud_ids)
    solicitudes = list(solicitudes.select_related("paciente"))
    peso = {
        SolicitudQuimioterapia.Prioridad.ALTA: 0,
        SolicitudQuimioterapia.Prioridad.MEDIA: 1,
        SolicitudQuimioterapia.Prioridad.BAJA: 2,
    }
    solicitudes.sort(
        key=lambda item: (
            peso[item.prioridad],
            item.fecha_preferida or fecha_desde,
            item.hora_preferida or HORARIOS_TURNO[ProgramacionQuimioterapia.Turno.T1][0],
            item.creado_en,
            str(item.pk),
        )
    )
    ocupados = set(
        ProgramacionQuimioterapia.objects.select_for_update(of=("self",))
        .filter(
            fecha__range=(fecha_desde, fecha_hasta),
        )
        .exclude(estado=ProgramacionQuimioterapia.Estado.CANCELADA)
        .values_list("fecha", "turno", "cama")
    )
    ocupacion_por_turno: dict[tuple[date, str], int] = {}
    for fecha_ocupada, turno_ocupado, _ in ocupados:
        clave_turno = (fecha_ocupada, turno_ocupado)
        ocupacion_por_turno[clave_turno] = ocupacion_por_turno.get(clave_turno, 0) + 1
    creadas: list[ProgramacionQuimioterapia] = []
    no_programadas: list[dict] = []

    for solicitud in solicitudes:
        inicio_solicitud = siguiente_dia_habil(
            max(fecha_desde, solicitud.fecha_preferida or fecha_desde)
        )
        if inicio_solicitud > fecha_hasta:
            no_programadas.append(
                {"solicitud_id": str(solicitud.id), "motivo": "Fecha preferida fuera del rango."}
            )
            continue
        turnos_compatibles = _turnos_para_solicitud(solicitud)
        turnos_cronologicos = list(turnos_compatibles)
        turno_preferido = next(
            (
                turno
                for turno, (inicio, fin, _) in HORARIOS_TURNO.items()
                if solicitud.hora_preferida and inicio <= solicitud.hora_preferida < fin
            ),
            None,
        )
        indice_preferido = (
            list(HORARIOS_TURNO).index(turno_preferido) if turno_preferido else 0
        )
        turnos_desde_preferencia = [
            turno
            for turno in turnos_cronologicos
            if list(HORARIOS_TURNO).index(turno) >= indice_preferido
        ]
        asignada = None
        for fecha in _fechas_habiles(inicio_solicitud, fecha_hasta):
            if solicitud.hora_preferida:
                # En el día pedido solo se consideran el turno que contiene la
                # hora preferida y los posteriores. En días siguientes se inicia
                # cronológicamente desde el primer turno compatible.
                turnos = (
                    turnos_desde_preferencia
                    if solicitud.fecha_preferida == fecha
                    else turnos_cronologicos
                )
            else:
                turnos = sorted(
                    turnos_compatibles,
                    key=lambda turno: (
                        ocupacion_por_turno.get((fecha, turno), 0),
                        list(HORARIOS_TURNO).index(turno),
                    ),
                )
            for turno in turnos:
                for cama in range(1, 9):
                    clave = (fecha, turno, cama)
                    if clave in ocupados:
                        continue
                    try:
                        with transaction.atomic():
                            asignada = _crear_programacion_en_transaccion(
                                solicitud=solicitud,
                                fecha=fecha,
                                turno=turno,
                                cama=cama,
                                usuario=usuario,
                                origen=ProgramacionQuimioterapia.Origen.AUTOMATICA,
                            )
                    except IntegrityError:
                        ocupados.add(clave)
                        continue
                    ocupados.add(clave)
                    ocupacion_por_turno[(fecha, turno)] = (
                        ocupacion_por_turno.get((fecha, turno), 0) + 1
                    )
                    creadas.append(asignada)
                    break
                if asignada:
                    break
            if asignada:
                break
        if not asignada:
            no_programadas.append(
                {
                    "solicitud_id": str(solicitud.id),
                    "motivo": "No se encontró cama disponible en el rango solicitado.",
                }
            )
    return creadas, no_programadas
