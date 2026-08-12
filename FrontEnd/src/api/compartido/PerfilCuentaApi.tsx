import { solicitarApi } from './ClienteApi'
import type { RolUsuarioApi } from './TiposApi'

export interface PerfilCuentaApi {
  apellidos: string
  correo: string
  fotoPerfil?: string
  id: string
  nombre: string
  nombreCompleto: string
  rol: RolUsuarioApi
  telefono: string
}

interface PerfilCuentaRespuesta {
  apellidos?: string
  email?: string
  foto_perfil?: string | null
  id: string
  nombre?: string
  nombre_completo?: string
  rol: RolUsuarioApi
  telefono?: string
}

function normalizarPerfil(datos: PerfilCuentaRespuesta): PerfilCuentaApi {
  return {
    apellidos: datos.apellidos ?? '',
    correo: datos.email ?? '',
    fotoPerfil: datos.foto_perfil || undefined,
    id: String(datos.id),
    nombre: datos.nombre ?? '',
    nombreCompleto: datos.nombre_completo ?? '',
    rol: datos.rol,
    telefono: datos.telefono ?? '',
  }
}

export async function obtenerPerfilCuentaApi() {
  return normalizarPerfil(await solicitarApi<PerfilCuentaRespuesta>('/auth/perfil/'))
}

export async function actualizarPerfilCuentaApi(datos: {
  apellidos: string
  foto?: File
  nombre: string
  telefono: string
}) {
  const formulario = new FormData()
  formulario.append('nombre', datos.nombre)
  formulario.append('apellidos', datos.apellidos)
  formulario.append('telefono', datos.telefono)
  if (datos.foto) formulario.append('foto', datos.foto)

  return normalizarPerfil(
    await solicitarApi<PerfilCuentaRespuesta>('/auth/perfil/', {
      cuerpo: formulario,
      method: 'PATCH',
    }),
  )
}

export async function quitarFotoPerfilApi() {
  return normalizarPerfil(
    await solicitarApi<PerfilCuentaRespuesta>('/auth/perfil/', {
      cuerpo: { foto: null },
      method: 'PATCH',
    }),
  )
}

export function cambiarContrasenaCuentaApi(datos: {
  confirmarContrasena: string
  contrasenaActual: string
  nuevaContrasena: string
}) {
  return solicitarApi<{ detalle: string }>('/auth/cambiar-contrasena/', {
    cuerpo: {
      confirmar_contrasena: datos.confirmarContrasena,
      contrasena_actual: datos.contrasenaActual,
      nueva_contrasena: datos.nuevaContrasena,
    },
    method: 'POST',
  })
}
