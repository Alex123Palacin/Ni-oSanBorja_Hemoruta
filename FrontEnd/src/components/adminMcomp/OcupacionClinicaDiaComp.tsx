import type {
  ProgramacionClinicaDiaApi,
  TurnoClinicaDiaApi,
} from '../../api/admin/ClinicaDiaAdminApi'
import IconoMedico from '../IconoMedico'

interface OcupacionClinicaDiaCompProps {
  onSeleccionarProgramacion: (programacion: ProgramacionClinicaDiaApi) => void
  turnos: TurnoClinicaDiaApi[]
}

function clasesCama(programacion: ProgramacionClinicaDiaApi | null) {
  if (!programacion) return 'border-[#9ed6d9] bg-white text-[#79aeb3]'
  if (programacion.estado === 'CONFIRMADA' || programacion.estado === 'COMPLETADA') {
    return 'border-[#17a36e] bg-[#dff6ee] text-[#087b60]'
  }
  return 'border-[#048f9e] bg-gradient-to-b from-[#08aab3] to-[#078a99] text-white'
}

function OcupacionClinicaDiaComp({ onSeleccionarProgramacion, turnos }: OcupacionClinicaDiaCompProps) {
  const ocupadas = turnos.reduce((total, turno) => total + turno.ocupadas, 0)

  return (
    <section className='rounded-2xl border border-[#dce7ee] bg-white p-3 shadow-[0_8px_22px_rgba(18,55,89,0.05)]'>
      <header className='flex flex-wrap items-center justify-between gap-2 px-1'>
        <h2 className='text-[13px] font-black text-[#0a2b70]'>Ocupación estimada por franja horaria</h2>
        <div className='flex gap-4 text-[8px] font-bold text-[#637894]'>
          <span className='flex items-center gap-1.5'><i className='h-3 w-3 rounded-sm bg-[#078f9e]' />Ocupadas</span>
          <span className='flex items-center gap-1.5'><i className='h-3 w-3 rounded-sm border border-[#9ed6d9] bg-white' />Disponibles</span>
        </div>
      </header>

      <div className='mt-3 grid gap-2 lg:grid-cols-3'>
        {turnos.map((turno) => (
          <article className='rounded-xl border border-[#e3ebf0] bg-[#fbfdfe] px-3 py-2.5' key={turno.codigo}>
            <div className='flex items-center justify-center gap-2'>
              <strong className='text-[10px] font-black text-[#123575]'>{turno.horaInicio} - {turno.horaFin}</strong>
              <span className='text-[8px] font-bold text-[#60748f]'>8 camas</span>
            </div>
            <div className='mt-2 grid grid-cols-8 gap-1'>
              {turno.camas.map((cama) => {
                const programacion = cama.programacion
                return (
                  <button
                    aria-label={programacion ? `Cama ${cama.numero}, ${programacion.solicitud.nombreCompleto}. Abrir ajuste.` : `Cama ${cama.numero} disponible`}
                    className={`h-7 rounded-[4px] border text-[8px] font-black transition ${clasesCama(programacion)} ${programacion ? 'cursor-pointer hover:brightness-105' : 'cursor-default'}`}
                    disabled={!programacion}
                    key={cama.numero}
                    onClick={() => programacion && onSeleccionarProgramacion(programacion)}
                    title={programacion?.solicitud.nombreCompleto || `Cama ${cama.numero} disponible`}
                    type='button'
                  >
                    {programacion ? cama.numero : ''}
                  </button>
                )
              })}
            </div>
            <p className='mt-1.5 text-center text-[8px] font-semibold text-[#70839a]'>{turno.ocupadas} ocupadas · {turno.disponibles} disponibles</p>
          </article>
        ))}
      </div>

      <footer className='mt-2 flex items-center justify-center gap-2 rounded-lg border border-[#cfe9dc] bg-[#f2fbf5] px-3 py-2 text-[8px] font-bold text-[#20864f]'>
        <IconoMedico className='h-3.5 w-3.5' nombre='check' />
        {ocupadas === 0 ? 'Las 24 posiciones están libres para comenzar la programación.' : 'La ocupación se actualiza al programar o ajustar cada paciente.'}
      </footer>
    </section>
  )
}

export default OcupacionClinicaDiaComp
