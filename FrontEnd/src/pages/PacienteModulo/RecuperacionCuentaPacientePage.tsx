import FondoNino from '../../assets/FondoNiño5.png'
import logoHemoRuta from '../../assets/iconoHemoRutaNoBg.png'
import AdaptadoMobil from '../../components/pacienteMcomp/AdaptadoMobil'
import CabeceraRecuperacionPacienteComp from '../../components/pacienteMcomp/CabeceraRecuperacionPacienteComp'
import FormRecuperacionPacienteComp, {
  type ContenidoFormRecuperacionPaciente,
} from '../../components/pacienteMcomp/FormRecuperacionPacienteComp'
import useRedirrecion from '../../hooks/Redirrecion'

const PRESENTACION_RECUPERACION = {
  ilustracionAlt: 'Niño de HemoRuta junto a un escudo que protege su cuenta',
  imagenPaciente: FondoNino,
  logo: logoHemoRuta,
  logoAlt: 'HemoRuta Pediátrica',
} as const

const CONTENIDO_RECUPERACION: ContenidoFormRecuperacionPaciente = {
  ayuda: 'Asegúrate de ingresar los datos con los que te registraste.',
  descripcion: 'Ingresa tu DNI, correo electrónico o teléfono asociado a tu cuenta y te enviaremos un código para que recuperes tu contraseña.',
  enviarCodigo: 'Enviar código',
  identificadorEtiqueta: 'DNI, correo electrónico o teléfono registrado',
  identificadorPlaceholder: 'DNI, correo o teléfono',
  seguridadDescripcion: 'Tus datos están protegidos.',
  seguridadTitulo: 'Tu seguridad es nuestra prioridad.',
  titulo: 'Recuperar contraseña',
  volver: 'Volver',
}

function RecuperacionCuentaPacientePage() {
  const redirigir = useRedirrecion()

  return (
    <AdaptadoMobil estilos='bg-white text-[#082767]'>
      <main className='flex min-h-full w-full flex-col bg-white'>
        <CabeceraRecuperacionPacienteComp {...PRESENTACION_RECUPERACION} />
        <FormRecuperacionPacienteComp
          contenido={CONTENIDO_RECUPERACION}
          onEnviarCodigo={() => redirigir('/paciente/verificacion')}
          onVolver={() => redirigir('/paciente/login')}
        />
      </main>
    </AdaptadoMobil>
  )
}

export default RecuperacionCuentaPacientePage
