import { solicitarApi, solicitarArchivoApi } from '../compartido/ClienteApi'

const RUTA_CLINICA_DIA = '/admin/clinica-dia'

export type PrioridadClinicaDiaApi = 'ALTA' | 'MEDIA' | 'BAJA'
export type EstadoSolicitudClinicaDiaApi =
  | 'PENDIENTE'
  | 'PROGRAMADA'
  | 'CONFIRMADA'
  | 'COMPLETADA'
  | 'CANCELADA'
export type EstadoProgramacionClinicaDiaApi =
  | 'PROGRAMADA'
  | 'CONFIRMADA'
  | 'COMPLETADA'
  | 'CANCELADA'
export type EstadoRecordatorioClinicaDiaApi = 'PENDIENTE' | 'ENVIADO' | 'NO_REQUERIDO'
export type OrigenSolicitudClinicaDiaApi = 'IMPORTACION' | 'MANUAL'
export type OrigenProgramacionClinicaDiaApi = 'AUTOMATICA' | 'MANUAL' | 'AJUSTE'

export interface SolicitudClinicaDiaApi {
  codigoExterno: string | null
  creadoEn: string
  diagnostico: string
  dni: string
  duracionMinutos: number
  estado: EstadoSolicitudClinicaDiaApi
  fechaPreferida: string | null
  horaPreferida: string | null
  historiaClinicaImportada: string
  id: string
  nombreCompleto: string
  observaciones: string
  origen: OrigenSolicitudClinicaDiaApi
  paciente: {
    historiaClinica: string
    id: string
    nombreCompleto: string
  } | null
  prioridad: PrioridadClinicaDiaApi
  procedencia: string
  protocolo: string
  telefono: string
}

export interface ProgramacionClinicaDiaApi {
  cama: number
  confirmadaEn: string | null
  estado: EstadoProgramacionClinicaDiaApi
  fecha: string
  horaFin: string
  horaInicio: string
  id: string
  observaciones: string
  origen: OrigenProgramacionClinicaDiaApi
  recordatorioEn: string | null
  recordatorioEstado: EstadoRecordatorioClinicaDiaApi
  solicitud: SolicitudClinicaDiaApi
  turno: string
  turnoEtiqueta: string
}

export interface TurnoClinicaDiaApi {
  camas: Array<{
    numero: number
    programacion: ProgramacionClinicaDiaApi | null
  }>
  capacidad: number
  codigo: string
  disponibles: number
  etiqueta: string
  horaFin: string
  horaInicio: string
  ocupadas: number
}

export interface TableroClinicaDiaApi {
  fecha: string
  pendientes: SolicitudClinicaDiaApi[]
  procedencias: string[]
  recordatorios: ProgramacionClinicaDiaApi[]
  resumen: {
    camasDisponibles: number
    camasOcupadas: number
    capacidadTotal: number
    confirmadasFecha: number
    ocupacionPorcentaje: number
    programadasFecha: number
    recordatoriosPendientes: number
    solicitudesPendientes: number
  }
  turnos: TurnoClinicaDiaApi[]
}

export interface FiltrosClinicaDiaApi {
  busqueda?: string
  estado?: EstadoSolicitudClinicaDiaApi
  fecha: string
  prioridad?: PrioridadClinicaDiaApi
  procedencia?: string
}

export interface ProgramarClinicaDiaApi {
  cama: number
  crearRecordatorio: boolean
  fecha: string
  solicitudId: string
  turno: string
}

export interface AjustarProgramacionClinicaDiaApi {
  cama?: number
  crearRecordatorio?: boolean
  fecha?: string
  motivo: string
  solicitudId?: string
  turno?: string
}

interface SolicitudClinicaDiaBackend {
  codigo_externo: string | null
  creado_en: string
  diagnostico: string
  dni: string
  duracion_minutos: number
  estado: EstadoSolicitudClinicaDiaApi
  fecha_preferida: string | null
  hora_preferida: string | null
  historia_clinica_importada: string
  id: string
  nombre_completo: string
  observaciones: string
  origen: OrigenSolicitudClinicaDiaApi
  paciente: {
    historia_clinica: string
    id: string
    nombre_completo: string
  } | null
  prioridad: PrioridadClinicaDiaApi
  procedencia: string
  protocolo: string
  telefono: string
}

interface ProgramacionClinicaDiaBackend {
  cama: number
  confirmada_en: string | null
  estado: EstadoProgramacionClinicaDiaApi
  fecha: string
  hora_fin: string
  hora_inicio: string
  id: string
  observaciones: string
  origen: OrigenProgramacionClinicaDiaApi
  recordatorio_en: string | null
  recordatorio_estado: EstadoRecordatorioClinicaDiaApi
  solicitud: SolicitudClinicaDiaBackend
  turno: string
  turno_etiqueta: string
}

interface TableroClinicaDiaBackend {
  fecha: string
  pendientes: SolicitudClinicaDiaBackend[]
  procedencias: string[]
  recordatorios: ProgramacionClinicaDiaBackend[]
  resumen: {
    camas_disponibles: number
    camas_ocupadas: number
    capacidad_total: number
    confirmadas_fecha: number
    ocupacion_porcentaje: number
    programadas_fecha: number
    recordatorios_pendientes: number
    solicitudes_pendientes: number
  }
  turnos: Array<{
    camas: Array<{
      numero: number
      programacion: ProgramacionClinicaDiaBackend | null
    }>
    capacidad: number
    codigo: string
    disponibles: number
    etiqueta: string
    hora_fin: string
    hora_inicio: string
    ocupadas: number
  }>
}

interface RespuestaAccionClinicaDiaBackend {
  detalle?: string
  mensaje?: string
}

export interface ResultadoImportacionClinicaDiaApi {
  detalle: string
  duplicadas: number
  errores: Array<{ campo: string; fila: number; mensaje: string }>
  externas: number
  importadas: number
  loteId: string
  rechazadas: number
  total: number
  vinculadas: number
}

interface ResultadoImportacionClinicaDiaBackend {
  detalle: string
  duplicadas: number
  errores: Array<{ campo: string; fila: number; mensaje: string }>
  externas: number
  importadas: number
  lote_id: string
  rechazadas: number
  total: number
  vinculadas: number
}

function normalizarSolicitud(solicitud: SolicitudClinicaDiaBackend): SolicitudClinicaDiaApi {
  return {
    codigoExterno: solicitud.codigo_externo,
    creadoEn: solicitud.creado_en,
    diagnostico: solicitud.diagnostico,
    dni: solicitud.dni,
    duracionMinutos: solicitud.duracion_minutos,
    estado: solicitud.estado,
    fechaPreferida: solicitud.fecha_preferida,
    horaPreferida: solicitud.hora_preferida,
    historiaClinicaImportada: solicitud.historia_clinica_importada,
    id: solicitud.id,
    nombreCompleto: solicitud.nombre_completo,
    observaciones: solicitud.observaciones,
    origen: solicitud.origen,
    paciente: solicitud.paciente
      ? {
          historiaClinica: solicitud.paciente.historia_clinica,
          id: solicitud.paciente.id,
          nombreCompleto: solicitud.paciente.nombre_completo,
        }
      : null,
    prioridad: solicitud.prioridad,
    procedencia: solicitud.procedencia,
    protocolo: solicitud.protocolo,
    telefono: solicitud.telefono,
  }
}

function normalizarProgramacion(
  programacion: ProgramacionClinicaDiaBackend,
): ProgramacionClinicaDiaApi {
  return {
    cama: programacion.cama,
    confirmadaEn: programacion.confirmada_en,
    estado: programacion.estado,
    fecha: programacion.fecha,
    horaFin: programacion.hora_fin,
    horaInicio: programacion.hora_inicio,
    id: programacion.id,
    observaciones: programacion.observaciones,
    origen: programacion.origen,
    recordatorioEn: programacion.recordatorio_en,
    recordatorioEstado: programacion.recordatorio_estado,
    solicitud: normalizarSolicitud(programacion.solicitud),
    turno: programacion.turno,
    turnoEtiqueta: programacion.turno_etiqueta,
  }
}

function obtenerMensaje(
  respuesta: RespuestaAccionClinicaDiaBackend,
  mensajePredeterminado: string,
) {
  return respuesta.detalle || respuesta.mensaje || mensajePredeterminado
}

export async function obtenerTableroClinicaDiaApi(filtros: FiltrosClinicaDiaApi) {
  const respuesta = await solicitarApi<TableroClinicaDiaBackend>(`${RUTA_CLINICA_DIA}/`, {
    consulta: {
      estado: filtros.estado,
      fecha: filtros.fecha,
      prioridad: filtros.prioridad,
      procedencia: filtros.procedencia,
      q: filtros.busqueda,
    },
  })

  return {
    fecha: respuesta.fecha,
    pendientes: respuesta.pendientes.map(normalizarSolicitud),
    procedencias: respuesta.procedencias,
    recordatorios: respuesta.recordatorios.map(normalizarProgramacion),
    resumen: {
      camasDisponibles: respuesta.resumen.camas_disponibles,
      camasOcupadas: respuesta.resumen.camas_ocupadas,
      capacidadTotal: respuesta.resumen.capacidad_total,
      confirmadasFecha: respuesta.resumen.confirmadas_fecha,
      ocupacionPorcentaje: respuesta.resumen.ocupacion_porcentaje,
      programadasFecha: respuesta.resumen.programadas_fecha,
      recordatoriosPendientes: respuesta.resumen.recordatorios_pendientes,
      solicitudesPendientes: respuesta.resumen.solicitudes_pendientes,
    },
    turnos: respuesta.turnos.map((turno) => ({
      camas: turno.camas.map((cama) => ({
        numero: cama.numero,
        programacion: cama.programacion ? normalizarProgramacion(cama.programacion) : null,
      })),
      capacidad: turno.capacidad,
      codigo: turno.codigo,
      disponibles: turno.disponibles,
      etiqueta: turno.etiqueta,
      horaFin: turno.hora_fin,
      horaInicio: turno.hora_inicio,
      ocupadas: turno.ocupadas,
    })),
  } satisfies TableroClinicaDiaApi
}

export async function importarSolicitudesClinicaDiaApi(archivo: File) {
  const cuerpo = new FormData()
  cuerpo.append('archivo', archivo)
  const respuesta = await solicitarApi<ResultadoImportacionClinicaDiaBackend>(
    `${RUTA_CLINICA_DIA}/importar/`,
    { cuerpo, method: 'POST' },
  )
  return {
    detalle: respuesta.detalle,
    duplicadas: respuesta.duplicadas,
    errores: respuesta.errores,
    externas: respuesta.externas,
    importadas: respuesta.importadas,
    loteId: respuesta.lote_id,
    rechazadas: respuesta.rechazadas,
    total: respuesta.total,
    vinculadas: respuesta.vinculadas,
  } satisfies ResultadoImportacionClinicaDiaApi
}

export function descargarPlantillaClinicaDiaApi() {
  return solicitarArchivoApi(`${RUTA_CLINICA_DIA}/plantilla/`)
}

export async function generarAgendaClinicaDiaApi(fechaDesde: string, fechaHasta?: string) {
  const respuesta = await solicitarApi<RespuestaAccionClinicaDiaBackend>(
    `${RUTA_CLINICA_DIA}/generar-agenda/`,
    {
      cuerpo: { fecha_desde: fechaDesde, fecha_hasta: fechaHasta || undefined },
      method: 'POST',
    },
  )
  return obtenerMensaje(respuesta, 'La agenda automática fue generada.')
}

export async function programarSolicitudClinicaDiaApi(datos: ProgramarClinicaDiaApi) {
  const respuesta = await solicitarApi<RespuestaAccionClinicaDiaBackend>(
    `${RUTA_CLINICA_DIA}/programaciones/`,
    {
      cuerpo: {
        cama: datos.cama,
        crear_recordatorio: datos.crearRecordatorio,
        fecha: datos.fecha,
        solicitud_id: datos.solicitudId,
        turno: datos.turno,
      },
      method: 'POST',
    },
  )
  return obtenerMensaje(respuesta, 'El paciente fue programado correctamente.')
}

export async function ajustarProgramacionClinicaDiaApi(
  programacionId: string,
  datos: AjustarProgramacionClinicaDiaApi,
) {
  const respuesta = await solicitarApi<RespuestaAccionClinicaDiaBackend>(
    `${RUTA_CLINICA_DIA}/programaciones/${encodeURIComponent(programacionId)}/`,
    {
      cuerpo: {
        cama: datos.cama,
        crear_recordatorio: datos.crearRecordatorio,
        fecha: datos.fecha,
        motivo: datos.motivo,
        solicitud_id: datos.solicitudId,
        turno: datos.turno,
      },
      method: 'PATCH',
    },
  )
  return obtenerMensaje(respuesta, 'La programación fue actualizada.')
}

export async function confirmarProgramacionClinicaDiaApi(programacionId: string) {
  const respuesta = await solicitarApi<RespuestaAccionClinicaDiaBackend>(
    `${RUTA_CLINICA_DIA}/programaciones/${encodeURIComponent(programacionId)}/confirmar/`,
    { method: 'POST' },
  )
  return obtenerMensaje(respuesta, 'La programación fue confirmada.')
}

export async function completarProgramacionClinicaDiaApi(programacionId: string) {
  const respuesta = await solicitarApi<RespuestaAccionClinicaDiaBackend>(
    `${RUTA_CLINICA_DIA}/programaciones/${encodeURIComponent(programacionId)}/completar/`,
    { method: 'POST' },
  )
  return obtenerMensaje(respuesta, 'La atención fue marcada como completada.')
}

export async function confirmarAgendaClinicaDiaApi(fecha: string) {
  const respuesta = await solicitarApi<{
    confirmadas: number
    detalle: string
    fecha: string
    total: number
    ya_confirmadas: number
  }>(`${RUTA_CLINICA_DIA}/confirmar-agenda/`, {
    cuerpo: { fecha },
    method: 'POST',
  })
  return {
    confirmadas: respuesta.confirmadas,
    mensaje: respuesta.detalle,
    total: respuesta.total,
    yaConfirmadas: respuesta.ya_confirmadas,
  }
}

export async function cancelarProgramacionClinicaDiaApi(
  programacionId: string,
  motivo: string,
  reprogramar: boolean,
) {
  const respuesta = await solicitarApi<RespuestaAccionClinicaDiaBackend>(
    `${RUTA_CLINICA_DIA}/programaciones/${encodeURIComponent(programacionId)}/cancelar/`,
    { cuerpo: { motivo, reprogramar }, method: 'POST' },
  )
  return obtenerMensaje(respuesta, 'La programación fue cancelada.')
}

export async function actualizarRecordatorioClinicaDiaApi(
  programacionId: string,
  estado: EstadoRecordatorioClinicaDiaApi,
  observacion?: string,
) {
  const respuesta = await solicitarApi<RespuestaAccionClinicaDiaBackend>(
    `${RUTA_CLINICA_DIA}/programaciones/${encodeURIComponent(programacionId)}/recordatorio/`,
    { cuerpo: { estado, observacion }, method: 'PATCH' },
  )
  return obtenerMensaje(respuesta, 'El estado del recordatorio fue actualizado.')
}

export function exportarAgendaClinicaDiaApi(
  formato: 'csv' | 'xlsx',
  fechaDesde: string,
  fechaHasta?: string,
) {
  return solicitarArchivoApi(`${RUTA_CLINICA_DIA}/exportar/`, {
    consulta: {
      fecha_desde: fechaDesde,
      fecha_hasta: fechaHasta,
      formato,
    },
  })
}
