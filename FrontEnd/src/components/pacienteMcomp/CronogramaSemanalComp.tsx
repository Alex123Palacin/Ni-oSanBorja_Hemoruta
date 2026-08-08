import IconoMedico from '../IconoMedico'

export type EstadoDiaMedicacion = 'completado' | 'pendiente-hoy' | 'pendiente' | 'sin-dosis'

export interface DiaMedicacionPaciente {
  dia: string
  estado: EstadoDiaMedicacion
  id: string
  nombre: string
}

interface CronogramaSemanalCompProps {
  dias: readonly DiaMedicacionPaciente[]
}

const ESTILOS_ESTADO: Record<EstadoDiaMedicacion, { circulo: string; icono: 'check' | 'clock' | 'x'; texto: string }> = {
  completado: { circulo: 'border-[#50c65c] text-[#3ab94b]', icono: 'check', texto: 'Completado' },
  'pendiente-hoy': { circulo: 'border-[#2987ed] text-[#217fe4]', icono: 'clock', texto: 'Pendiente (hoy)' },
  pendiente: { circulo: 'border-[#9eabba] text-[#8c9aaa]', icono: 'clock', texto: 'Pendiente' },
  'sin-dosis': { circulo: 'border-[#aeb8c4] text-[#99a6b4]', icono: 'x', texto: 'Sin dosis' },
}

function CronogramaSemanalComp({ dias }: CronogramaSemanalCompProps) {
  const leyenda = (['completado', 'pendiente-hoy', 'pendiente', 'sin-dosis'] as const).map((estado) => ({
    estado,
    ...ESTILOS_ESTADO[estado],
  }))

  return (
    <section className='h-[106px] rounded-xl border border-[#e0e8ef] bg-white px-2 pb-2 pt-1.5 shadow-[0_3px_10px_rgba(23,55,96,0.05)]'>
      <div className='grid grid-cols-7 gap-1'>
        {dias.map((dia) => {
          const estilo = ESTILOS_ESTADO[dia.estado]
          const esHoy = dia.estado === 'pendiente-hoy'

          return (
            <div
              aria-label={`${dia.nombre}: ${estilo.texto}`}
              className={`flex h-[61px] min-w-0 flex-col items-center rounded-lg pt-1 ${esHoy ? 'bg-[#f1f7ff]' : ''}`}
              key={dia.id}
            >
              <span className={`text-[8px] font-extrabold ${esHoy ? 'text-[#1b5fb5]' : 'text-[#19386f]'}`}>{dia.dia}</span>
              <span className={`mt-1 grid h-5 w-5 place-items-center rounded-full border ${estilo.circulo}`}>
                <IconoMedico className='h-3 w-3' nombre={estilo.icono} strokeWidth={1.8} />
              </span>
              {esHoy && <strong className='mt-1 text-[6.5px] font-bold text-[#217fe4]'>Hoy</strong>}
            </div>
          )
        })}
      </div>

      <div className='mt-1 grid grid-cols-4 gap-1'>
        {leyenda.map((item) => (
          <span className='flex min-w-0 items-center justify-center gap-1 text-[5.7px] font-medium text-[#60718f]' key={item.estado}>
            <span className={`grid h-2.5 w-2.5 shrink-0 place-items-center rounded-full border ${item.circulo}`}>
              <IconoMedico className='h-1.5 w-1.5' nombre={item.icono} strokeWidth={2} />
            </span>
            <span className='truncate'>{item.texto}</span>
          </span>
        ))}
      </div>
    </section>
  )
}

export default CronogramaSemanalComp
