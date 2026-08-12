import type { PerfilFichaPaciente } from '../types/FichaPaciente'
import IconoMedico from './IconoMedico'

interface PerfilDocPacientCompProps {
  onHistorial: () => void
  perfil: PerfilFichaPaciente
}

function InsigniaActiva({ texto }: { texto: string }) {
  return (
    <span className='inline-flex items-center gap-1.5 rounded-full bg-[#e1f7e7] px-2.5 py-1 text-[10px] font-bold text-[#15953b]'>
      <span aria-hidden='true' className='h-2 w-2 rounded-full bg-[#23b743]' />
      {texto}
    </span>
  )
}

function PerfilDocPacientComp({ onHistorial, perfil }: PerfilDocPacientCompProps) {
  return (
    <article className='min-h-[164px] rounded-xl border border-[#dce5ee] bg-white p-3.5 shadow-[0_3px_10px_rgba(18,52,91,0.06)] sm:p-4'>
      <div className='grid gap-x-5 gap-y-3 md:grid-cols-[122px_minmax(0,1fr)_160px]'>
        <div className='relative mx-auto h-[120px] w-[120px] overflow-visible md:row-span-2 md:mx-0'>
          <span className='relative block h-full w-full overflow-hidden rounded-full border-4 border-[#dff3f5] bg-[#e5f7f5]'>
            <img
              alt={`Foto de ${perfil.nombre}`}
              className='absolute left-1/2 top-[-18%] h-[185%] w-[185%] max-w-none -translate-x-1/2 object-cover'
              draggable={false}
              src={perfil.imagen}
            />
          </span>
          <span className='absolute bottom-0 right-0 grid h-8 w-8 place-items-center rounded-full border-2 border-white bg-[#4d6390] text-white shadow-sm'>
            <IconoMedico className='h-[18px] w-[18px]' nombre='camera' strokeWidth={1.9} />
          </span>
        </div>

        <div className='min-w-0 self-start text-center md:text-left'>
          <div className='flex flex-wrap items-center justify-center gap-3 md:justify-start'>
            <h2 className='truncate text-[clamp(20px,1.75vw,23px)] font-extrabold leading-7 tracking-[-0.025em] text-[#092a76]'>
              {perfil.nombre}
            </h2>
            <InsigniaActiva texto={perfil.estadoCuenta} />
          </div>
          <div className='mt-1.5 flex flex-wrap items-center justify-center gap-5 text-[11px] font-semibold text-[#536a91] md:justify-start'>
            <span className='flex items-center gap-2'>
              <IconoMedico className='h-4 w-4 text-[#31559f]' nombre='calendar' />
              {perfil.edad === null ? 'Edad no registrada' : `${perfil.edad} años`}
            </span>
            <span className='flex items-center gap-2 border-l border-[#dfe7ef] pl-5'>
              <IconoMedico className='h-4 w-4 text-[#31559f]' nombre='idCard' />
              {perfil.historiaClinica}
            </span>
          </div>
        </div>

        <button
          className='mx-auto flex h-[42px] w-[160px] cursor-pointer items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-[#08aabc] to-[#078da9] text-[15px] font-bold text-white shadow-[0_4px_10px_rgba(5,111,124,0.16)] transition hover:-translate-y-0.5 hover:brightness-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#08aabb] active:translate-y-0 md:mx-0 md:-translate-x-5'
          onClick={onHistorial}
          type='button'
        >
          <IconoMedico className='h-6 w-6' nombre='clock' />
          Historial
        </button>

        <dl className='grid border-t border-[#e3eaf1] pt-3 sm:grid-cols-2 md:col-span-2 md:grid-cols-[1.15fr_1.35fr_.72fr_1fr_1.15fr]'>
          <div className='px-3 py-1 md:border-r md:border-[#e3eaf1]'>
            <dt className='text-[9px] font-semibold text-[#53698e]'>Adulto responsable</dt>
            <dd className='mt-1 text-[11px] font-extrabold text-[#153579]'>{perfil.adultoResponsable}</dd>
            <dd className='text-[9px] text-[#53698e]'>{perfil.parentescoResponsable}</dd>
          </div>
          <div className='px-3 py-1 md:border-r md:border-[#e3eaf1]'>
            <dt className='text-[9px] font-semibold text-[#53698e]'>Diagnóstico principal</dt>
            <dd className='mt-1 text-[10px] font-extrabold leading-[14px] text-[#153579]'>
              {perfil.diagnosticoPrincipal}
            </dd>
          </div>
          <div className='px-3 py-1 md:border-r md:border-[#e3eaf1]'>
            <dt className='text-[9px] font-semibold text-[#53698e]'>Tipo de sangre</dt>
            <dd className='mt-1 text-[12px] font-extrabold text-[#153579]'>{perfil.tipoSangre}</dd>
          </div>
          <div className='px-3 py-1 md:border-r md:border-[#e3eaf1]'>
            <dt className='text-[9px] font-semibold text-[#53698e]'>Médico tratante</dt>
            <dd className='mt-1 text-[10px] font-extrabold text-[#153579]'>{perfil.medicoTratante}</dd>
            <dd className='text-[9px] text-[#53698e]'>{perfil.especialidadMedica}</dd>
          </div>
          <div className='px-3 py-1'>
            <dt className='text-[9px] font-semibold text-[#53698e]'>Estado de la cuenta</dt>
            <dd className='mt-1'>
              <InsigniaActiva texto={perfil.estadoCuenta} />
            </dd>
            <dd className='mt-1 text-[9px] text-[#53698e]'>{perfil.cuentaMovil}</dd>
          </div>
        </dl>
      </div>
    </article>
  )
}

export default PerfilDocPacientComp
