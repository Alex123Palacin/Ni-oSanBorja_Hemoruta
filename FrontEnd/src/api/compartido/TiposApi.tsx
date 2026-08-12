export type RolUsuarioApi = 'ADMINISTRADOR' | 'MEDICO' | 'PACIENTE'

export interface UsuarioSesionApi {
  apellidos?: string
  correo?: string
  especialidad?: string
  fotoPerfil?: string
  hospitalId?: string
  id: string
  medicoId?: string
  nombre: string
  nombreCompleto?: string
  pacienteId?: string
  rol: RolUsuarioApi
}

export interface SesionApi {
  token: string
  usuario: UsuarioSesionApi
}

export interface PaginacionApi {
  pagina: number
  paginasTotales: number
  tamanoPagina: number
  total: number
}

export interface RespuestaPaginadaApi<T> {
  paginacion: PaginacionApi
  resultados: T[]
}

export interface FiltrosPaginadosApi {
  pagina?: number
  tamanoPagina?: number
}

export interface ProblemaApi {
  codigo?: string
  detalle?: string
  erroresCampos?: Record<string, string[]>
  mensaje?: string
  traceId?: string
}
