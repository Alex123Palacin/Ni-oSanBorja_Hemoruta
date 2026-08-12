import type { PacienteSeguimiento, SemaforoPaciente } from '../../types/SeguimientoPacientesLista'

const ESTILOS_SEMAFORO: Record<SemaforoPaciente, { punto: string; texto: string }> = {
  Amarillo: { punto: 'bg-[#ffa31a]', texto: 'text-[#df8610]' },
  Rojo: { punto: 'bg-[#ef3f4b]', texto: 'text-[#df3340]' },
  Verde: { punto: 'bg-[#14b94d]', texto: 'text-[#15923e]' },
}

interface SemaforoBadgeCompProps {
  mostrarDescripcion?: boolean
  paciente: Pick<PacienteSeguimiento, 'descripcionSemaforo' | 'semaforo'>
}

function SemaforoBadgeComp({ mostrarDescripcion = true, paciente }: SemaforoBadgeCompProps) {
  const estilo = ESTILOS_SEMAFORO[paciente.semaforo]

  if (!mostrarDescripcion) {
    return (
      <span className={`flex items-center gap-1 font-bold ${estilo.texto}`}>
        <span aria-hidden='true' className={`h-2 w-2 rounded-full ${estilo.punto}`} />
        {paciente.semaforo}
      </span>
    )
  }

  return (
    <span className='block leading-[11px]'>
      <strong className={`flex items-center gap-1.5 text-[9px] ${estilo.texto}`}>
        <span aria-hidden='true' className={`h-2 w-2 rounded-full ${estilo.punto}`} />
        {paciente.semaforo}
      </strong>
      <span className='mt-0.5 block text-[8px] leading-[10px] text-[#52688d]'>{paciente.descripcionSemaforo}</span>
    </span>
  )
}

export default SemaforoBadgeComp
