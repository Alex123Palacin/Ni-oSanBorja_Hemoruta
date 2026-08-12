import { createContext } from 'react'

import type { CredencialesPersonalApi } from '../api/compartido/AuthApi'
import type { UsuarioSesionApi } from '../api/compartido/TiposApi'
import type { CredencialesPacienteApi } from '../api/paciente/PacienteApi'

export interface AuthContexto {
  autenticado: boolean
  cargando: boolean
  cerrarSesion: () => Promise<void>
  iniciarSesionPaciente: (credenciales: CredencialesPacienteApi) => Promise<UsuarioSesionApi>
  iniciarSesionPersonal: (credenciales: CredencialesPersonalApi) => Promise<UsuarioSesionApi>
  refrescarSesion: () => Promise<UsuarioSesionApi>
  usuario: UsuarioSesionApi | null
}

const AuthContext = createContext<AuthContexto | null>(null)

export default AuthContext
