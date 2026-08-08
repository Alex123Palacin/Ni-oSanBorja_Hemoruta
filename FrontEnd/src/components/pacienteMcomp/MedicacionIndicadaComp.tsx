import IconoMedico, { type NombreIconoMedico } from '../IconoMedico'

export type TonoMedicamentoPaciente = 'azul' | 'coral' | 'morado' | 'verde'

export interface HorarioMedicamentoPaciente {
  detalle: string
  horaIso?: string
  icono: NombreIconoMedico
  valor: string
}

export interface MedicamentoIndicadoPaciente {
  dosis: string
  estado?: string
  horarios: readonly HorarioMedicamentoPaciente[]
  id: string
  nombre: string
  tono: TonoMedicamentoPaciente
}

interface MedicacionIndicadaCompProps {
  medicamentos: readonly MedicamentoIndicadoPaciente[]
  notaHorario: string
  titulo: string
}

const ESTILOS_TONO: Record<TonoMedicamentoPaciente, { fondo: string; icono: NombreIconoMedico; texto: string }> = {
  azul: { fondo: 'bg-[#eaf3ff]', icono: 'pill', texto: 'text-[#347bdc]' },
  coral: { fondo: 'bg-[#fff0ec]', icono: 'clipboard', texto: 'text-[#ff6957]' },
  morado: { fondo: 'bg-[#f2edff]', icono: 'pill', texto: 'text-[#8a5de8]' },
  verde: { fondo: 'bg-[#edf9eb]', icono: 'activity', texto: 'text-[#4eb94f]' },
}

function MedicacionIndicadaComp({ medicamentos, notaHorario, titulo }: MedicacionIndicadaCompProps) {
  return (
    <section className='h-[182px]'>
      <div className='flex h-[26px] items-center justify-between px-0.5'>
        <h2 className='text-[10.5px] font-extrabold text-[#15356f]'>{titulo}</h2>
        <span className='flex items-center gap-1 text-[6.5px] font-medium text-[#697c99]'>
          <IconoMedico className='h-[10px] w-[10px]' nombre='info' strokeWidth={1.7} />
          {notaHorario}
        </span>
      </div>

      <div className='h-[156px] overflow-hidden rounded-xl border border-[#e0e7ee] bg-white shadow-[0_3px_10px_rgba(23,55,96,0.05)]'>
        {medicamentos.map((medicamento) => {
          const estilo = ESTILOS_TONO[medicamento.tono]

          return (
            <article
              className='flex h-[39px] items-center gap-1.5 border-b border-[#e7edf2] px-1.5 last:border-b-0'
              key={medicamento.id}
            >
              <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full ${estilo.fondo} ${estilo.texto}`}>
                <IconoMedico className='h-[15px] w-[15px]' nombre={estilo.icono} strokeWidth={1.7} />
              </span>

              <div className='w-[83px] min-w-0 shrink-0'>
                <h3 className='truncate text-[8px] font-extrabold leading-[10px] text-[#15356f]'>{medicamento.nombre}</h3>
                <p className='truncate text-[6.7px] font-medium leading-[9px] text-[#677996]'>{medicamento.dosis}</p>
              </div>

              <div className='flex min-w-0 flex-1 items-center gap-1.5'>
                {medicamento.horarios.map((horario) => (
                  <div className='flex min-w-0 flex-1 items-start gap-1 text-[#00a2ad]' key={`${medicamento.id}-${horario.valor}`}>
                    <IconoMedico className='mt-px h-[11px] w-[11px] shrink-0' nombre={horario.icono} strokeWidth={1.7} />
                    <span className='min-w-0'>
                      {horario.horaIso ? (
                        <time className='block truncate text-[6.8px] font-extrabold leading-[9px]' dateTime={horario.horaIso}>
                          {horario.valor}
                        </time>
                      ) : (
                        <strong className='block truncate text-[6.8px] font-extrabold leading-[9px]'>{horario.valor}</strong>
                      )}
                      <span className='block truncate text-[6px] font-medium leading-[8px] text-[#657995]'>{horario.detalle}</span>
                    </span>
                  </div>
                ))}
              </div>

              {medicamento.estado && (
                <span className='shrink-0 rounded-full bg-[#edf5ff] px-1.5 py-1 text-[5.5px] font-bold text-[#4a77cb]'>
                  {medicamento.estado}
                </span>
              )}

              <IconoMedico className='h-[11px] w-[11px] shrink-0 text-[#1f55a0]' nombre='chevronDown' strokeWidth={1.8} />
            </article>
          )
        })}
      </div>
    </section>
  )
}

export default MedicacionIndicadaComp
