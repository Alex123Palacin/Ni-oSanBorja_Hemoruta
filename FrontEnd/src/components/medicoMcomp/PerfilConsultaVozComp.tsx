import IconoMedico from '../IconoMedico'
import { formatearEdadPaciente } from '../../utils/paciente'

export interface PacienteConsultaVoz {
  cuentaMovil: string
  diagnosticoPrincipal: string
  edad: number | null
  estadoCuenta: string
  historiaClinica: string
  imagen: string
  nombre: string
}

interface PerfilConsultaVozCompProps {
  paciente: PacienteConsultaVoz
}

function PerfilConsultaVozComp({ paciente }: PerfilConsultaVozCompProps) {
  return (
    <article className='mt-1.5 grid items-center gap-3 rounded-xl border border-[#dce5ee] bg-white p-2 shadow-[0_2px_8px_rgba(18,52,91,0.04)] sm:grid-cols-[64px_minmax(0,1fr)] lg:grid-cols-[64px_minmax(220px,1fr)_minmax(190px,0.85fr)_minmax(160px,0.7fr)]'>
      <div className='relative mx-auto h-[60px] w-[60px] overflow-hidden rounded-full border-4 border-[#e2f4f5] bg-[#e6f7f5] sm:mx-0'>
        <img
          alt={`Foto de ${paciente.nombre}`}
          className='absolute left-1/2 top-[-18%] h-[185%] w-[185%] max-w-none -translate-x-1/2 object-cover'
          draggable={false}
          src={paciente.imagen}
        />
      </div>

      <div className='min-w-0 text-center sm:text-left'>
        <h2 className='truncate text-[17px] font-extrabold tracking-[-0.02em] text-[#092a76]'>{paciente.nombre}</h2>
        <div className='mt-1.5 flex flex-wrap items-center justify-center gap-5 text-[9px] font-semibold text-[#536a91] sm:justify-start'>
          <span className='flex items-center gap-1.5'>
            <IconoMedico className='h-3.5 w-3.5 text-[#31559f]' nombre='user' />
            {formatearEdadPaciente(paciente.edad)}
          </span>
          <span className='flex items-center gap-1.5'>
            <IconoMedico className='h-3.5 w-3.5 text-[#31559f]' nombre='calendar' />
            {paciente.historiaClinica}
          </span>
        </div>
      </div>

      <dl className='border-t border-[#e3eaf1] pt-2 sm:col-span-2 lg:col-span-1 lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0'>
        <dt className='text-[8px] font-semibold text-[#53698e]'>Diagnóstico principal</dt>
        <dd className='mt-1 text-[10px] font-extrabold leading-[14px] text-[#153579]'>{paciente.diagnosticoPrincipal}</dd>
      </dl>

      <dl className='border-t border-[#e3eaf1] pt-2 sm:col-span-2 lg:col-span-1 lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0'>
        <dt className='text-[8px] font-semibold text-[#53698e]'>Estado de la cuenta</dt>
        <dd className='mt-1 inline-flex items-center gap-1.5 text-[10px] font-extrabold text-[#15953b]'>
          <span className='h-2 w-2 rounded-full bg-[#22b744]' />
          {paciente.estadoCuenta}
        </dd>
        <dd className='mt-1 text-[8px] font-medium text-[#53698e]'>{paciente.cuentaMovil}</dd>
      </dl>
    </article>
  )
}

export default PerfilConsultaVozComp
