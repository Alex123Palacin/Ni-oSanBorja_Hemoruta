import { solicitarApi, solicitarArchivoApi } from '../compartido/ClienteApi'
import type { CredencialesPersonalApi } from '../compartido/AuthApi'
import type { RespuestaPaginadaApi, SesionApi } from '../compartido/TiposApi'

export type CredencialesPacienteApi = CredencialesPersonalApi

export interface InicioPacienteApi {
  paciente: {
    edad: number | null
    estado: string
    historiaClinica: string
    id: string
    nombre: string
  }
  porcentajePerfil: number
  proximaCita: { estado: string; fechaHora: string } | null
}

export interface TutorPerfilPacienteApi {
  apellidos: string
  autorizado: boolean
  direccion: string
  distrito: string
  dni: string
  email: string
  es_principal: boolean
  horario_contacto: string
  id: string
  nombres: string
  parentesco: 'MADRE' | 'OTRO' | 'PADRE' | 'TUTOR'
  persona_autorizada: string
  preferencia_contacto: 'APP' | 'CORREO' | 'LLAMADA'
  telefono_alternativo: string
  telefono_emergencia: string
  telefono_principal: string
}

export interface DetallePerfilPacienteApi {
  apellidos: string
  direccion: string
  distrito: string
  dni: string | null
  estado: string
  fecha_nacimiento: string | null
  grupo_sanguineo: string
  historia_clinica: string
  id: string
  nombres: string
  perfil_completo: boolean
  procedencia: string
  sexo: 'F' | 'M' | 'N' | 'O'
  tutores: TutorPerfilPacienteApi[]
}

export interface ActualizarDatosPersonalesPacienteApi {
  apellidos?: string
  dni?: string | null
  fecha_nacimiento?: string
  grupo_sanguineo?: string
  nombres?: string
  perfil_completo?: boolean
  procedencia?: string
  sexo?: 'F' | 'M' | 'N' | 'O'
}

export interface ActualizarTutorPacienteApi {
  apellidos?: string
  direccion?: string
  distrito?: string
  dni?: string
  email?: string
  horario_contacto?: string
  nombres?: string
  parentesco?: 'MADRE' | 'OTRO' | 'PADRE' | 'TUTOR'
  persona_autorizada?: string
  preferencia_contacto?: 'APP' | 'CORREO' | 'LLAMADA'
  telefono_alternativo?: string
  telefono_emergencia?: string
  telefono_principal?: string
}

export interface MedicamentoPacienteApi {
  dosis: string
  estadoHoy: string
  horarios: Array<{ diasSemana: number[]; hora: string }>
  id: string
  nombre: string
  ocurrenciaId: string | null
  ocurrencias: OcurrenciaMedicacionPacienteApi[]
  via: string
}

export type EstadoDosisProgramadaPacienteApi = 'CANCELADA' | 'OMITIDA' | 'PENDIENTE' | 'TARDE' | 'TOMADA'

export interface OcurrenciaMedicacionPacienteApi {
  estado: EstadoDosisProgramadaPacienteApi
  fecha: string
  hora: string
  id: string
  motivoNoToma: string | null
  programadaPara: string
  respuesta: 'NO_TOMADA' | 'TARDE' | 'TOMADA' | null
}

export interface DosisHoyMedicacionPacienteApi extends OcurrenciaMedicacionPacienteApi {
  dosis: string
  medicamentoId: string
  nombre: string
  via: string
}

export type EstadoDiaMedicacionPacienteApi =
  | 'COMPLETADO'
  | 'HOY_PENDIENTE'
  | 'NO_TOMADA'
  | 'PARCIAL'
  | 'PENDIENTE'
  | 'SIN_DOSIS'

export interface DiaCalendarioMedicacionPacienteApi {
  completadas: number
  diaSemana: number
  estado: EstadoDiaMedicacionPacienteApi
  fecha: string
  omitidas: number
  pendientes: number
  totalDosis: number
}

export interface RespuestaMedicacionPacienteApi {
  calendario: DiaCalendarioMedicacionPacienteApi[]
  cumplimientoSemanal: number
  dosisHoy: DosisHoyMedicacionPacienteApi[]
  medicamentos: MedicamentoPacienteApi[]
  mes: string
}

export interface RespuestaTratamientoPacienteApi {
  medicamentos: Array<{
    dosis: string
    frecuencia: string
    id: string
    nombre: string
    via: string
  }>
  pacienteId: string
  plan: {
    id: string
    indicacionGeneral: string
    items: Array<{
      descripcion: string
      id: string
      orden: number
      tipo: 'CONTROL' | 'CUIDADO_CASA' | 'EXAMEN' | 'MEDICACION' | 'OTRO' | 'TRATAMIENTO'
      titulo: string
    }>
    nombre: string
    vigenteDesde: string
    vigenteHasta: string | null
  } | null
}

export interface RegistrarSintomasPacienteApi {
  duracion: string
  evolucion: string
  intensidad: string
  observadoEn: string
  observacion?: string
  sintomas: string[]
}

export interface RegistrarTomaMedicamentoPacienteApi {
  motivoNoToma?: string
  ocurrenciaId: string
  respuesta: 'NO_TOMADA' | 'TOMADA' | 'TOMADA_TARDE'
}

export type TipoDocumentoPacienteApi = 'INFORME_MEDICO' | 'LABORATORIO' | 'OTRO'

export interface DocumentoPacienteApi {
  archivoDisponible: boolean
  creadoEn: string
  descripcion: string
  estado: string
  fechaDocumento: string | null
  id: string
  nombre: string
  nombreOriginal?: string
  origen?: 'APP' | 'MEDICO' | 'SISTEMA'
  tamanoBytes: number
  tipo: string
  tipoMime: string
  url: string | null
}

export interface CrearDocumentoPacienteApi {
  archivo: File
  descripcion?: string
  fechaDocumento?: string
  tipo: TipoDocumentoPacienteApi
  titulo: string
}

function esObjeto(valor: unknown): valor is Record<string, unknown> {
  return typeof valor === 'object' && valor !== null
}

function normalizarSesionPacienteApi(valor: unknown): SesionApi {
  if (!esObjeto(valor)) throw new Error('El servidor no devolvió una sesión válida.')

  const token = valor.token ?? valor.accessToken ?? valor.access_token ?? valor.access
  const usuarioBruto = valor.usuario ?? valor.user
  if (typeof token !== 'string' || !esObjeto(usuarioBruto)) {
    throw new Error('La respuesta de inicio de sesión del paciente está incompleta.')
  }

  const id = usuarioBruto.id ?? usuarioBruto.userId ?? usuarioBruto.usuarioId
  const nombre = usuarioBruto.nombre ?? usuarioBruto.name ?? usuarioBruto.displayName
  const rol = String(usuarioBruto.rol ?? usuarioBruto.role ?? '').toUpperCase()
  if ((typeof id !== 'string' && typeof id !== 'number') || typeof nombre !== 'string') {
    throw new Error('Los datos de la cuenta del paciente están incompletos.')
  }
  if (rol !== 'PACIENTE') throw new Error('Esta cuenta no corresponde a un paciente.')

  return {
    token,
    usuario: {
      correo:
        typeof usuarioBruto.correo === 'string'
          ? usuarioBruto.correo
          : typeof usuarioBruto.email === 'string'
            ? usuarioBruto.email
            : undefined,
      id: String(id),
      nombre,
      pacienteId: typeof usuarioBruto.pacienteId === 'string' ? usuarioBruto.pacienteId : undefined,
      rol: 'PACIENTE',
    },
  }
}

export async function iniciarSesionPacienteApi(credenciales: CredencialesPacienteApi) {
  const respuesta = await solicitarApi<unknown>('/auth/paciente/login/', {
    autenticado: false,
    cuerpo: {
      identificador: credenciales.identificador,
      password: credenciales.contrasena,
      recordarme: credenciales.recordarme,
    },
    method: 'POST',
  })

  return normalizarSesionPacienteApi(respuesta)
}

export function obtenerInicioPacienteApi() {
  return solicitarApi<InicioPacienteApi>('/paciente/inicio/')
}

export function obtenerDetallePerfilPacienteApi(pacienteId: string) {
  return solicitarApi<DetallePerfilPacienteApi>(`/pacientes/${encodeURIComponent(pacienteId)}/`)
}

export function actualizarDatosPersonalesPacienteApi(
  pacienteId: string,
  datos: ActualizarDatosPersonalesPacienteApi,
) {
  return solicitarApi<DetallePerfilPacienteApi>(`/pacientes/${encodeURIComponent(pacienteId)}/`, {
    cuerpo: datos,
    method: 'PATCH',
  })
}

export function actualizarTutorPacienteApi(
  tutorId: string,
  datos: ActualizarTutorPacienteApi,
) {
  return solicitarApi<TutorPerfilPacienteApi>(`/tutores-paciente/${encodeURIComponent(tutorId)}/`, {
    cuerpo: datos,
    method: 'PATCH',
  })
}

export function registrarCitaDeclaradaPacienteApi(datos: {
  inicio: string
  medicoConocido?: string
  pacienteId: string
}) {
  return solicitarApi<{ id: string; inicio: string; estado: string }>('/citas/', {
    cuerpo: {
      inicio: datos.inicio,
      motivo: 'Próxima cita declarada por la familia',
      observaciones: datos.medicoConocido
        ? `Médico informado por la familia: ${datos.medicoConocido}`
        : '',
      paciente: datos.pacienteId,
      tipo: 'CONSULTA',
    },
    method: 'POST',
  })
}

export function obtenerMedicacionPacienteApi(mes?: string) {
  return solicitarApi<RespuestaMedicacionPacienteApi>('/paciente/medicacion/', {
    consulta: mes ? { mes } : undefined,
  })
}

export function registrarTomaMedicamentoPacienteApi(datos: RegistrarTomaMedicamentoPacienteApi) {
  return solicitarApi<{ registradoEn: string; registroId: string }>('/paciente/medicacion/tomas/', {
    cuerpo: datos,
    method: 'POST',
  })
}

export function registrarSintomasPacienteApi(datos: RegistrarSintomasPacienteApi) {
  return solicitarApi<{ estado: string; registroId: string }>('/paciente/sintomas/', {
    cuerpo: datos,
    method: 'POST',
  })
}

export function obtenerTratamientoPacienteApi() {
  return solicitarApi<RespuestaTratamientoPacienteApi>('/paciente/tratamiento/')
}

export function listarDocumentosPacienteApi(pagina = 1, tamanoPagina = 20) {
  return solicitarApi<RespuestaPaginadaApi<DocumentoPacienteApi>>('/paciente/documentos/', {
    consulta: { pagina, tamanoPagina },
  })
}

export function subirDocumentoPacienteApi(datos: CrearDocumentoPacienteApi) {
  const formulario = new FormData()
  formulario.append('archivo', datos.archivo)
  formulario.append('descripcion', datos.descripcion?.trim() ?? '')
  if (datos.fechaDocumento) formulario.append('fechaDocumento', datos.fechaDocumento)
  formulario.append('tipo', datos.tipo)
  formulario.append('titulo', datos.titulo)

  return solicitarApi<DocumentoPacienteApi>('/paciente/documentos/', {
    cuerpo: formulario,
    method: 'POST',
  })
}

export function obtenerArchivoDocumentoPacienteApi(documentoId: string, descargar = false) {
  return solicitarArchivoApi(`/paciente/documentos/${documentoId}/archivo/`, {
    consulta: { descargar: descargar ? 1 : 0 },
  })
}
