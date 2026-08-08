import FondoNino from '../../assets/FondoNiño5.png'
import logoHemoRuta from '../../assets/iconoHemoRutaNoBg.png'
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
  const redirigir = useRedirrecion()

  function iniciarSesion({ contrasena, identificador }: CredencialesPaciente) {
    if (identificador && contrasena) {
      redirigir('/paciente/inicio')
    }
  }

  return (
    <AdaptadoMobil estilos='bg-white text-[#082767]'>
      <main className='flex min-h-full w-full flex-col bg-white'>
        <CabeceraLoginPacienteComp {...PRESENTACION_LOGIN} />
        <FormLoginPacienteComp
          contenido={CONTENIDO_FORMULARIO}
          onIniciarSesion={iniciarSesion}
          onRecuperarCuenta={() => redirigir('/paciente/recuperacion')}
          onWhatsApp={() => redirigir('/paciente/verificacion')}
        />
      </main>
    </AdaptadoMobil>
  )
}

export default LoginPacientePage
