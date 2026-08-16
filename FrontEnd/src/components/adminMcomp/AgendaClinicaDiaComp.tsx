import { useMemo, useState } from 'react'

import type {
  EstadoRecordatorioClinicaDiaApi,
  ProgramacionClinicaDiaApi,
  TurnoClinicaDiaApi,
} from '../../api/admin/ClinicaDiaAdminApi'
import IconoMedico from '../IconoMedico'
import { nombreBreveClinicaDia } from '../../utils/nombreClinicaDia'

interface AgendaClinicaDiaCompProps {
  accionActiva: string | null
  onActualizarRecordatorio: (
    programacionId: string,
    estado: EstadoRecordatorioClinicaDiaApi,
  ) => Promise<void>
  onAjustar: (programacion: ProgramacionClinicaDiaApi) => void
  recordatorios: ProgramacionClinicaDiaApi[]
  turnos: TurnoClinicaDiaApi[]
}

function etiquetaEstadoRecordatorio(estado: EstadoRecordatorioClinicaDiaApi) {
  if (estado === 'ENVIADO') return 'Enviado'
  if (estado === 'NO_REQUERIDO') return 'No requerido'
  return 'Pendiente'
}

function textoRecordatorio(programacion: ProgramacionClinicaDiaApi) {
  const solicitud = programacion.solicitud
  return `Hola, recordamos la atención de ${solicitud.nombreCompleto} en Clínica de Día para el ${programacion.fecha}, de ${programacion.horaInicio} a ${programacion.horaFin}, cama ${programacion.cama}.`
}

function AgendaClinicaDiaComp({
  accionActiva,
  onActualizarRecordatorio,
  onAjustar,
  recordatorios,
  turnos,
}: AgendaClinicaDiaCompProps) {
  const [vistaPrevia, setVistaPrevia] = useState<ProgramacionClinicaDiaApi | null>(null)
  const totalProgramadas = useMemo(
    () => turnos.reduce((total, turno) => total + turno.ocupadas, 0),
    [turnos],
  )

  async function registrarEnvio(programacion: ProgramacionClinicaDiaApi) {
    try {
      await onActualizarRecordatorio(programacion.id, 'ENVIADO')
      setVistaPrevia(null)
    } catch {
      // El aviso global conserva el detalle del backend.
    }
  }

  return (
    <section className='rounded-2xl border border-[#dce7ee] bg-white shadow-[0_8px_22px_rgba(18,55,89,0.05)]'>
      <header className='flex items-start justify-between gap-3 border-b border-[#e4edf2] px-4 py-3'>
        <div>
          <h2 className='text-[14px] font-black text-[#0a2b70]'>Agenda sugerida de hoy</h2>
          <p className='mt-0.5 text-[9px] font-medium leading-4 text-[#71829a]'>Organizada por turno, cama y duración.</p>
        </div>
        <span className='rounded-full bg-[#e9f8f8] px-3 py-1.5 text-[9px] font-black text-[#079da8]'>
          {totalProgramadas} programados
        </span>
      </header>

      <div className='max-h-[350px] overflow-y-auto px-4 py-2'>
        {turnos.map((turno) => {
          const programaciones = turno.camas
            .map((cama) => cama.programacion)
            .filter((programacion): programacion is ProgramacionClinicaDiaApi => Boolean(programacion))
          return (
            <article className='border-b border-[#edf2f5] py-2.5 last:border-0' key={turno.codigo}>
              <div className='mb-2 flex items-center justify-between gap-2'>
                <strong className='flex items-center gap-2 text-[10px] font-black text-[#143778]'>
                  <span className='grid h-7 w-7 place-items-center rounded-lg bg-[#e9f8f8] text-[#09a6af]'>
                    <IconoMedico className='h-3.5 w-3.5' nombre='clock' />
                  </span>
                  {turno.horaInicio} · {turno.etiqueta}
                </strong>
                <span className='text-[8.5px] font-bold text-[#7c8da3]'>{turno.disponibles} camas disponibles</span>
              </div>
              {programaciones.length > 0 ? (
                <div className='space-y-2'>
                  {programaciones.map((programacion) => (
                    <button
                      className='flex w-full cursor-pointer items-center gap-3 rounded-xl border border-[#e5edf2] bg-[#fbfdfe] p-2.5 text-left transition hover:border-[#8bd4d8] hover:bg-[#f5fbfb]'
                      key={programacion.id}
                      onClick={() => onAjustar(programacion)}
                      type='button'
                    >
                      <span className='grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#eef8ff] text-[10px] font-black text-[#1977ca]'>C{programacion.cama}</span>
                      <span className='min-w-0 flex-1'>
                        <strong className='block truncate text-[10px] font-extrabold text-[#173777]'>{nombreBreveClinicaDia(programacion.solicitud.nombreCompleto)}</strong>
                        <span className='mt-0.5 block truncate text-[8.5px] font-medium text-[#74849a]'>{programacion.solicitud.protocolo} · {programacion.solicitud.duracionMinutos} min</span>
                      </span>
                      <span className={`flex items-center gap-1 rounded-full px-2 py-1 text-[8px] font-extrabold ${programacion.recordatorioEstado === 'ENVIADO' ? 'bg-[#e9f8ed] text-[#15954b]' : 'bg-[#fff6e8] text-[#c77718]'}`}>
                        <IconoMedico className='h-3 w-3' nombre='whatsapp' />
                        {etiquetaEstadoRecordatorio(programacion.recordatorioEstado)}
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <p className='rounded-xl border border-dashed border-[#dce7ed] px-3 py-3 text-center text-[9px] font-medium text-[#8998aa]'>Sin pacientes programados en este turno.</p>
              )}
            </article>
          )
        })}
      </div>

      <aside className='mx-4 mb-4 flex gap-2 rounded-xl border border-[#cfe7f4] bg-[#f1f9fd] px-3 py-2.5 text-[#496b8f] sm:mx-5'>
        <IconoMedico className='mt-0.5 h-4 w-4 shrink-0 text-[#2185ca]' nombre='sparkles' />
        <p className='text-[8.5px] font-medium leading-4'>La agenda automática prioriza urgencia, preferencia horaria y disponibilidad real de camas.</p>
      </aside>

      <div className='border-t border-[#e4edf2] px-4 py-4 sm:px-5'>
        <div className='flex items-center justify-between gap-2'>
          <div>
            <h3 className='text-[11px] font-black text-[#123574]'>Recordatorios</h3>
            <p className='text-[8.5px] font-medium text-[#7a8ba1]'>Previsualiza y registra el estado del mensaje.</p>
          </div>
          <span className='grid h-8 w-8 place-items-center rounded-xl bg-[#ebf9ef] text-[#16a14e]'><IconoMedico className='h-4 w-4' nombre='whatsapp' /></span>
        </div>
        <div className='mt-3 space-y-2'>
          {recordatorios.length > 0 ? recordatorios.slice(0, 4).map((recordatorio) => (
            <button
              className='flex w-full cursor-pointer items-center justify-between gap-3 rounded-xl border border-[#e5edf2] px-3 py-2.5 text-left transition hover:border-[#99d8d4] disabled:cursor-not-allowed disabled:bg-[#f7f9fa] disabled:opacity-65'
              disabled={!recordatorio.solicitud.telefono}
              key={recordatorio.id}
              onClick={() => recordatorio.solicitud.telefono && setVistaPrevia(recordatorio)}
              type='button'
            >
              <span className='min-w-0'>
                <strong className='block truncate text-[9px] font-extrabold text-[#173777]'>{nombreBreveClinicaDia(recordatorio.solicitud.nombreCompleto)}</strong>
                <span className='block text-[8px] font-medium text-[#798aa0]'>{recordatorio.horaInicio} · Cama {recordatorio.cama}</span>
              </span>
              <span className='text-[8px] font-black text-[#0b9e9f]'>{recordatorio.solicitud.telefono ? 'Ver mensaje' : 'Sin teléfono'}</span>
            </button>
          )) : (
            <p className='rounded-xl bg-[#f7fafb] px-3 py-3 text-center text-[9px] font-medium text-[#8392a5]'>No hay recordatorios pendientes para esta fecha.</p>
          )}
        </div>
      </div>

      {vistaPrevia && (
        <div aria-labelledby='titulo-vista-recordatorio' aria-modal='true' className='fixed inset-0 z-[160] grid place-items-center bg-[#071b43]/50 p-4 backdrop-blur-[2px]' role='dialog'>
          <section className='w-full max-w-[470px] rounded-[22px] bg-white p-5 shadow-[0_24px_70px_rgba(7,27,67,0.3)] sm:p-6'>
            <div className='flex items-start justify-between gap-4'>
              <span className='grid h-11 w-11 place-items-center rounded-2xl bg-[#e9f9ed] text-[#13a04b]'><IconoMedico className='h-6 w-6' nombre='whatsapp' /></span>
              <button aria-label='Cerrar vista previa' className='grid h-8 w-8 cursor-pointer place-items-center rounded-lg text-[#71829a] hover:bg-[#f1f5f7]' onClick={() => setVistaPrevia(null)} type='button'><IconoMedico className='h-4 w-4' nombre='x' /></button>
            </div>
            <h3 className='mt-3 text-[17px] font-black text-[#0a2b70]' id='titulo-vista-recordatorio'>Vista previa del recordatorio</h3>
            <p className='mt-1 text-[9px] font-medium text-[#71829a]'>{vistaPrevia.solicitud.telefono || 'Sin teléfono registrado'}</p>
            <div className='mt-4 rounded-2xl rounded-tl-sm bg-[#e9f8ed] p-4 text-[10px] font-medium leading-5 text-[#24486a]'>{textoRecordatorio(vistaPrevia)}</div>
            <div className='mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end'>
              <button className='h-10 cursor-pointer rounded-xl border border-[#d6e2e9] px-4 text-[10px] font-extrabold text-[#5d718d] hover:bg-[#f7fafb]' onClick={() => setVistaPrevia(null)} type='button'>Cerrar</button>
              {vistaPrevia.recordatorioEstado !== 'ENVIADO' && Boolean(vistaPrevia.solicitud.telefono) && (
                <button className='flex h-10 cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#13a653] px-4 text-[10px] font-extrabold text-white hover:bg-[#0e9348] disabled:cursor-wait disabled:opacity-60' disabled={Boolean(accionActiva)} onClick={() => void registrarEnvio(vistaPrevia)} type='button'>
                  <IconoMedico className='h-4 w-4' nombre='check' />
                  {accionActiva === `recordatorio-${vistaPrevia.id}` ? 'Guardando...' : 'Marcar como enviado'}
                </button>
              )}
            </div>
          </section>
        </div>
      )}
    </section>
  )
}

export default AgendaClinicaDiaComp
