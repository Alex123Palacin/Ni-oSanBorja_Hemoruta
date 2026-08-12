import {
  useEffect,
  useState,
  type PropsWithChildren,
} from 'react'

import {
  cerrarSesionApi,
  iniciarSesionPersonalApi,
  obtenerSesionActualApi,
  type CredencialesPersonalApi,
} from '../api/compartido/AuthApi'
import {
  eliminarTokenApi,
  esTokenPersistenteApi,
  ErrorApi,
  EVENTO_SESION_INVALIDA_API,
  guardarTokenApi,
  obtenerTokenApi,
} from '../api/compartido/ClienteApi'
import type { UsuarioSesionApi } from '../api/compartido/TiposApi'
import {
  iniciarSesionPacienteApi,
  type CredencialesPacienteApi,
} from '../api/paciente/PacienteApi'
import AuthContext from './AuthContext'

const CLAVE_USUARIO = 'hemoruta.usuario'

function leerUsuarioGuardado(persistente: boolean) {
  try {
    const almacenamiento = persistente ? window.localStorage : window.sessionStorage
    const contenido = almacenamiento.getItem(CLAVE_USUARIO)
    return contenido ? (JSON.parse(contenido) as UsuarioSesionApi) : null
  } catch {
    return null
  }
}

function guardarUsuario(usuario: UsuarioSesionApi, persistente: boolean) {
  const almacenamiento = persistente ? window.localStorage : window.sessionStorage
  almacenamiento.setItem(CLAVE_USUARIO, JSON.stringify(usuario))
}

function eliminarUsuarioGuardado(persistente: boolean) {
  try {
    const almacenamiento = persistente ? window.localStorage : window.sessionStorage
    almacenamiento.removeItem(CLAVE_USUARIO)
  } catch {
    // La sesión en memoria se elimina aunque el navegador bloquee localStorage.
  }
}

function AuthProvider({ children }: PropsWithChildren) {
  const [usuario, setUsuario] = useState<UsuarioSesionApi | null>(null)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    let activo = true
    const token = obtenerTokenApi()
    const persistente = esTokenPersistenteApi()
    const usuarioGuardado = leerUsuarioGuardado(persistente)

    function invalidarSesionLocal(event: Event) {
      const persistente =
        event instanceof CustomEvent &&
        typeof event.detail === 'object' &&
        event.detail !== null &&
        event.detail.persistente === true
      eliminarUsuarioGuardado(persistente)
      setUsuario(null)
    }

    window.addEventListener(EVENTO_SESION_INVALIDA_API, invalidarSesionLocal)

    if (!token) {
      setCargando(false)
      return () => window.removeEventListener(EVENTO_SESION_INVALIDA_API, invalidarSesionLocal)
    }

    if (usuarioGuardado) setUsuario(usuarioGuardado)

    void obtenerSesionActualApi()
      .then((usuarioActual) => {
        if (!activo) return
        guardarUsuario(usuarioActual, persistente)
        setUsuario(usuarioActual)
      })
      .catch((error: unknown) => {
        if (!activo) return

        const sesionInvalida = error instanceof ErrorApi && error.estado === 401
        if (sesionInvalida || !usuarioGuardado) {
          eliminarTokenApi()
          eliminarUsuarioGuardado(persistente)
          setUsuario(null)
        }
      })
      .finally(() => {
        if (activo) setCargando(false)
      })

    return () => {
      activo = false
      window.removeEventListener(EVENTO_SESION_INVALIDA_API, invalidarSesionLocal)
    }
  }, [])

  async function iniciarSesionPersonal(credenciales: CredencialesPersonalApi) {
    const sesion = await iniciarSesionPersonalApi(credenciales)

    if (sesion.usuario.rol === 'PACIENTE') {
      throw new Error('Esta cuenta debe ingresar desde el acceso para pacientes.')
    }

    guardarTokenApi(sesion.token, credenciales.recordarme)
    guardarUsuario(sesion.usuario, credenciales.recordarme)
    setUsuario(sesion.usuario)
    return sesion.usuario
  }

  async function iniciarSesionPaciente(credenciales: CredencialesPacienteApi) {
    const sesion = await iniciarSesionPacienteApi(credenciales)
    guardarTokenApi(sesion.token, credenciales.recordarme)
    guardarUsuario(sesion.usuario, credenciales.recordarme)
    setUsuario(sesion.usuario)
    return sesion.usuario
  }

  async function cerrarSesion() {
    const persistente = esTokenPersistenteApi()
    try {
      if (obtenerTokenApi()) await cerrarSesionApi()
    } finally {
      eliminarTokenApi()
      eliminarUsuarioGuardado(persistente)
      for (const almacenamiento of [window.sessionStorage, window.localStorage]) {
        almacenamiento.removeItem('hemoruta.admin.ultimoUsuarioCreado')
        almacenamiento.removeItem('hemoruta.admin.usuarioSeleccionado')
        almacenamiento.removeItem('hemoruta.medico.pacienteId')
      }
      setUsuario(null)
    }
  }

  async function refrescarSesion() {
    const usuarioActual = await obtenerSesionActualApi()
    const persistente = esTokenPersistenteApi()
    guardarUsuario(usuarioActual, persistente)
    setUsuario(usuarioActual)
    return usuarioActual
  }

  return (
    <AuthContext.Provider
      value={{
        autenticado: Boolean(usuario),
        cargando,
        cerrarSesion,
        iniciarSesionPaciente,
        iniciarSesionPersonal,
        refrescarSesion,
        usuario,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export default AuthProvider
