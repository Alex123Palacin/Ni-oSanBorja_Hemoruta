import IconoMedico from '../IconoMedico'
import CampoInicioPacienteComp from './CampoInicioPacienteComp'
import type {
  ProximaCitaInicioPaciente,
  RegistroCitaInicioPaciente,
} from '../../types/InicioPaciente'

interface InicioRegistrarCitasPacienteCompProps {
  citaDeclarada: ProximaCitaInicioPaciente
  datos: RegistroCitaInicioPaciente
  onCambiar: (campo: keyof RegistroCitaInicioPaciente, valor: string) => void
  onGuardar: () => void
  onLlamar: () => void
  onSolicitarInformacion: () => void
}

function InicioRegistrarCitasPacienteComp({
  citaDeclarada,
  datos,
  onCambiar,
  onGuardar,
  onLlamar,
  onSolicitarInformacion,
}: InicioRegistrarCitasPacienteCompProps) {
  function enviarFormulario(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    onGuardar()
  }

  return (
    <section aria-labelledby='titulo-registrar-cita' className='mt-2'>
      <div className='flex items-start gap-2 px-1'>
        <span className='grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#e7f9f8] text-[#04a9b0]'>
          <IconoMedico className='h-[18px] w-[18px]' nombre='calendar' strokeWidth={1.7} />
        </span>
        <div>
          <h2 id='titulo-registrar-cita' className='text-[12.5px] font-extrabold text-[#0a2b70]'>Registrar próxima cita</h2>
          <p className='mt-0.5 text-[7.5px] font-medium leading-[11px] text-[#637594]'>
            Guarda la fecha que te informó el hospital para recordarla en la app.
          </p>
        </div>
      </div>

      <form className='mt-2' onSubmit={enviarFormulario}>
        <div className='rounded-[14px] border border-[#e1e8ef] bg-white p-2.5 shadow-[0_4px_13px_rgba(23,55,96,0.06)]'>
          <div className='grid grid-cols-2 gap-2'>
            <CampoInicioPacienteComp
              etiqueta='Fecha de la próxima cita'
              icono='calendar'
              id='inicio-fecha-proxima-cita'
              onCambiar={(valor) => onCambiar('fecha', valor)}
              placeholder='Seleccionar fecha'
              requerido
              tipo='date'
              valor={datos.fecha}
            />
            <CampoInicioPacienteComp
              etiqueta='Hora'
              icono='clock'
              id='inicio-hora-proxima-cita'
              onCambiar={(valor) => onCambiar('hora', valor)}
              placeholder='Seleccionar hora'
              requerido
              tipo='time'
              valor={datos.hora}
            />
          </div>

          <div className='my-3 h-[72px] border-b border-[#e9eef3]' aria-hidden='true' />

          <CampoInicioPacienteComp
            autoComplete='off'
            etiqueta='Médico (si lo conoces)'
            icono='user'
            id='inicio-medico-proxima-cita'
            onCambiar={(valor) => onCambiar('medico', valor)}
            placeholder='Nombre del médico (opcional)'
            valor={datos.medico}
          />
        </div>

        <aside className='relative mt-2 overflow-hidden rounded-[11px] border border-[#cfe6fb] bg-[#f0f7ff] p-2.5 pr-10' role='note'>
          <div className='flex items-start gap-2'>
            <IconoMedico className='mt-0.5 h-4 w-4 shrink-0 text-[#1687ec]' nombre='info' strokeWidth={1.8} />
            <p className='text-[7.5px] font-semibold leading-[11px] text-[#234879]'>
              <strong>Si aún no te informan la fecha de tu próxima cita,</strong> comunícate con el hospital o solicita información.
            </p>
          </div>
          <span aria-hidden='true' className='absolute -bottom-3 right-2 h-10 w-7 rounded-[50%_50%_45%_45%] bg-[#08b4bc] shadow-[inset_-6px_-5px_0_rgba(0,125,151,0.18)]'>
            <span className='absolute left-1.5 top-4 h-1 w-1 rounded-full bg-[#075f82]' />
            <span className='absolute right-1.5 top-4 h-1 w-1 rounded-full bg-[#075f82]' />
          </span>
          <div className='mt-2 grid grid-cols-2 gap-2 pl-6'>
            <button
              className='flex h-[29px] items-center justify-center gap-1.5 rounded-[6px] border border-[#17aeb6] bg-white text-[7.5px] font-bold text-[#079ca8] transition hover:bg-[#effbfb] focus-visible:outline-2 focus-visible:outline-[#079ca8]'
              onClick={onLlamar}
              type='button'
            >
              <IconoMedico className='h-3.5 w-3.5' nombre='phone' strokeWidth={1.7} />
              Llamar
            </button>
            <button
              className='flex h-[29px] items-center justify-center gap-1.5 rounded-[6px] border border-[#17aeb6] bg-white text-[7.5px] font-bold text-[#079ca8] transition hover:bg-[#effbfb] focus-visible:outline-2 focus-visible:outline-[#079ca8]'
              onClick={onSolicitarInformacion}
              type='button'
            >
              <IconoMedico className='h-3.5 w-3.5' nombre='mail' strokeWidth={1.7} />
              Solicitar información
            </button>
          </div>
        </aside>

        <article className='mt-2 flex items-center gap-2 rounded-[10px] border border-[#d9eceb] bg-white px-2.5 py-2 shadow-[0_3px_9px_rgba(23,55,96,0.05)]'>
          <span className='grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#e8f9f8] text-[#04a9b0]'>
            <IconoMedico className='h-4 w-4' nombre='calendar' strokeWidth={1.7} />
          </span>
          <div className='min-w-0 flex-1'>
            <h3 className='text-[8px] font-extrabold text-[#079ca8]'>Próxima cita declarada</h3>
            <p className='mt-0.5 text-[10px] font-extrabold text-[#0a2b70]'>
              <time dateTime={`${citaDeclarada.fechaIso}T${citaDeclarada.horaIso}`}>
                {citaDeclarada.fecha} - {citaDeclarada.hora}
              </time>
            </p>
            <p className='mt-0.5 text-[6.8px] font-medium text-[#687a96]'>Pendiente de confirmación hospitalaria</p>
          </div>
          <span className='shrink-0 rounded-full bg-[#fff2dd] px-2 py-1 text-[6.8px] font-extrabold text-[#d68b12]'>
            {citaDeclarada.estado}
          </span>
        </article>

        <button
          className='mt-2 flex h-[41px] w-full items-center justify-center gap-2 rounded-[9px] bg-gradient-to-r from-[#08b5b0] to-[#009ba8] text-[10.5px] font-extrabold text-white shadow-[0_5px_12px_rgba(0,157,168,0.18)] transition hover:brightness-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#079ca8]'
          type='submit'
        >
          Guardar cita
          <IconoMedico className='h-4 w-4' nombre='arrowRight' strokeWidth={1.9} />
        </button>
      </form>
    </section>
  )
}

export default InicioRegistrarCitasPacienteComp
