import { solicitarApi } from './ClienteApi'
import type { RolUsuarioApi, SesionApi, UsuarioSesionApi } from './TiposApi'

export interface CredencialesPersonalApi {
  contrasena: string
  identificador: string
  recordarme: boolean
}

function esObjeto(valor: unknown): valor is Record<string, unknown> {
  return typeof valor === 'object' && valor !== null
}

function normalizarRolApi(valor: unknown): RolUsuarioApi {
  const rol = String(valor ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()

  if (rol.includes('ADMIN')) return 'ADMINISTRADOR'
  if (rol.includes('MEDIC') || rol.includes('DOCTOR')) return 'MEDICO'
  if (rol.includes('PACIENT') || rol.includes('TUTOR') || rol.includes('GUARDIAN')) return 'PACIENTE'

  throw new Error('El servidor devolvió un rol de usuario no reconocido.')
}

function normalizarUsuarioApi(valor: unknown): UsuarioSesionApi {
  if (!esObjeto(valor)) throw new Error('El servidor no devolvió los datos del usuario.')

  const id = valor.id ?? valor.userId ?? valor.usuarioId
  const nombre = valor.nombre ?? valor.name ?? valor.displayName
  const rol = valor.rol ?? valor.role
  const perfilMedico = esObjeto(valor.perfil_medico) ? valor.perfil_medico : null
  const apellidos =
    typeof valor.apellidos === 'string'
      ? valor.apellidos
      : typeof valor.last_name === 'string'
        ? valor.last_name
        : undefined
  const nombreCompleto =
    typeof valor.nombre_completo === 'string' && valor.nombre_completo.trim()
      ? valor.nombre_completo
      : [nombre, apellidos].filter((parte) => typeof parte === 'string' && parte.trim()).join(' ')

  if ((typeof id !== 'string' && typeof id !== 'number') || typeof nombre !== 'string') {
    throw new Error('La respuesta de sesión del servidor está incompleta.')
  }

  return {
    apellidos,
    correo: typeof valor.correo === 'string' ? valor.correo : typeof valor.email === 'string' ? valor.email : undefined,
    especialidad:
      perfilMedico && typeof perfilMedico.especialidad === 'string'
        ? perfilMedico.especialidad
        : undefined,
    fotoPerfil: typeof valor.foto_perfil === 'string' ? valor.foto_perfil : undefined,
    hospitalId: typeof valor.hospitalId === 'string' ? valor.hospitalId : undefined,
    id: String(id),
    medicoId: typeof valor.medicoId === 'string' ? valor.medicoId : undefined,
    nombre,
    nombreCompleto,
    pacienteId: typeof valor.pacienteId === 'string' ? valor.pacienteId : undefined,
    rol: normalizarRolApi(rol),
  }
}

function normalizarSesionApi(valor: unknown): SesionApi {
  if (!esObjeto(valor)) throw new Error('El servidor no devolvió una sesión válida.')

  const token = valor.token ?? valor.accessToken ?? valor.access_token ?? valor.access
  const usuario = valor.usuario ?? valor.user

  if (typeof token !== 'string' || !token) {
    throw new Error('El servidor no devolvió el token de acceso.')
  }

  return { token, usuario: normalizarUsuarioApi(usuario) }
}

export async function iniciarSesionPersonalApi(credenciales: CredencialesPersonalApi) {
  const respuesta = await solicitarApi<unknown>('/auth/personal/login/', {
    autenticado: false,
    cuerpo: {
      identificador: credenciales.identificador,
      password: credenciales.contrasena,
      recordarme: credenciales.recordarme,
    },
    method: 'POST',
  })

  return normalizarSesionApi(respuesta)
}

export async function obtenerSesionActualApi() {
  const respuesta = await solicitarApi<unknown>('/auth/me/')
  const contenedor = esObjeto(respuesta) && ('usuario' in respuesta || 'user' in respuesta)
    ? (respuesta.usuario ?? respuesta.user)
    : respuesta

  return normalizarUsuarioApi(contenedor)
}

export function cerrarSesionApi() {
  return solicitarApi<void>('/auth/logout/', { method: 'POST' })
}
