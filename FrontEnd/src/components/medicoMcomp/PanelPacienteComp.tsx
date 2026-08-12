import type { PacienteSeguimiento, TipoRegistro } from '../../types/SeguimientoPacientesLista'
import { formatearEdadPaciente } from '../../utils/paciente'
import IconoMedico from '../IconoMedico'
import SemaforoBadgeComp from './SemaforoBadgeComp'

interface PanelPacienteCompProps {
  etiquetasRegistro: Record<TipoRegistro, string>
  onVerSeguimiento: () => void
  paciente: PacienteSeguimiento
}

function PanelPacienteComp({ etiquetasRegistro, onVerSeguimiento, paciente }: PanelPacienteCompProps) {
  return (
    <article className='p-5'>
      <p className='text-[10px] font-bold uppercase tracking-[0.08em] text-[#079daf]'>Paciente seleccionado</p>
      <div className='mt-4 flex items-center gap-3'>
        <span className={`grid h-14 w-14 shrink-0 place-items-center rounded-full text-[31px] ${paciente.colorAvatar}`}>
          <span aria-hidden='true'>{paciente.avatar}</span>
        </span>
        <div className='min-w-0'>
          <h2 className='text-[14px] font-extrabold leading-[18px] text-[#0a2b79]'>{paciente.nombre}</h2>
          <p className='mt-1 text-[9px] font-medium text-[#607395]'>
            {formatearEdadPaciente(paciente.edad)} · DNI {paciente.dni}
          </p>
        </div>
      </div>

      <p className='mt-5 rounded-xl bg-[#f3fafb] p-3.5 text-[10px] font-medium leading-[16px] text-[#455d85]'>
        {paciente.resumen}
      </p>

      <dl className='mt-4 divide-y divide-[#e1e9f0] text-[9px] text-[#52688d]'>
        <div className='flex items-center justify-between gap-3 py-2'>
          <dt>Canal reciente</dt>
          <dd className='flex items-center gap-1 font-bold text-[#173777]'>
            <IconoMedico
              className={`h-4 w-4 ${paciente.origen === 'WhatsApp' ? 'text-[#17b75c]' : 'text-[#287ee8]'}`}
              nombre={paciente.origen === 'WhatsApp' ? 'whatsapp' : 'smartphone'}
            />
            {paciente.origen}
          </dd>
        </div>
        <div className='flex items-center justify-between gap-3 py-2'>
          <dt>Último registro</dt>
          <dd className='text-right font-bold text-[#173777]'>
            {paciente.fechaUltimoRegistro}
            <br />
            {etiquetasRegistro[paciente.tipoUltimoRegistro]}
          </dd>
        </div>
        <div className='flex items-center justify-between gap-3 py-2'>
          <dt>Semáforo actual</dt>
          <dd>
            <SemaforoBadgeComp mostrarDescripcion={false} paciente={paciente} />
          </dd>
        </div>
        <div className='flex items-center justify-between gap-3 py-2'>
          <dt>Próxima cita</dt>
          <dd className='text-right font-bold text-[#173777]'>
            {paciente.fechaProximaCita}
            <br />
            {paciente.horaProximaCita}
          </dd>
        </div>
      </dl>

      <button
        className='mt-4 flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#08aabc] to-[#078da9] text-[10px] font-bold text-white shadow-sm transition hover:brightness-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#08aabb]'
        onClick={onVerSeguimiento}
        type='button'
      >
        Ver seguimiento completo
        <IconoMedico className='h-4 w-4' nombre='arrowRight' />
      </button>
    </article>
  )
}

export default PanelPacienteComp
