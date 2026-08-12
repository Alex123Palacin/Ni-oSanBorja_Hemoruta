import { useState } from 'react'
import IconoMedico from '../IconoMedico'

export type RespuestaDosisPaciente = 'no-tomada' | 'tarde' | 'tomada'
export type MotivoNoTomaPaciente = 'malestar' | 'olvido' | 'otro' | 'sin-medicamento'

export interface DosisActualPaciente {
  dosis: string
  estado: 'CANCELADA' | 'OMITIDA' | 'PENDIENTE' | 'TARDE' | 'TOMADA'
  hora: string
  id: string
  medicamentoId: string
  motivoNoToma: string | null
  nombre: string
  via: string
}

interface DosisHoyCompProps {
  dosis: readonly DosisActualPaciente[]
  fecha: string
  guardandoId: string | null
  mensaje?: string
  onRegistrar: (
    registroId: string,
    respuesta: RespuestaDosisPaciente,
    motivo?: MotivoNoTomaPaciente,
  ) => void
}

const MOTIVOS: readonly { texto: string; valor: MotivoNoTomaPaciente }[] = [
  { texto: 'Olvidó', valor: 'olvido' },
  { texto: 'Sin medicamento', valor: 'sin-medicamento' },
  { texto: 'Malestar', valor: 'malestar' },
  { texto: 'Otro', valor: 'otro' },
]

const ESTADOS = {
  CANCELADA: { clase: 'bg-[#f1f3f6] text-[#7c8a9e]', texto: 'Cancelada' },
  OMITIDA: { clase: 'bg-[#fff0f0] text-[#e94d54]', texto: 'No tomada' },
  PENDIENTE: { clase: 'bg-[#edf5ff] text-[#287bd5]', texto: 'Pendiente' },
  TARDE: { clase: 'bg-[#fff6e8] text-[#db8b11]', texto: 'Tomada tarde' },
  TOMADA: { clase: 'bg-[#eaf9ed] text-[#2ca743]', texto: 'Tomado' },
} as const

function formatearHora(hora: string) {
  const [horas, minutos] = hora.split(':').map(Number)
  if (!Number.isInteger(horas) || !Number.isInteger(minutos)) return hora
  return new Intl.DateTimeFormat('es-PE', {
    hour: '2-digit',
    hour12: true,
    minute: '2-digit',
  }).format(new Date(2026, 0, 1, horas, minutos))
}

function DosisHoyComp({ dosis, fecha, guardandoId, mensaje, onRegistrar }: DosisHoyCompProps) {
  const [motivoAbierto, setMotivoAbierto] = useState<string | null>(null)

  return (
    <section className='overflow-hidden rounded-xl border border-[#dfe8ee] bg-white shadow-[0_3px_10px_rgba(23,55,96,0.05)]'>
      <header className='flex h-[30px] items-center justify-between border-b border-[#e7edf2] px-2.5'>
        <h2 className='flex items-center gap-1 text-[9px] font-extrabold text-[#15366f]'>
          <IconoMedico className='h-3.5 w-3.5 text-[#00a5ae]' nombre='pill' strokeWidth={1.8} />
          Medicación de hoy
        </h2>
        <span className='text-[6.3px] font-semibold text-[#6c7d97]'>{fecha}</span>
      </header>

      <div className='max-h-[176px] overflow-y-auto'>
        {dosis.length === 0 && (
          <div className='flex h-[58px] items-center justify-center gap-2 px-3 text-center'>
            <span className='grid h-6 w-6 place-items-center rounded-full bg-[#edf8f2] text-[#39ad55]'>
              <IconoMedico className='h-3.5 w-3.5' nombre='check' strokeWidth={2} />
            </span>
            <p className='text-[7px] font-semibold text-[#526b89]'>No hay dosis programadas para hoy.</p>
          </div>
        )}

        {dosis.map((item) => {
          const pendiente = item.estado === 'PENDIENTE'
          const guardando = guardandoId === item.id
          const estado = ESTADOS[item.estado]

          return (
            <article className='border-b border-[#e8eef2] px-2 py-1.5 last:border-b-0' key={item.id}>
              <div className='flex min-h-[39px] items-center gap-1.5'>
                <span className='grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#eaf5ff] text-[#347fdb]'>
                  <IconoMedico className='h-4 w-4' nombre='pill' strokeWidth={1.7} />
                </span>
                <div className='min-w-0 flex-1'>
                  <h3 className='truncate text-[7.7px] font-extrabold leading-[10px] text-[#15366f]'>{item.nombre}</h3>
                  <p className='truncate text-[6.3px] font-medium text-[#697b96]'>{item.dosis} · {item.via.toLocaleLowerCase('es-PE')}</p>
                  <span className='flex items-center gap-1 text-[6.4px] font-bold text-[#00a0ac]'>
                    <IconoMedico className='h-2.5 w-2.5' nombre='clock' strokeWidth={1.8} />
                    {formatearHora(item.hora)}
                  </span>
                </div>
                <span className={`shrink-0 rounded-full px-1.5 py-1 text-[5.7px] font-extrabold ${estado.clase}`}>
                  {guardando ? 'Guardando…' : estado.texto}
                </span>
                {pendiente && (
                  <button
                    className='h-7 shrink-0 rounded-md bg-[#17ad54] px-2 text-[6.5px] font-extrabold text-white shadow-[0_2px_5px_rgba(23,173,84,0.2)] disabled:opacity-60'
                    disabled={guardandoId !== null}
                    onClick={() => onRegistrar(item.id, 'tomada')}
                    type='button'
                  >
                    <span className='flex items-center gap-0.5'>
                      <IconoMedico className='h-2.5 w-2.5' nombre='check' strokeWidth={2.3} />
                      Listo
                    </span>
                  </button>
                )}
              </div>

              {pendiente && (
                <div className='mt-1 flex items-center justify-end gap-1'>
                  <button
                    className='rounded-md border border-[#efc572] bg-[#fffaf0] px-1.5 py-0.5 text-[5.7px] font-bold text-[#d8890e] disabled:opacity-50'
                    disabled={guardandoId !== null}
                    onClick={() => onRegistrar(item.id, 'tarde')}
                    type='button'
                  >
                    La tomó tarde
                  </button>
                  <button
                    className={`rounded-md border px-1.5 py-0.5 text-[5.7px] font-bold disabled:opacity-50 ${
                      motivoAbierto === item.id
                        ? 'border-[#ee6c73] bg-[#fff2f2] text-[#df414a]'
                        : 'border-[#f0b8bb] bg-white text-[#df555c]'
                    }`}
                    disabled={guardandoId !== null}
                    onClick={() => setMotivoAbierto((actual) => actual === item.id ? null : item.id)}
                    type='button'
                  >
                    No la tomó
                  </button>
                </div>
              )}

              {pendiente && motivoAbierto === item.id && (
                <div className='mt-1 grid grid-cols-4 gap-1 rounded-md bg-[#fff8f8] p-1'>
                  {MOTIVOS.map((motivo) => (
                    <button
                      className='min-w-0 truncate rounded border border-[#f0d7d8] bg-white px-1 py-1 text-[5.4px] font-semibold text-[#875e64] hover:border-[#ed8d92]'
                      disabled={guardandoId !== null}
                      key={motivo.valor}
                      onClick={() => {
                        setMotivoAbierto(null)
                        onRegistrar(item.id, 'no-tomada', motivo.valor)
                      }}
                      title={motivo.texto}
                      type='button'
                    >
                      {motivo.texto}
                    </button>
                  ))}
                </div>
              )}
            </article>
          )
        })}
      </div>

      {mensaje && (
        <p className='border-t border-[#dbe8f3] bg-[#f1f8ff] px-2.5 py-1 text-[6px] font-semibold text-[#315b91]' role='status'>
          {mensaje}
        </p>
      )}
    </section>
  )
}

export default DosisHoyComp
