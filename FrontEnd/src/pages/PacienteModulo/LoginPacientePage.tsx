import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { obtenerMensajeErrorApi } from '../../api/compartido/ClienteApi'
import FondoNino from '../../assets/FondoNiño5.png'
import logoHemoRuta from '../../assets/iconoHemoRutaNoBg.png'
import useAuth from '../../auth/useAuth'
import AdaptadoMobil from '../../components/pacienteMcomp/AdaptadoMobil'
import CabeceraLoginPacienteComp from '../../components/pacienteMcomp/CabeceraLoginPacienteComp'
import FormLoginPacienteComp, {
  type ContenidoFormLoginPaciente,
  type CredencialesPaciente,
} from '../../components/pacienteMcomp/FormLoginPacienteComp'
import useRedirrecion from '../../hooks/Redirrecion'

const PRESENTACION_LOGIN = {
  imagenPaciente: FondoNino,
  logo: logoHemoRuta,
  subtitulo: 'Accede a la cuenta del paciente',
  titulo: '¡Bienvenido!',
} as const

const CONTENIDO_FORMULARIO: ContenidoFormLoginPaciente = {
  avisoPrivacidad: 'Aviso de privacidad',
  contrasenaPlaceholder: 'Contraseña',
  continuarWhatsApp: 'Continuar con WhatsApp',
  cuentaAdministrada: 'Cuenta administrada por padre, madre o responsable',
  identificadorPlaceholder: 'DNI o correo',
  iniciarSesion: 'Iniciar sesión',
  proteccionDatos: 'Tu información está protegida.',
  recordarme: 'Recordarme',
  recuperarCuenta: '¿Olvidaste tu contraseña?',
  separador: 'o',
}

function LoginPacientePage() {
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { iniciarSesionPaciente } = useAuth()
  const ubicacion = useLocation()
  const navegar = useNavigate()
  const redirigir = useRedirrecion()

  async function iniciarSesion(credenciales: CredencialesPaciente) {
    setCargando(true)
    setError(null)

    try {
      await iniciarSesionPaciente(credenciales)
      const origen = (ubicacion.state as { from?: { pathname?: string } } | null)?.from?.pathname
      navegar(origen?.startsWith('/paciente/') ? origen : '/paciente/inicio', { replace: true })
    } catch (errorSesion) {
      setError(obtenerMensajeErrorApi(errorSesion))
    } finally {
      setCargando(false)
    }
  }

  return (
    <AdaptadoMobil estilos='bg-white text-[#082767]'>
      <main className='flex min-h-full w-full flex-col bg-white'>
        <CabeceraLoginPacienteComp {...PRESENTACION_LOGIN} />
        <FormLoginPacienteComp
          cargando={cargando}
          contenido={CONTENIDO_FORMULARIO}
          error={error}
          onIniciarSesion={iniciarSesion}
          onRecuperarCuenta={() => redirigir('/paciente/recuperacion')}
          onWhatsApp={() => redirigir('/paciente/verificacion')}
        />
      </main>
    </AdaptadoMobil>
  )
}

export default LoginPacientePage
