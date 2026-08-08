import type { ReactNode } from 'react'

import type { PerfilSeguimientoPaciente } from '../types/SeguimientoPaciente'
import IconoMedico from './IconoMedico'

interface CampoPerfilProps {
  children: ReactNode
  etiqueta: string
}

function CampoPerfil({ children, etiqueta }: CampoPerfilProps) {
  return (
    <div className='border-t border-[#e3eaf1] px-3 py-2 lg:border-l lg:border-t-0'>
      <dt className='text-[7px] font-semibold text-[#586d91]'>{etiqueta}</dt>
      <dd className='mt-1 text-[8px] font-extrabold leading-[12px] text-[#153579]'>{children}</dd>
    </div>
  )
}

interface PerfilSeguimientoPacienteCompProps {
  perfil: PerfilSeguimientoPaciente
}

function PerfilSeguimientoPacienteComp({ perfil }: PerfilSeguimientoPacienteCompProps) {
  return (
    <article className='rounded-xl border border-[#dce5ee] bg-white px-3 py-2.5 shadow-[0_2px_8px_rgba(18,52,91,0.05)]'>
      <dl className='grid items-center gap-x-1 gap-y-2 sm:grid-cols-[66px_minmax(220px,1fr)] lg:grid-cols-[66px_minmax(160px,1.45fr)_0.95fr_0.95fr_0.8fr_0.92fr]'>
        <div className='relative mx-auto h-[62px] w-[62px] overflow-hidden rounded-full border-4 border-[#e1f4f5] bg-[#e6f7f5] sm:mx-0'>
          <img
            alt={`Foto de ${perfil.nombre}`}
            className='absolute left-1/2 top-[-18%] h-[185%] w-[185%] max-w-none -translate-x-1/2 object-cover'
            draggable={false}
            src={perfil.imagen}
          />
        </div>

        <div className='min-w-0 px-2 text-center sm:text-left'>
          <div className='flex flex-wrap items-center justify-center gap-2 sm:justify-start'>
            <dt className='sr-only'>Paciente</dt>
            <dd className='truncate text-[15px] font-extrabold tracking-[-0.02em] text-[#092a76]'>{perfil.nombre}</dd>
            <span className='inline-flex items-center gap-1 rounded-full bg-[#e1f7e7] px-2 py-1 text-[7px] font-bold text-[#15953b]'>
              <span className='h-1.5 w-1.5 rounded-full bg-[#23b743]' />
              {perfil.estado}
            </span>
          </div>
          <div className='mt-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[8px] font-semibold text-[#536a91] sm:justify-start'>
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

        <CampoPerfil etiqueta='Diagnóstico'>{perfil.diagnostico}</CampoPerfil>
        <CampoPerfil etiqueta='Adulto responsable'>
          {perfil.adultoResponsable}
          <span className='mt-0.5 block font-medium text-[#607395]'>{perfil.parentescoResponsable}</span>
        </CampoPerfil>
        <CampoPerfil etiqueta='Semáforo actual'>
          <span className='flex items-center gap-1 text-[#15953b]'>
            <span className='h-2.5 w-2.5 rounded-full bg-[#18b94a] shadow-[0_0_0_3px_rgba(24,185,74,0.12)]' />
            {perfil.semaforo}
          </span>
          <span className='mt-1 block font-medium text-[#607395]'>{perfil.semaforoDescripcion}</span>
        </CampoPerfil>
        <CampoPerfil etiqueta='Próxima cita declarada'>
          <span className='flex items-start gap-1.5'>
            <IconoMedico className='h-3.5 w-3.5 shrink-0 text-[#45639a]' nombre='calendar' />
            <span>
              {perfil.fechaProximaCita}
              <span className='mt-0.5 block font-medium text-[#607395]'>{perfil.horaProximaCita}</span>
            </span>
          </span>
        </CampoPerfil>

        <div className='flex justify-center sm:col-span-2 lg:col-span-6'>
          <span className='inline-flex items-center gap-2 rounded-full bg-[#eaf7fb] px-4 py-1.5 text-[8px] font-bold text-[#1687ac]'>
            <IconoMedico className='h-3.5 w-3.5' nombre='refresh' strokeWidth={2} />
            Última sincronización: {perfil.ultimaSincronizacion}
          </span>
        </div>
      </dl>
    </article>
  )
}

export default PerfilSeguimientoPacienteComp
