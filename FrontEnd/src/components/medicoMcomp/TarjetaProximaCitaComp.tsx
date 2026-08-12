import IconoMedico from '../IconoMedico'
import BotonSecundarioComp from './BotonSecundarioComp'

export interface ProximaCitaFichaPaciente {
  fecha: string
  hora: string
  motivo: string
  servicio: string
}

interface TarjetaProximaCitaCompProps {
  onVerAgenda?: () => void
  proximaCita: ProximaCitaFichaPaciente
}

function TarjetaProximaCitaComp({ onVerAgenda, proximaCita }: TarjetaProximaCitaCompProps) {
  return (
    <article className='flex min-h-[166px] flex-col rounded-xl border border-[#dce5ee] bg-white p-4 shadow-[0_3px_10px_rgba(18,52,91,0.06)]'>
      <h2 className='text-[12px] font-extrabold text-[#2779e5]'>Próxima cita declarada</h2>
      <div className='mt-3 flex flex-1 items-start gap-4'>
        <IconoMedico className='h-8 w-8 shrink-0 text-[#1378ee]' nombre='calendar' strokeWidth={1.9} />
        <div>
          <div className='flex flex-wrap items-center gap-3'>
            <strong className='text-[17px] text-[#123278]'>{proximaCita.fecha}</strong>
            <span className='inline-flex items-center gap-1.5 rounded-full bg-[#e9f2ff] px-2.5 py-1 text-[9px] font-bold text-[#1474de]'>
              <IconoMedico className='h-3.5 w-3.5' nombre='clock' />
              {proximaCita.hora}
            </span>
          </div>
          <p className='mt-2 text-[10px] leading-[15px] text-[#50668d]'>
            {proximaCita.motivo}
            <br />
            {proximaCita.servicio}
          </p>
        </div>
      </div>
      <BotonSecundarioComp onClick={onVerAgenda}>Ver agenda</BotonSecundarioComp>
    </article>
  )
}

export default TarjetaProximaCitaComp
