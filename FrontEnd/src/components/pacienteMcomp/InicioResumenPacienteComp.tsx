import IconoMedico, { type NombreIconoMedico } from '../IconoMedico'
import InicioPerfilPacienteComp from './InicioPerfilPacienteComp'
import type { PerfilInicioPaciente } from '../../types/InicioPaciente'

export type IdAccesoPerfilInicio = 'datos-personales' | 'datos-tutor'
export type IdAccionRapidaInicio = 'medicacion' | 'sintomas' | 'documentos'

export interface AccesoPerfilInicioPaciente {
  descripcion: string
  estado: string
  icono: NombreIconoMedico
  id: IdAccesoPerfilInicio
  titulo: string
}

export interface AccionRapidaInicioPaciente {
  descripcion: string
  icono: NombreIconoMedico
  id: IdAccionRapidaInicio
  titulo: string
}

interface InicioResumenPacienteCompProps {
  accesosPerfil: readonly AccesoPerfilInicioPaciente[]
  accionesRapidas: readonly AccionRapidaInicioPaciente[]
  onAbrirAccesoPerfil: (id: IdAccesoPerfilInicio) => void
  onAbrirAccionRapida: (id: IdAccionRapidaInicio) => void
  onAbrirCita: () => void
  onAbrirPerfil: () => void
  paciente: PerfilInicioPaciente
  porcentajePerfil: number
}

function InicioResumenPacienteComp({
  accesosPerfil,
  accionesRapidas,
  onAbrirAccesoPerfil,
  onAbrirAccionRapida,
  onAbrirCita,
  onAbrirPerfil,
  paciente,
  porcentajePerfil,
}: InicioResumenPacienteCompProps) {
  const progresoSeguro = Math.min(100, Math.max(0, porcentajePerfil))

  return (
    <div className='px-2.5 pb-2'>
      <InicioPerfilPacienteComp compacto onAbrir={onAbrirPerfil} paciente={paciente} />

      <section className='mt-1.5 overflow-hidden rounded-[14px] border border-[#e1e8ef] bg-white shadow-[0_4px_13px_rgba(23,55,96,0.07)]' aria-labelledby='titulo-completar-perfil'>
        <div className='flex min-h-[44px] items-center gap-2 px-2.5 py-1.5'>
          <span className='grid h-8 w-8 shrink-0 place-items-center rounded-[10px] bg-[#e8f9f8] text-[#05a8af]'>
            <IconoMedico className='h-[17px] w-[17px]' nombre='clipboard' strokeWidth={1.7} />
          </span>
          <div className='min-w-0 flex-1'>
            <h2 id='titulo-completar-perfil' className='text-[10px] font-extrabold text-[#0a2b70]'>Completa tu perfil</h2>
            <p className='mt-0.5 text-[7px] font-medium text-[#697b98]'>Así podremos brindarte un mejor seguimiento.</p>
          </div>
          <div className='w-[53px] shrink-0 text-right'>
            <span className='text-[8px] font-extrabold text-[#12aaa9]'>{progresoSeguro}%</span>
            <div aria-label={`Perfil completado al ${progresoSeguro}%`} className='mt-1 h-1.5 overflow-hidden rounded-full bg-[#e5edf1]' role='progressbar' aria-valuemax={100} aria-valuemin={0} aria-valuenow={progresoSeguro}>
              <div className='h-full rounded-full bg-[#05aeb1]' style={{ width: `${progresoSeguro}%` }} />
            </div>
          </div>
        </div>

        <div className='border-t border-[#e8edf2] px-2'>
          {accesosPerfil.map((acceso, indice) => (
            <button
              className={`flex min-h-[38px] w-full items-center gap-2 px-0.5 text-left transition hover:bg-[#f7fbfd] focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-[#00aab1] ${
                indice > 0 ? 'border-t border-[#edf1f5]' : ''
              }`}
              key={acceso.id}
              onClick={() => onAbrirAccesoPerfil(acceso.id)}
              type='button'
            >
              <IconoMedico className='h-4 w-4 shrink-0 text-[#05a8af]' nombre={acceso.icono} strokeWidth={1.7} />
              <span className='min-w-0 flex-1'>
                <strong className='block text-[8px] font-extrabold text-[#17366f]'>{acceso.titulo}</strong>
                <span className='mt-0.5 block truncate text-[6.7px] font-medium text-[#7a8ba4]'>{acceso.descripcion}</span>
              </span>
              <span className='rounded-full bg-[#fff1e7] px-2 py-1 text-[6.5px] font-extrabold text-[#f08a53]'>{acceso.estado}</span>
              <IconoMedico className='h-3.5 w-3.5 shrink-0 text-[#627795]' nombre='arrowRight' strokeWidth={1.7} />
            </button>
          ))}
        </div>
      </section>

      <button
        className='mt-1.5 flex min-h-[54px] w-full items-center gap-2.5 rounded-[14px] border border-[#e1e8ef] bg-white px-2.5 text-left shadow-[0_4px_13px_rgba(23,55,96,0.07)] transition hover:border-[#88dce0] focus-visible:outline-2 focus-visible:outline-[#00aab1]'
        onClick={onAbrirCita}
        type='button'
      >
        <span className='grid h-8 w-8 shrink-0 place-items-center rounded-[10px] bg-[#e7f9f8] text-[#04a9b0]'>
          <IconoMedico className='h-[17px] w-[17px]' nombre='calendar' strokeWidth={1.7} />
        </span>
        <span className='min-w-0 flex-1'>
          <strong className='block text-[9px] font-extrabold text-[#0a2b70]'>Registrar próxima cita</strong>
          <span className='mt-0.5 block text-[6.8px] font-medium leading-[10px] text-[#6c7e99]'>Guarda la fecha cuando el hospital te la informe.</span>
        </span>
        <span className='grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#e4f8f7] text-[#08a9b0]'>
          <IconoMedico className='h-[17px] w-[17px]' nombre='plusCircle' strokeWidth={1.8} />
        </span>
      </button>

      <div className='mt-1.5 grid grid-cols-3 overflow-hidden rounded-[13px] border border-[#e1e8ef] bg-white shadow-[0_4px_13px_rgba(23,55,96,0.06)]'>
        {accionesRapidas.map((accion, indice) => (
          <button
            className={`flex min-h-[52px] min-w-0 items-center gap-1.5 px-2 text-left transition hover:bg-[#f5fbfc] focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-[#00aab1] ${
              indice > 0 ? 'border-l border-[#e8edf2]' : ''
            }`}
            key={accion.id}
            onClick={() => onAbrirAccionRapida(accion.id)}
            type='button'
          >
            <IconoMedico className='h-[18px] w-[18px] shrink-0 text-[#04a9b0]' nombre={accion.icono} strokeWidth={1.7} />
            <span className='min-w-0'>
              <strong className='block truncate text-[7.5px] font-extrabold text-[#17366f]'>{accion.titulo}</strong>
              <span className='mt-0.5 block truncate text-[6.2px] font-medium text-[#7a8ba4]'>{accion.descripcion}</span>
            </span>
          </button>
        ))}
      </div>

      <aside className='relative mt-1.5 flex min-h-[48px] items-center gap-2 overflow-hidden rounded-[13px] border border-[#d9ecf2] bg-gradient-to-r from-[#effbf4] to-[#eef8ff] px-2.5 pr-14' role='note'>
        <span className='grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#2ac85c] text-white shadow-[0_3px_8px_rgba(42,200,92,0.22)]'>
          <IconoMedico className='h-[17px] w-[17px]' nombre='whatsapp' />
        </span>
        <p className='text-[6.7px] font-medium leading-[10px] text-[#536986]'>
          <strong className='block text-[7.5px] font-extrabold text-[#17366f]'>Puedes usar esta app o WhatsApp.</strong>
          Ambos canales sincronizan tu información con el doctor.
        </p>
        <span aria-hidden='true' className='absolute -bottom-2 right-2 rotate-6 text-[#0e98ad]'>
          <IconoMedico className='h-10 w-10' nombre='smartphone' strokeWidth={1.45} />
        </span>
      </aside>
    </div>
  )
}

export default InicioResumenPacienteComp
