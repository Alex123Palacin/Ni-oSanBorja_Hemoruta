import type { PerfilFichaPaciente } from '../types/FichaPaciente'
import IconoMedico from './IconoMedico'

interface PerfilDocPacientCompProps {
  onHistorial: () => void
  perfil: PerfilFichaPaciente
}

function PerfilDocPacientComp({ onHistorial, perfil }: PerfilDocPacientCompProps) {
  return (
    <article className='rounded-xl border border-[#dce5ee] bg-white p-4 shadow-[0_2px_8px_rgba(18,52,91,0.05)]'>
      <div className='grid gap-x-4 gap-y-3 md:grid-cols-[96px_minmax(0,1fr)_130px]'>
        <div className='relative mx-auto h-[92px] w-[92px] overflow-visible md:row-span-2 md:mx-0'>
          <span className='relative block h-full w-full overflow-hidden rounded-full border-4 border-[#e2f4f5] bg-[#e6f7f5]'>
            <img
              alt={`Foto de ${perfil.nombre}`}
              className='absolute left-1/2 top-[-18%] h-[185%] w-[185%] max-w-none -translate-x-1/2 object-cover'
              draggable={false}
              src={perfil.imagen}
            />
          </span>
          <span className='absolute bottom-0 right-0 grid h-7 w-7 place-items-center rounded-full border-2 border-white bg-[#4d6390] text-white shadow-sm'>
            <IconoMedico className='h-4 w-4' nombre='camera' strokeWidth={1.9} />
          </span>
        </div>

        <div className='min-w-0 text-center md:text-left'>
          <div className='flex flex-wrap items-center justify-center gap-2 md:justify-start'>
            <h2 className='truncate text-[18px] font-extrabold tracking-[-0.02em] text-[#092a76]'>{perfil.nombre}</h2>
            <span className='inline-flex items-center gap-1 rounded-full bg-[#e1f7e7] px-2 py-1 text-[8px] font-bold text-[#15953b]'>
              <span className='h-1.5 w-1.5 rounded-full bg-[#23b743]' />
              {perfil.estadoCuenta}
            </span>
          </div>
          <div className='mt-1 flex flex-wrap items-center justify-center gap-5 text-[9px] font-semibold text-[#536a91] md:justify-start'>
            <span className='flex items-center gap-1.5'>
              <IconoMedico className='h-3.5 w-3.5 text-[#31559f]' nombre='calendar' />
              {perfil.edad} años
            </span>
            <span className='flex items-center gap-1.5'>
              <IconoMedico className='h-3.5 w-3.5 text-[#31559f]' nombre='idCard' />
              {perfil.historiaClinica}
            </span>
          </div>
        </div>

        <button
          className='mx-auto flex h-9 w-[130px] cursor-pointer items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#08aabc] to-[#078da9] text-[11px] font-bold text-white shadow-sm transition hover:brightness-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#08aabb] md:mx-0'
          onClick={onHistorial}
          type='button'
        >
          <IconoMedico className='h-5 w-5' nombre='clock' />
          Historial
        </button>

        <dl className='grid border-t border-[#e3eaf1] pt-3 sm:grid-cols-2 md:col-span-2 md:grid-cols-5'>
          <div className='px-3 py-1 md:border-r md:border-[#e3eaf1]'>
            <dt className='text-[8px] font-semibold text-[#53698e]'>Adulto responsable</dt>
            <dd className='mt-1 text-[9px] font-extrabold text-[#153579]'>{perfil.adultoResponsable}</dd>
            <dd className='text-[8px] text-[#53698e]'>{perfil.parentescoResponsable}</dd>
          </div>
          <div className='px-3 py-1 md:border-r md:border-[#e3eaf1]'>
            <dt className='text-[8px] font-semibold text-[#53698e]'>Diagnóstico principal</dt>
            <dd className='mt-1 text-[9px] font-extrabold leading-[13px] text-[#153579]'>{perfil.diagnosticoPrincipal}</dd>
          </div>
          <div className='px-3 py-1 md:border-r md:border-[#e3eaf1]'>
            <dt className='text-[8px] font-semibold text-[#53698e]'>Tipo de sangre</dt>
            <dd className='mt-1 text-[10px] font-extrabold text-[#153579]'>{perfil.tipoSangre}</dd>
          </div>
          <div className='px-3 py-1 md:border-r md:border-[#e3eaf1]'>
            <dt className='text-[8px] font-semibold text-[#53698e]'>Médico tratante</dt>
            <dd className='mt-1 text-[9px] font-extrabold text-[#153579]'>{perfil.medicoTratante}</dd>
            <dd className='text-[8px] text-[#53698e]'>{perfil.especialidadMedica}</dd>
          </div>
          <div className='px-3 py-1'>
            <dt className='text-[8px] font-semibold text-[#53698e]'>Estado de la cuenta</dt>
            <dd className='mt-1'>
              <span className='inline-flex items-center gap-1 rounded-full bg-[#e1f7e7] px-2 py-1 text-[8px] font-bold text-[#15953b]'>
                <span className='h-1.5 w-1.5 rounded-full bg-[#23b743]' />
                {perfil.estadoCuenta}
              </span>
            </dd>
            <dd className='mt-1 text-[8px] text-[#53698e]'>{perfil.cuentaMovil}</dd>
          </div>
        </dl>
      </div>
    </article>
  )
}

export default PerfilDocPacientComp
