import PerfilPacienteNiñoComp, { type DatosPerfilPacienteNino } from './PerfilPacienteNiñoComp'

export type DatosPerfilPaciente = DatosPerfilPacienteNino

interface PerfilPacienteCompProps {
  paciente: DatosPerfilPaciente
}

function PerfilPacienteComp({ paciente }: PerfilPacienteCompProps) {
  return <PerfilPacienteNiñoComp paciente={paciente} />
}

export default PerfilPacienteComp
