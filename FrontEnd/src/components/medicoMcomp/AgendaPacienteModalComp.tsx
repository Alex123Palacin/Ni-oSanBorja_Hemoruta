import type { CitaPacienteMedicoApi } from '../../api/medico/MedicoApi'
import IconoMedico from '../IconoMedico'
import ModalFichaPacienteComp from './ModalFichaPacienteComp'

interface AgendaPacienteModalCompProps {
  citas: readonly CitaPacienteMedicoApi[]
  error?: string
  nombrePaciente: string
  onCerrar: () => void
  procesando?: boolean
}

const ESTADOS: Record<string, { clase: string; texto: string }> = {
  CANCELADA: { clase: 'bg-[#fff0f0] text-[#d33d4d]', texto: 'Cancelada' },
  COMPLETADA: { clase: 'bg-[#e8f8ee] text-[#138346]', texto: 'Completada' },
  CONFIRMADA: { clase: 'bg-[#eaf2ff] text-[#1970d5]', texto: 'Confirmada' },
  NO_ASISTIO: { clase: 'bg-[#f3f0fa] text-[#7457aa]', texto: 'No asistió' },
  PENDIENTE: { clase: 'bg-[#fff5df] text-[#b87513]', texto: 'Pendiente' },
}

function fechaCompleta(fechaIso: string) {
  const fecha = new Date(fechaIso)
  if (Number.isNaN(fecha.getTime())) return { fecha: 'Fecha no disponible', hora: '' }
  return {
    fecha: new Intl.DateTimeFormat('es-PE', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }).format(fecha),
    hora: new Intl.DateTimeFormat('es-PE', {
      hour: '2-digit',
      hour12: true,
      minute: '2-digit',
    }).format(fecha),
  }
}

function AgendaPacienteModalComp({ citas, error, nombrePaciente, onCerrar, procesando }: AgendaPacienteModalCompProps) {
  return (
    <ModalFichaPacienteComp
      descripcion={`Historial completo de citas declaradas y hospitalarias de ${nombrePaciente}.`}
      onCerrar={onCerrar}
      titulo='Agenda del paciente'
    >
      {procesando && (
        <div className='grid min-h-48 place-items-center' role='status'>
          <span className='h-8 w-8 animate-spin rounded-full border-4 border-[#d8f1f3] border-t-[#08aabb]' />
        </div>
      )}
      {!procesando && error && (
        <p className='rounded-xl border border-[#ffd9d9] bg-[#fff6f6] p-4 text-[11px] font-semibold text-[#bd3544]' role='alert'>
          {error}
        </p>
      )}
      {!procesando && !error && citas.length === 0 && (
        <div className='grid min-h-52 place-items-center rounded-2xl border border-dashed border-[#cbdce7] bg-white text-center'>
          <div>
            <IconoMedico className='mx-auto h-10 w-10 text-[#7fa6bb]' nombre='calendar' />
            <p className='mt-3 text-[12px] font-extrabold text-[#173478]'>Sin citas registradas</p>
            <p className='mt-1 text-[10px] text-[#657795]'>Cuando se declare o confirme una cita aparecerá aquí.</p>
          </div>
        </div>
      )}
      {!procesando && !error && citas.length > 0 && (
        <ol className='space-y-3'>
          {citas.map((cita) => {
            const fecha = fechaCompleta(cita.inicio)
            const estado = ESTADOS[cita.estado] ?? { clase: 'bg-[#eef3f7] text-[#53698e]', texto: cita.estado }
            return (
              <li className='rounded-2xl border border-[#dce5ee] bg-white p-4 shadow-[0_3px_10px_rgba(18,52,91,.04)]' key={cita.id}>
                <div className='flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between'>
                  <div className='flex min-w-0 gap-3'>
                    <span className='grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#e8f8fa] text-[#079daf]'>
                      <IconoMedico className='h-6 w-6' nombre='calendar' />
                    </span>
                    <div className='min-w-0'>
                      <strong className='block text-[13px] text-[#0a2b79]'>{cita.motivo || cita.tipo.replaceAll('_', ' ')}</strong>
                      <p className='mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-[#53698e]'>
                        <span>{fecha.fecha}</span>
                        <span className='inline-flex items-center gap-1 font-bold text-[#1475d4]'>
                          <IconoMedico className='h-3.5 w-3.5' nombre='clock' /> {fecha.hora}
                        </span>
                      </p>
                      <p className='mt-2 text-[9px] leading-4 text-[#647795]'>
                        {[cita.especialidad, cita.consultorio, cita.sede].filter(Boolean).join(' · ') || 'Información por confirmar'}
                      </p>
                      {cita.medico && <p className='mt-1 text-[9px] font-semibold text-[#37517f]'>Atiende: {cita.medico.nombre}</p>}
                    </div>
                  </div>
                  <span className={`shrink-0 self-start rounded-full px-3 py-1 text-[9px] font-extrabold ${estado.clase}`}>{estado.texto}</span>
                </div>
              </li>
            )
          })}
        </ol>
      )}
    </ModalFichaPacienteComp>
  )
}

export default AgendaPacienteModalComp
