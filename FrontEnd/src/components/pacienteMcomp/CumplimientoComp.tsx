import IconoMedico from '../IconoMedico'

export interface DatosCumplimientoPaciente {
  detalle: string
  etiqueta: string
  valor: number
}

export interface DatosProximaConsultaPaciente {
  fecha: string
  fechaIso: string
  titulo: string
}

interface CumplimientoCompProps {
  cumplimiento: DatosCumplimientoPaciente
  proximaConsulta: DatosProximaConsultaPaciente
}

function CumplimientoComp({ cumplimiento, proximaConsulta }: CumplimientoCompProps) {
  const porcentaje = Math.min(100, Math.max(0, cumplimiento.valor))

  return (
    <section className='grid h-[75px] grid-cols-[1fr_1.1fr] items-center rounded-xl border border-[#bfe8ed] bg-[#f7fdff] px-3'>
      <div className='flex items-center gap-2.5'>
        <span className='grid h-11 w-11 shrink-0 place-items-center rounded-full border border-[#cde8ec] bg-white text-[#00aeb2] shadow-[0_3px_8px_rgba(20,114,133,0.12)]'>
          <IconoMedico className='h-[23px] w-[23px]' nombre='calendar' strokeWidth={1.8} />
        </span>
        <div className='min-w-0'>
          <p className='text-[8px] font-bold leading-[11px] text-[#17366f]'>{proximaConsulta.titulo}</p>
          <time
            className='block text-[12px] font-extrabold leading-4 text-[#00a6b0]'
            dateTime={proximaConsulta.fechaIso}
          >
            {proximaConsulta.fecha}
          </time>
        </div>
      </div>

      <div className='flex items-center justify-end gap-2 border-l border-[#dce8ee] pl-3'>
        <div
          aria-label={`${cumplimiento.etiqueta}: ${porcentaje}%`}
          aria-valuemax={100}
          aria-valuemin={0}
          aria-valuenow={porcentaje}
          className='relative h-[49px] w-[49px] shrink-0'
          role='meter'
        >
          <svg aria-hidden='true' className='h-full w-full -rotate-90' viewBox='0 0 52 52'>
            <circle cx='26' cy='26' fill='none' r='20' stroke='#dcecee' strokeWidth='4' />
            <circle
              cx='26'
              cy='26'
              fill='none'
              pathLength='100'
              r='20'
              stroke='#079daa'
              strokeDasharray={`${porcentaje} ${100 - porcentaje}`}
              strokeLinecap='round'
              strokeWidth='4'
            />
          </svg>
          <strong className='absolute inset-0 grid place-items-center text-[12px] font-extrabold text-[#079daa]'>{porcentaje}%</strong>
        </div>
        <div className='min-w-0'>
          <p className='text-[7.5px] font-bold leading-[10px] text-[#17366f]'>{cumplimiento.etiqueta}</p>
          <strong className='block text-[11px] font-extrabold leading-[14px] text-[#079daa]'>{porcentaje}%</strong>
          <span className='block text-[7px] font-semibold text-[#3fac50]'>{cumplimiento.detalle}</span>
        </div>
      </div>
    </section>
  )
}

export default CumplimientoComp
