import { solicitarApi } from '../compartido/ClienteApi'
import type {
  FiltrosPaginadosApi,
  RespuestaPaginadaApi,
  RolUsuarioApi,
} from '../compartido/TiposApi'

export type EstadoUsuarioHospitalarioApi = 'ACTIVO' | 'BLOQUEADO' | 'INACTIVO' | 'PENDIENTE'

export interface UsuarioHospitalarioListaApi {
  apellidos: string
  correo: string
  documento: string
  estado: EstadoUsuarioHospitalarioApi
  id: string
  nombre: string
  nombreCompleto: string
  rol: RolUsuarioApi
}

export interface DetalleUsuarioHospitalarioApi extends UsuarioHospitalarioListaApi {
  creadoEn: string
  requiereCambioPassword: boolean
  telefono: string | null
  ultimoAccesoEn: string | null
}

export interface DetalleMedicoAdministrativoApi {
  cargo: string
  consultasEsteMes: number
  consultasPorSemana: Array<{ semanaDesde: string; total: number }>
  especialidad: string
  estadoLaboral: string
  numeroColegiatura: string | null
  pacientesActivos: number
  pacientesAsignados: number
  pacientesPrincipales: number
}

export interface FichaPacienteAdministrativaApi {
  atendidoPor: {
    id: string
    nombreCompleto: string
  } | null
  cuentaMovil: {
    alias: string
    dispositivo: string
    estado: string
    ultimoAccesoEn: string | null
  } | null
  direccion: string
  distrito: string
  dni: string | null
  edad: number | null
  estado: string
  fechaNacimiento: string | null
  grupoSanguineo: string
  historiaClinica: string
  id: string
  idiomaPreferido: string
  nacionalidad: string
  nombreCompleto: string
  medicoResponsable: {
    especialidad: string
    id: string
    nombreCompleto: string
  } | null
  perfilCompleto: boolean
  procedencia: string
  sexo: string
  vinculo: {
    correo: string
    esPrincipal: boolean
    parentesco: string
    telefono: string
  } | null
}

export interface DetalleAdministrativoUsuarioApi {
  alcance: 'ADMINISTRATIVO'
  detalleMedico: DetalleMedicoAdministrativoApi | null
  incluyeDatosClinicos: false
  pacientes: FichaPacienteAdministrativaApi[]
  tipoDetalle: RolUsuarioApi
  usuario: DetalleUsuarioHospitalarioApi
}

export interface FiltrosUsuariosHospitalariosApi extends FiltrosPaginadosApi {
  busqueda?: string
  rol?: RolUsuarioApi
}

export interface CrearUsuarioHospitalarioApi {
  correo: string
  dni: string
  nombres: string
  rol: Extract<RolUsuarioApi, 'ADMINISTRADOR' | 'MEDICO' | 'PACIENTE'>
  telefono?: string
}

interface UsuarioHospitalarioBackend {
  apellidos?: string
  creado_en?: string
  dni?: string | null
  email?: string | null
  estado?: string
  first_name?: string
  id: string
  last_login?: string | null
  last_name?: string
  nombre?: string
  nombre_completo?: string
  correo?: string | null
  requiere_cambio_password?: boolean
  rol?: string
  telefono?: string | null
}

interface RespuestaPaginadaBackend<T> {
  paginacion: {
    pagina: number
    paginasTotales: number
    tamanoPagina: number
    total: number
  }
  resultados: T[]
}

interface DetalleAdministrativoBackend {
  alcance: 'ADMINISTRATIVO'
  detalle_medico: {
    cargo: string
    consultas_este_mes: number
    consultas_por_semana: Array<{ semana_desde: string; total: number }>
    especialidad: string
    estado_laboral: string
    numero_colegiatura: string | null
    pacientes_activos: number
    pacientes_asignados: number
    pacientes_principales: number
  } | null
  incluye_datos_clinicos: false
  pacientes: Array<{
    atendido_por?: { id: string; nombre: string } | null
    cuenta_movil: {
      alias: string
      dispositivo: string
      estado: string
      ultimo_acceso_en: string | null
    } | null
    direccion: string
    distrito: string
    dni: string | null
    edad: number | null
    estado: string
    fecha_nacimiento: string | null
    grupo_sanguineo: string
    historia_clinica: string
    id: string
    idioma_preferido: string
    nacionalidad: string
    nombre_completo: string
    medico_responsable?: {
      especialidad: string
      id: string
      nombre: string
    } | null
    perfil_completo: boolean
    procedencia: string
    sexo: string
    vinculo: {
      correo: string
      es_principal: boolean
      parentesco: string
      telefono: string
    } | null
  }>
  tipo_detalle: string
  usuario: UsuarioHospitalarioBackend
}

function normalizarRol(rol?: string): RolUsuarioApi {
  if (rol === 'ADMINISTRADOR' || rol === 'MEDICO' || rol === 'PACIENTE') return rol
  return 'PACIENTE'
}

function normalizarEstado(estado?: string): EstadoUsuarioHospitalarioApi {
  if (estado === 'ACTIVO' || estado === 'BLOQUEADO' || estado === 'INACTIVO') return estado
  return 'PENDIENTE'
}

function normalizarUsuario(usuario: UsuarioHospitalarioBackend): DetalleUsuarioHospitalarioApi {
  const nombre = usuario.nombre ?? usuario.first_name ?? ''
  const apellidos = usuario.apellidos ?? usuario.last_name ?? ''
  const nombreCompleto = usuario.nombre_completo?.trim() || `${nombre} ${apellidos}`.trim()

  return {
    apellidos,
    correo: usuario.correo ?? usuario.email ?? '',
    creadoEn: usuario.creado_en ?? '',
    documento: usuario.dni ?? '',
    estado: normalizarEstado(usuario.estado),
    id: usuario.id,
    nombre,
    nombreCompleto,
    requiereCambioPassword: Boolean(usuario.requiere_cambio_password),
    rol: normalizarRol(usuario.rol),
    telefono: usuario.telefono ?? null,
    ultimoAccesoEn: usuario.last_login ?? null,
  }
}

function separarNombreCompleto(nombreCompleto: string) {
  const partes = nombreCompleto.trim().split(/\s+/).filter(Boolean)
  if (partes.length <= 1) return { apellidos: '', nombres: partes[0] ?? '' }

  const cantidadNombres = partes.length >= 4 ? 2 : 1
  return {
    apellidos: partes.slice(cantidadNombres).join(' '),
    nombres: partes.slice(0, cantidadNombres).join(' '),
  }
}

export function crearContrasenaTemporalAdmin(dni: string) {
  return `HemoRuta-${dni.trim()}!`
}

export async function listarUsuariosHospitalariosApi(
  filtros: FiltrosUsuariosHospitalariosApi = {},
) {
  const respuesta = await solicitarApi<RespuestaPaginadaBackend<UsuarioHospitalarioBackend>>(
    '/admin/usuarios/',
    {
      consulta: {
        pagina: filtros.pagina,
        q: filtros.busqueda,
        rol: filtros.rol,
        tamanoPagina: filtros.tamanoPagina,
      },
    },
  )

  return {
    paginacion: respuesta.paginacion,
    resultados: respuesta.resultados.map(normalizarUsuario),
  } satisfies RespuestaPaginadaApi<UsuarioHospitalarioListaApi>
}

export async function obtenerUsuarioHospitalarioApi(usuarioId: string) {
  const usuario = await solicitarApi<UsuarioHospitalarioBackend>(
    `/admin/usuarios/${encodeURIComponent(usuarioId)}/`,
  )
  return normalizarUsuario(usuario)
}

export async function obtenerDetalleAdministrativoUsuarioApi(usuarioId: string) {
  const respuesta = await solicitarApi<DetalleAdministrativoBackend>(
    `/admin/usuarios/${encodeURIComponent(usuarioId)}/detalle-administrativo/`,
  )

  return {
    alcance: respuesta.alcance,
    detalleMedico: respuesta.detalle_medico
      ? {
          cargo: respuesta.detalle_medico.cargo,
          consultasEsteMes: respuesta.detalle_medico.consultas_este_mes,
          consultasPorSemana: respuesta.detalle_medico.consultas_por_semana.map((item) => ({
            semanaDesde: item.semana_desde,
            total: item.total,
          })),
          especialidad: respuesta.detalle_medico.especialidad,
          estadoLaboral: respuesta.detalle_medico.estado_laboral,
          numeroColegiatura: respuesta.detalle_medico.numero_colegiatura,
          pacientesActivos: respuesta.detalle_medico.pacientes_activos,
          pacientesAsignados: respuesta.detalle_medico.pacientes_asignados,
          pacientesPrincipales: respuesta.detalle_medico.pacientes_principales,
        }
      : null,
    incluyeDatosClinicos: respuesta.incluye_datos_clinicos,
    pacientes: respuesta.pacientes.map((paciente) => ({
      atendidoPor: paciente.atendido_por
        ? {
            id: paciente.atendido_por.id,
            nombreCompleto: paciente.atendido_por.nombre,
          }
        : null,
      cuentaMovil: paciente.cuenta_movil
        ? {
            alias: paciente.cuenta_movil.alias,
            dispositivo: paciente.cuenta_movil.dispositivo,
            estado: paciente.cuenta_movil.estado,
            ultimoAccesoEn: paciente.cuenta_movil.ultimo_acceso_en,
          }
        : null,
      direccion: paciente.direccion,
      distrito: paciente.distrito,
      dni: paciente.dni,
      edad: paciente.edad,
      estado: paciente.estado,
      fechaNacimiento: paciente.fecha_nacimiento,
      grupoSanguineo: paciente.grupo_sanguineo,
      historiaClinica: paciente.historia_clinica,
      id: paciente.id,
      idiomaPreferido: paciente.idioma_preferido,
      nacionalidad: paciente.nacionalidad,
      nombreCompleto: paciente.nombre_completo,
      medicoResponsable: paciente.medico_responsable
        ? {
            especialidad: paciente.medico_responsable.especialidad,
            id: paciente.medico_responsable.id,
            nombreCompleto: paciente.medico_responsable.nombre,
          }
        : null,
      perfilCompleto: paciente.perfil_completo,
      procedencia: paciente.procedencia,
      sexo: paciente.sexo,
      vinculo: paciente.vinculo
        ? {
            correo: paciente.vinculo.correo,
            esPrincipal: paciente.vinculo.es_principal,
            parentesco: paciente.vinculo.parentesco,
            telefono: paciente.vinculo.telefono,
          }
        : null,
    })),
    tipoDetalle: normalizarRol(respuesta.tipo_detalle),
    usuario: normalizarUsuario(respuesta.usuario),
  } satisfies DetalleAdministrativoUsuarioApi
}

export async function crearUsuarioHospitalarioApi(datos: CrearUsuarioHospitalarioApi) {
  const nombre = separarNombreCompleto(datos.nombres)
  const usuario = await solicitarApi<UsuarioHospitalarioBackend>('/admin/usuarios/', {
    cuerpo: {
      dni: datos.dni.trim(),
      email: datos.correo.trim(),
      estado: 'ACTIVO',
      first_name: nombre.nombres,
      last_name: nombre.apellidos,
      password: crearContrasenaTemporalAdmin(datos.dni),
      requiere_cambio_password: true,
      rol: datos.rol,
      telefono: datos.telefono?.trim() || '',
    },
    method: 'POST',
  })

  return normalizarUsuario(usuario)
}

export async function actualizarUsuarioHospitalarioApi(
  usuarioId: string,
  cambios: Partial<CrearUsuarioHospitalarioApi>,
) {
  const cuerpo: Record<string, unknown> = {}
  if (cambios.correo !== undefined) cuerpo.email = cambios.correo.trim()
  if (cambios.dni !== undefined) cuerpo.dni = cambios.dni.trim()
  if (cambios.rol !== undefined) cuerpo.rol = cambios.rol
  if (cambios.telefono !== undefined) cuerpo.telefono = cambios.telefono.trim()
  if (cambios.nombres !== undefined) {
    const nombre = separarNombreCompleto(cambios.nombres)
    cuerpo.first_name = nombre.nombres
    cuerpo.last_name = nombre.apellidos
  }

  const usuario = await solicitarApi<UsuarioHospitalarioBackend>(
    `/admin/usuarios/${encodeURIComponent(usuarioId)}/`,
    { cuerpo, method: 'PATCH' },
  )
  return normalizarUsuario(usuario)
}
