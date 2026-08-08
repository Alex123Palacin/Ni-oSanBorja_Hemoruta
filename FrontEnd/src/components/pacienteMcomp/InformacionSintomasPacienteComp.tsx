import InformacionPacienteComp, {
  type InformacionPacienteCompProps,
} from './InformacionPacienteComp'

function InformacionSintomasPacienteComp(props: InformacionPacienteCompProps) {
  return (
    <InformacionPacienteComp
      {...props}
      ariaLabel='Información relacionada con los síntomas'
      imagenAlt='Niño de HemoRuta saludando'
    />
  )
}

export default InformacionSintomasPacienteComp
