import { solicitarApi, solicitarArchivoApi } from '../compartido/ClienteApi'
import type { FiltrosPaginadosApi, RespuestaPaginadaApi } from '../compartido/TiposApi'

export interface PacienteMedicoListaApi {
  diagnosticoPrincipal: { id: string; nombre: string } | null
  dni: string
  edad: number | null
  estadoCita: string
  historiaClinica: string
  id: string
  atendidoPor: { id: string; nombre: string } | null
  medicoResponsable: { especialidad: string; id: string; nombre: string } | null
  nombre: string
  proximaCitaEn: string | null
  tutor: { id: string; nombre: string; parentesco: string } | null
}

export interface CitaPacienteMedicoApi {
  consultorio: string
  especialidad: string
  estado: string
  fin: string | null
  id: string
  inicio: string
  medico: { id: string; nombre: string } | null
  motivo: string
  observaciones: string
  origen: string
  sede: string
  tipo: string
}

export interface DocumentoPacienteMedicoApi {
  archivoDisponible: boolean
  creadoEn: string
  descripcion: string
  estado: string
  fechaDocumento: string | null
  id: string
  nombre: string
  nombreOriginal: string
  origen: string
  tamanoBytes: number
  tipo: string
  tipoMime: string
  url: string | null
}

export interface SintomaReportadoMedicoApi {
  codigo: string
  detalle: string
  id: string
  nombre: string
}

export interface ReporteSintomasPacienteMedicoApi {
  descripcion: string
  duracion: string
  duracionTexto: string
  estado: string
  evolucion: string
  evolucionTexto: string
  id: string
  intensidad: 'FUERTE' | 'LEVE' | 'MODERADA'
  intensidadTexto: string
  observadoEn: string
  origen: string
  origenTexto: string
  reportadoEn: string
  reportadoPor: { id: string; nombre: string }
  sintomas: SintomaReportadoMedicoApi[]
}

export interface FiltrosPacientesMedicoApi extends FiltrosPaginadosApi {
  busqueda?: string
  diagnosticoId?: string
  estado?: string
  tipoBusqueda?: 'DNI' | 'HISTORIA_CLINICA' | 'NOMBRE'
}

export interface FichaPacienteMedicoApi {
  cuentaMovil: { estado: string; ultimoAccesoEn: string | null }
  datosGenerales: Record<string, string | null>
  diagnosticoPrincipal: { id: string; nombre: string } | null
  documentosRecientes: Array<{
    archivoDisponible: boolean
    creadoEn: string
    estado: string
    id: string
    nombre: string
    nombreOriginal: string
    tipoMime: string
  }>
  historiaClinica: string
  id: string
  nombre: string
  proximaCitaEn: string | null
  responsables: Array<{ id: string; nombre: string; parentesco: string; telefono: string | null }>
  semaforo: { codigo: string; descripcion: string }
  version: number
}

export interface RegistroSeguimientoMedicoApi {
  estado: string
  id: string
  origen: 'APP_MOVIL' | 'MEDICO' | 'WHATSAPP'
  ocurridoEn: string
  resumen: string
  tipo: 'DOCUMENTO' | 'MEDICACION' | 'SINTOMA' | 'TRATAMIENTO'
}

export function listarPacientesMedicoApi(filtros: FiltrosPacientesMedicoApi = {}) {
  return solicitarApi<RespuestaPaginadaApi<PacienteMedicoListaApi>>('/medico/pacientes/', {
    consulta: {
      diagnosticoId: filtros.diagnosticoId,
      estado: filtros.estado,
      pagina: filtros.pagina,
      q: filtros.busqueda,
      tamanoPagina: filtros.tamanoPagina,
      tipoBusqueda: filtros.tipoBusqueda,
    },
  })
}

export function obtenerFichaPacienteMedicoApi(pacienteId: string) {
  return solicitarApi<FichaPacienteMedicoApi>(`/medico/pacientes/${encodeURIComponent(pacienteId)}/ficha/`)
}

export function obtenerArchivoDocumentoMedicoApi(documentoId: string, descargar = false) {
  return solicitarArchivoApi(`/medico/documentos/${encodeURIComponent(documentoId)}/archivo/`, {
    consulta: { descargar: descargar ? 1 : 0 },
  })
}

export function listarAgendaPacienteMedicoApi(pacienteId: string) {
  return solicitarApi<RespuestaPaginadaApi<CitaPacienteMedicoApi>>(
    `/medico/pacientes/${encodeURIComponent(pacienteId)}/agenda/`,
    { consulta: { pagina: 1, tamanoPagina: 100 } },
  )
}

export function listarDocumentosPacienteMedicoApi(pacienteId: string) {
  return solicitarApi<RespuestaPaginadaApi<DocumentoPacienteMedicoApi>>(
    `/medico/pacientes/${encodeURIComponent(pacienteId)}/documentos/`,
    { consulta: { pagina: 1, tamanoPagina: 100 } },
  )
}

export function listarSintomasPacienteMedicoApi(pacienteId: string) {
  return solicitarApi<RespuestaPaginadaApi<ReporteSintomasPacienteMedicoApi>>(
    `/medico/pacientes/${encodeURIComponent(pacienteId)}/sintomas/`,
    { consulta: { pagina: 1, tamanoPagina: 100 } },
  )
}

export function obtenerHistoriaPacienteMedicoApi(pacienteId: string, filtros: FiltrosPaginadosApi = {}) {
  return solicitarApi<RespuestaPaginadaApi<Record<string, unknown>>>(
    `/medico/pacientes/${encodeURIComponent(pacienteId)}/historial/`,
    {
      consulta: {
        pagina: filtros.pagina,
        tamanoPagina: filtros.tamanoPagina,
      },
    },
  )
}

export function listarSeguimientoPacientesMedicoApi(filtros: FiltrosPaginadosApi = {}) {
  return solicitarApi<RespuestaPaginadaApi<PacienteMedicoListaApi>>('/medico/seguimiento/', {
    consulta: {
      pagina: filtros.pagina,
      tamanoPagina: filtros.tamanoPagina,
    },
  })
}

export function obtenerSeguimientoPacienteMedicoApi(
  pacienteId: string,
  filtros: FiltrosPaginadosApi & { busqueda?: string; tipo?: string } = {},
) {
  return solicitarApi<RespuestaPaginadaApi<RegistroSeguimientoMedicoApi>>(
    `/medico/pacientes/${encodeURIComponent(pacienteId)}/seguimiento/`,
    {
      consulta: {
        pagina: filtros.pagina,
        q: filtros.busqueda,
        tamanoPagina: filtros.tamanoPagina,
        tipo: filtros.tipo,
      },
    },
  )
}
