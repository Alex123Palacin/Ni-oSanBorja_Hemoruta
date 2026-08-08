import FondoNino from '../../assets/FondoNiño5.png'
import logoHemoRuta from '../../assets/iconoHemoRutaNoBg.png'
import AdaptadoMobil from '../../components/pacienteMcomp/AdaptadoMobil'
import CabeceraVerificacionPacienteComp from '../../components/pacienteMcomp/CabeceraVerificacionPacienteComp'
import FormVerificacionPacienteComp, {
  type ContenidoFormVerificacionPaciente,
  type DatosVerificacionPaciente,
} from '../../components/pacienteMcomp/FormVerificacionPacienteComp'
import useRedirrecion from '../../hooks/Redirrecion'

const PRESENTACION_VERIFICACION = {
  imagenPaciente: FondoNino,
  logo: logoHemoRuta,
  logoAlt: 'HemoRuta Pediátrica',
  subtitulo: 'Código enviado a',
  telefono: '+51 9** *** *1',
  titulo: 'Verifica\ntu acceso',
} as const

const REQUISITOS_CONTRASENA = [
  'Mínimo 8 caracteres',
  'Al menos un número',
  'Al menos una mayúscula',
  'Al menos un carácter especial',
] as const

const CONTENIDO_VERIFICACION: ContenidoFormVerificacionPaciente = {
  codigoEtiqueta: 'Ingresa el código de 6 dígitos',
  codigoInicial: '1',
  confirmarContrasena: 'Confirmar contraseña',
  confirmarContrasenaPlaceholder: 'Vuelve a ingresar tu contraseña',
  contrasenasNoCoinciden: 'Las contraseñas no coinciden.',
  expiracionCodigo: 'El código expirará en',
  guardarContrasena: 'Guardar contraseña',
  nuevaContrasena: 'Nueva contraseña',
  nuevaContrasenaPlaceholder: 'Ingresa tu nueva contraseña',
  reenviarCodigo: 'Reenviar código',
  requisitos: REQUISITOS_CONTRASENA,
  requisitosTitulo: 'Tu contraseña debe contener:',
  tiempoExpiracion: '04:52',
}

function VerificacionCuentaPacientePage() {
  const redirigir = useRedirrecion()

  function guardarContrasena({ codigo, contrasena }: DatosVerificacionPaciente) {
    if (codigo.length === 6 && contrasena.length >= 8) {
      redirigir('/paciente/login')
    }
  }

  return (
    <AdaptadoMobil estilos='bg-white text-[#082767]'>
      <main className='flex min-h-full w-full flex-col bg-white'>
        <CabeceraVerificacionPacienteComp {...PRESENTACION_VERIFICACION} />
        <FormVerificacionPacienteComp contenido={CONTENIDO_VERIFICACION} onGuardar={guardarContrasena} />
      </main>
    </AdaptadoMobil>
  )
}

export default VerificacionCuentaPacientePage
