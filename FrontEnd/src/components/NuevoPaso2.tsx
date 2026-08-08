import type { DatosPaciente } from '../types/NuevoPaciente'
import IconoMedico, { type NombreIconoMedico } from './IconoMedico'
import ResumenPacienteComp from './ResumenPacienteComp'

interface BotonCanalProps {
  icono: NombreIconoMedico
  texto: string
}

function BotonCanal({ icono, texto }: BotonCanalProps) {
  return (
    <button
      className='flex h-9 cursor-pointer items-center justify-center gap-2 rounded-lg border border-[#8bd9bc] bg-white px-3 text-[9px] font-bold text-[#098746] transition hover:bg-[#f3fcf7] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#08a9bb]'
      type='button'
    >
      <IconoMedico className='h-4 w-4' nombre={icono} strokeWidth={1.9} />
      {texto}
    </button>
  )
}

interface NuevoPaso2Props {
  datos: DatosPaciente
  onAnterior: () => void
  onSiguiente: () => void
}

function NuevoPaso2({ datos, onAnterior, onSiguiente }: NuevoPaso2Props) {
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
                <h2 className='text-[16px] font-extrabold text-[#079447]'>¡Invitación enviada!</h2>
                <span className='inline-flex items-center gap-1 rounded-md bg-[#e2f6e8] px-2 py-1 text-[8px] font-bold text-[#098a3f]'>
                  <IconoMedico className='h-3 w-3' nombre='check' strokeWidth={2.6} />
                  Invitación enviada
                </span>
              </div>
              <p className='mt-1 text-[9px] leading-[14px] text-[#425b86]'>
                La invitación de activación fue enviada por {datos.canal} al contacto del tutor.
                <br />
                La familia podrá continuar el registro desde el canal seleccionado.
              </p>
            </div>
          </div>

          <h3 className='mt-3 text-[10px] font-extrabold text-[#173478]'>
            Canales de acceso disponibles para la familia
          </h3>
          <div className='mt-2 grid gap-3 sm:grid-cols-2'>
            <article className='relative flex min-h-[102px] items-start gap-3 rounded-lg border border-[#73d6b2] bg-[#fbfffd] p-3'>
              <span className='grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#18bd5b] text-white'>
                <IconoMedico className='h-7 w-7' nombre='whatsapp' strokeWidth={1.9} />
              </span>
              <div className='text-[9px] leading-[14px] text-[#38527f]'>
                <span className='mb-1 inline-flex rounded bg-[#e0f7e8] px-2 py-0.5 text-[8px] font-bold text-[#0a9143]'>
                  Canal principal
                </span>
                <strong className='block text-[12px] text-[#173478]'>WhatsApp</strong>
                La invitación fue enviada por WhatsApp. Es el canal más rápido y recomendado.
              </div>
              <span className='absolute right-3 top-3 grid h-4 w-4 place-items-center rounded-full bg-[#0aa34c] text-white'>
                <IconoMedico className='h-2.5 w-2.5' nombre='check' strokeWidth={3} />
              </span>
            </article>

            <article className='flex min-h-[102px] items-start gap-3 rounded-lg border border-[#dbe5ef] bg-white p-3'>
              <span className='grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#e7f2ff] text-[#147cf3]'>
                <IconoMedico className='h-7 w-7' nombre='smartphone' strokeWidth={1.9} />
              </span>
              <div className='text-[9px] leading-[14px] text-[#38527f]'>
                <strong className='mb-1 block text-[12px] text-[#173478]'>App móvil</strong>
                Si lo desean, la familia también puede registrarse desde la app HemoRuta Pediátrica.
              </div>
            </article>
          </div>

          <div className='mt-3 flex items-start gap-2 rounded-lg border border-[#cfe5fb] bg-[#f2f8ff] p-3 text-[9px] leading-[14px] text-[#1867cc]'>
            <span className='grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[#1680ea] text-white'>
              <IconoMedico className='h-3.5 w-3.5' nombre='info' strokeWidth={2.1} />
            </span>
            <p>
              <strong>La familia continuará el registro desde el canal elegido.</strong>
              <br />
              Toda la información se sincronizará automáticamente con la ficha del paciente.
            </p>
          </div>

          <div className='mt-3 grid gap-2 sm:grid-cols-3'>
            <BotonCanal icono='whatsapp' texto='Reenviar por WhatsApp' />
            <button
              className='flex h-9 cursor-pointer items-center justify-center gap-2 rounded-lg border border-[#65a5ff] bg-white px-3 text-[9px] font-bold text-[#176bdb] transition hover:bg-[#f5f9ff] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#08a9bb]'
              type='button'
            >
              <IconoMedico className='h-4 w-4' nombre='smartphone' />
              Enviar acceso a la app
            </button>
            <button
              className='flex h-9 cursor-pointer items-center justify-center gap-2 rounded-lg border border-[#95a9c7] bg-white px-3 text-[9px] font-bold text-[#27447f] transition hover:bg-[#f7fafc] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#08a9bb]'
              type='button'
            >
              <IconoMedico className='h-4 w-4' nombre='link' />
              Copiar enlace de invitación
            </button>
          </div>
        </div>

        <ResumenPacienteComp
          datos={datos}
          estado='Invitación enviada'
          notaDetalle='Podrán usar WhatsApp o la app móvil cuando lo deseen.'
          notaTitulo='La familia recibirá la invitación y podrá completar el registro en el canal elegido.'
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
          Atrás
        </button>
        <button
          className='flex h-10 min-w-[200px] cursor-pointer flex-col items-center justify-center rounded-lg bg-gradient-to-r from-[#08aabd] to-[#078eaa] px-6 text-[10px] font-bold text-white shadow-sm transition hover:brightness-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#08a9bb]'
          onClick={onSiguiente}
          type='button'
        >
          <span className='flex items-center gap-2'>
            Continuar
            <IconoMedico className='h-4 w-4' nombre='arrowRight' />
          </span>
          <span className='text-[7px] font-medium opacity-85'>Ir a esperando registro</span>
        </button>
      </div>
    </section>
  )
}

export default NuevoPaso2
