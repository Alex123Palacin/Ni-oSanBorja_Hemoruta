import { useState } from 'react'

import type { CanalActivacion, CredencialesTemporalesPaciente, DatosPaciente } from '../types/NuevoPaciente'
import CanalAccesoPacienteComp from './CanalAccesoPacienteComp'
import CredencialesAccesoPacienteComp from './CredencialesAccesoPacienteComp'
import IconoMedico from './IconoMedico'
import ResumenPacienteComp from './ResumenPacienteComp'

interface NuevoPaso2Props {
  credenciales: CredencialesTemporalesPaciente
  datos: DatosPaciente
  onAnterior: () => void
  onSiguiente: () => void
}

function NuevoPaso2({ credenciales, datos, onAnterior, onSiguiente }: NuevoPaso2Props) {
  const [canalSeleccionado, setCanalSeleccionado] = useState<CanalActivacion>(datos.canal)

  return (
    <section className='space-y-3'>
      <div className='grid gap-3 lg:grid-cols-[minmax(0,2.05fr)_minmax(245px,0.95fr)]'>
        <div className='rounded-xl border border-[#dbe5ef] bg-white p-4 shadow-[0_1px_3px_rgba(18,52,91,0.04)]'>
          <div className='flex items-start gap-3 border-b border-[#e7edf3] pb-3'>
            <span className='grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#18b85a] to-[#07883b] text-white shadow-sm'>
              <IconoMedico className='h-6 w-6' nombre='check' strokeWidth={3} />
            </span>
            <div>
              <div className='flex flex-wrap items-center gap-2'>
                <h2 className='text-[16px] font-extrabold text-[#079447]'>¡Paciente registrado!</h2>
                <span className='inline-flex items-center gap-1 rounded-md bg-[#e2f6e8] px-2 py-1 text-[8px] font-bold text-[#098a3f]'>
                  <IconoMedico className='h-3 w-3' nombre='check' strokeWidth={2.6} />
                  Acceso habilitado
                </span>
              </div>
              <p className='mt-1 text-[9px] leading-[14px] text-[#425b86]'>
                La ficha provisional <strong>{datos.historiaClinica}</strong> ya está asignada a tu cuenta médica.
                <br />
                Las credenciales ya están disponibles y el canal preferido quedó registrado.
              </p>
            </div>
          </div>

          <div className='mt-3'>
            <CredencialesAccesoPacienteComp credenciales={credenciales} />
          </div>

          <div className='mt-3'>
            <CanalAccesoPacienteComp
              descripcionApp='La familia puede ingresar a HemoRuta con el usuario y la contraseña temporal.'
              descripcionWhatsApp='Canal preferido para acompañar el registro de la familia.'
              etiqueta='Canales de acceso disponibles para la familia'
              onCambiar={setCanalSeleccionado}
              valor={canalSeleccionado}
            />
          </div>

          <div className='mt-3 flex items-start gap-2 rounded-lg border border-[#cfe5fb] bg-[#f2f8ff] p-3 text-[9px] leading-[14px] text-[#1867cc]'>
            <span className='grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[#1680ea] text-white'>
              <IconoMedico className='h-3.5 w-3.5' nombre='info' strokeWidth={2.1} />
            </span>
            <p>
              <strong>Guarda estas credenciales antes de continuar.</strong>
              <br />
              La contraseña temporal no vuelve a enviarse ni se puede consultar desde la ficha.
            </p>
          </div>
        </div>

        <ResumenPacienteComp
          datos={datos}
          estado='Paciente registrado'
          notaDetalle='Los datos clínicos y familiares pendientes podrán completarse desde su ficha.'
          notaTitulo='El paciente ya aparece en tu listado y tiene acceso habilitado.'
          titulo='Resumen del paciente'
        />
      </div>

      <div className='flex flex-wrap items-center justify-between gap-3 pt-1'>
        <button
          className='flex h-9 min-w-[100px] cursor-pointer items-center justify-center gap-2 rounded-lg border border-[#d6e1ec] bg-white px-5 text-[10px] font-bold text-[#27447f] transition hover:bg-[#f7fafc] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#08a9bb]'
          onClick={onAnterior}
          type='button'
        >
          <IconoMedico className='h-4 w-4' nombre='arrowLeft' />
          Volver al listado
        </button>
        <button
          className='flex h-10 min-w-[200px] cursor-pointer items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#08aabd] to-[#078eaa] px-6 text-[10px] font-bold text-white shadow-sm transition hover:brightness-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#08a9bb]'
          onClick={onSiguiente}
          type='button'
        >
          Ver registro completado
          <IconoMedico className='h-4 w-4' nombre='arrowRight' />
        </button>
      </div>
    </section>
  )
}

export default NuevoPaso2
