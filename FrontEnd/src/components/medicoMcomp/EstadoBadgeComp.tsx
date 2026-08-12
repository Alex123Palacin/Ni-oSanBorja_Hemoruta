import type { EstadoPaciente } from '../../types/GestionarPacientes'

const ESTILOS_ESTADO: Record<EstadoPaciente, { fondo: string; punto: string; texto: string }> = {
  Evaluado: { fondo: 'bg-[#dcecff]', punto: 'bg-[#2385f4]', texto: 'text-[#1674dc]' },
  Hoy: { fondo: 'bg-[#dcf5df]', punto: 'bg-[#27bd42]', texto: 'text-[#15952d]' },
  Programado: { fondo: 'bg-[#ffead2]', punto: 'bg-[#ff8a1f]', texto: 'text-[#f1780d]' },
}

interface EstadoBadgeCompProps {
  estado: EstadoPaciente
}

function EstadoBadgeComp({ estado }: EstadoBadgeCompProps) {
  const estilo = ESTILOS_ESTADO[estado]

  return (
    <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold ${estilo.texto}`}>
      <span aria-hidden='true' className={`grid h-4 w-4 place-items-center rounded-[5px] ${estilo.fondo}`}>
        <span className={`h-2 w-2 rounded-full ${estilo.punto}`} />
      </span>
      {estado}
    </span>
  )
}

export default EstadoBadgeComp
