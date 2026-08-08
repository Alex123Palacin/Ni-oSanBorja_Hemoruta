import { Link } from 'react-router-dom'
import IconoMedico from '../IconoMedico'

export interface InformacionPacienteCompProps {
  actualizacionDescripcion: string
  actualizacionFecha: string
  actualizacionFechaIso: string
  actualizacionTitulo: string
  ariaLabel?: string
  documentosTexto: string
  documentosRuta: string
  imagenAlt?: string
  imagenPaciente: string
  importanteDescripcion: string
  importanteTitulo: string
}

function InformacionPacienteComp({
  actualizacionDescripcion,
  actualizacionFecha,
  actualizacionFechaIso,
  actualizacionTitulo,
  ariaLabel = 'Información actualizada del paciente',
  documentosRuta,
  documentosTexto,
  imagenAlt = 'Niño de HemoRuta saludando',
  imagenPaciente,
  importanteDescripcion,
  importanteTitulo,
}: InformacionPacienteCompProps) {
  return (
    <section aria-label={ariaLabel}>
      <article className='relative flex h-[52px] items-center overflow-hidden rounded-xl border border-[#d9e8f5] bg-[#f2f8ff] px-2.5 pr-[58px]'>
        <span className='grid h-7 w-7 shrink-0 place-items-center rounded-full border border-[#84b8eb] bg-white text-[#2678d9]'>
          <IconoMedico className='h-[16px] w-[16px]' nombre='info' strokeWidth={1.8} />
        </span>
        <div className='ml-2 min-w-0'>
          <h2 className='text-[8.5px] font-extrabold leading-[11px] text-[#17366f]'>{actualizacionTitulo}</h2>
          <time className='block text-[7px] font-semibold leading-[9px] text-[#345887]' dateTime={actualizacionFechaIso}>
            {actualizacionFecha}
          </time>
          <p className='truncate text-[6.5px] font-medium leading-[9px] text-[#5d7395]'>{actualizacionDescripcion}</p>
        </div>
        <span className='absolute bottom-1 right-2 grid h-9 w-9 place-items-center rounded-[50%_50%_55%_45%] bg-[#09aeb4] text-white shadow-[0_3px_8px_rgba(0,151,162,0.2)]'>
          <IconoMedico className='h-[22px] w-[22px]' nombre='droplet' strokeWidth={1.5} />
        </span>
      </article>

      <article className='relative mt-1.5 flex h-[52px] items-center overflow-hidden rounded-xl border border-[#d6eeee] bg-[#f1fbfb] px-2.5 pr-[91px]' role='note'>
        <span className='grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white text-[#02aeb2] shadow-[0_2px_7px_rgba(0,151,162,0.10)]'>
          <IconoMedico className='h-[20px] w-[20px]' nombre='shield' strokeWidth={1.7} />
        </span>
        <div className='ml-2 min-w-0'>
          <h2 className='text-[8.5px] font-extrabold leading-[11px] text-[#008f9c]'>{importanteTitulo}</h2>
          <p className='text-[6.5px] font-medium leading-[9px] text-[#456989]'>{importanteDescripcion}</p>
        </div>
        <div className='absolute bottom-0 right-0 h-[52px] w-[82px] overflow-hidden'>
          <img
            alt={imagenAlt}
            className='absolute -left-[25px] -top-[12px] h-[118px] w-[118px] max-w-none object-cover'
            draggable={false}
            src={imagenPaciente}
          />
        </div>
      </article>

      <Link
        className='mt-1.5 flex h-[40px] items-center rounded-xl border border-[#e0e7ee] bg-white px-3 text-[8px] font-bold text-[#17366f] shadow-[0_2px_8px_rgba(23,55,96,0.04)] transition hover:border-[#91d8dd] hover:bg-[#f8fcfd] focus-visible:outline-2 focus-visible:outline-[#08aabb]'
        to={documentosRuta}
      >
        <IconoMedico className='mr-2 h-[17px] w-[17px] text-[#00aeb2]' nombre='file' strokeWidth={1.7} />
        {documentosTexto}
        <IconoMedico className='ml-auto h-[15px] w-[15px] text-[#1e57a0]' nombre='arrowRight' strokeWidth={1.8} />
      </Link>
    </section>
  )
}

export default InformacionPacienteComp
