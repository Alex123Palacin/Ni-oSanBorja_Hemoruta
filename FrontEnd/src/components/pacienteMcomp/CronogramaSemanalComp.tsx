import IconoMedico, { type NombreIconoMedico } from '../IconoMedico'

export type EstadoDiaMedicacion =
  | 'completado'
  | 'no-tomada'
  | 'parcial'
  | 'pendiente-hoy'
  | 'pendiente'
  | 'sin-dosis'

export interface DiaMedicacionPaciente {
  dia: number
  estado: EstadoDiaMedicacion
  fecha: string
}

interface CronogramaSemanalCompProps {
  abierto: boolean
  dias: readonly DiaMedicacionPaciente[]
  fechaSeleccionada: string
  mes: string
  onAlternar: () => void
  onCambiarMes: (mes: string) => void
  onSeleccionarDia: (fecha: string) => void
}

const DIAS_CABECERA = ['L', 'M', 'M', 'J', 'V', 'S', 'D'] as const

const ESTILOS_ESTADO: Record<
  EstadoDiaMedicacion,
  { circulo: string; icono: NombreIconoMedico; texto: string }
> = {
  completado: { circulo: 'bg-[#eaf9ed] text-[#35b44a]', icono: 'check', texto: 'Completado' },
  'no-tomada': { circulo: 'bg-[#fff0f0] text-[#ee4f57]', icono: 'x', texto: 'No tomada' },
  parcial: { circulo: 'bg-[#fff6e8] text-[#ee9d17]', icono: 'clock', texto: 'Parcial' },
  'pendiente-hoy': { circulo: 'bg-[#eaf4ff] text-[#2783e8]', icono: 'clock', texto: 'Pendiente hoy' },
  pendiente: { circulo: 'bg-[#f1f4f8] text-[#95a3b4]', icono: 'clock', texto: 'Pendiente' },
  'sin-dosis': { circulo: 'bg-[#f4f6f8] text-[#aab4c0]', icono: 'minusSquare', texto: 'Sin dosis' },
}

function moverMes(mes: string, desplazamiento: number) {
  const [anio, numeroMes] = mes.split('-').map(Number)
  const fecha = new Date(anio, numeroMes - 1 + desplazamiento, 1)
  return `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`
}

function nombreMes(mes: string) {
  const [anio, numeroMes] = mes.split('-').map(Number)
  const texto = new Intl.DateTimeFormat('es-PE', { month: 'long', year: 'numeric' }).format(
    new Date(anio, numeroMes - 1, 1),
  )
  return `${texto.charAt(0).toLocaleUpperCase('es-PE')}${texto.slice(1)}`
}

function CronogramaSemanalComp({
  abierto,
  dias,
  fechaSeleccionada,
  mes,
  onAlternar,
  onCambiarMes,
  onSeleccionarDia,
}: CronogramaSemanalCompProps) {
  const primerDiaSemana = dias[0]
    ? new Date(`${dias[0].fecha}T12:00:00`).getDay() || 7
    : 1
  const vacios = Array.from({ length: primerDiaSemana - 1 })
  const seleccion = dias.find((dia) => dia.fecha === fechaSeleccionada)
  const estadoSeleccion = seleccion ? ESTILOS_ESTADO[seleccion.estado] : null

  return (
    <section className='overflow-hidden rounded-xl border border-[#dbe7ed] bg-white shadow-[0_3px_12px_rgba(23,55,96,0.06)]'>
      <div className='flex h-[43px] items-center gap-1.5 px-2'>
        <button
          aria-label='Mes anterior'
          className='grid h-7 w-7 shrink-0 place-items-center rounded-full text-[#2d5b8f] transition hover:bg-[#edf8fa]'
          onClick={() => onCambiarMes(moverMes(mes, -1))}
          type='button'
        >
          <IconoMedico className='h-3.5 w-3.5' nombre='arrowLeft' strokeWidth={2} />
        </button>

        <button
          aria-expanded={abierto}
          className='flex min-w-0 flex-1 items-center gap-2 rounded-lg px-1.5 py-1 text-left hover:bg-[#f4fafb]'
          onClick={onAlternar}
          type='button'
        >
          <span className='grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#e8f8fa] text-[#00a4af]'>
            <IconoMedico className='h-4 w-4' nombre='calendar' strokeWidth={1.8} />
          </span>
          <span className='min-w-0 flex-1'>
            <strong className='block truncate text-[9px] font-extrabold text-[#14366f]'>{nombreMes(mes)}</strong>
            <span className='flex items-center gap-1 text-[6.5px] font-semibold text-[#657997]'>
              {estadoSeleccion && (
                <span className={`grid h-3 w-3 place-items-center rounded-full ${estadoSeleccion.circulo}`}>
                  <IconoMedico className='h-2 w-2' nombre={estadoSeleccion.icono} strokeWidth={2} />
                </span>
              )}
              {seleccion ? `Día ${seleccion.dia}: ${estadoSeleccion?.texto}` : 'Selecciona una fecha'}
            </span>
          </span>
          <IconoMedico
            className={`h-3.5 w-3.5 shrink-0 text-[#496789] transition-transform ${abierto ? 'rotate-180' : ''}`}
            nombre='chevronDown'
            strokeWidth={1.8}
          />
        </button>

        <button
          aria-label='Mes siguiente'
          className='grid h-7 w-7 shrink-0 place-items-center rounded-full text-[#2d5b8f] transition hover:bg-[#edf8fa]'
          onClick={() => onCambiarMes(moverMes(mes, 1))}
          type='button'
        >
          <IconoMedico className='h-3.5 w-3.5' nombre='arrowRight' strokeWidth={2} />
        </button>
      </div>

      {abierto && (
        <div className='border-t border-[#e7edf2] px-2 pb-2 pt-1.5'>
          <div className='grid grid-cols-7 text-center text-[6px] font-extrabold text-[#71819a]'>
            {DIAS_CABECERA.map((dia, indice) => <span key={`${dia}-${indice}`}>{dia}</span>)}
          </div>
          <div className='mt-1 grid grid-cols-7 gap-1'>
            {vacios.map((_, indice) => <span aria-hidden='true' key={`vacio-${indice}`} />)}
            {dias.map((dia) => {
              const estilo = ESTILOS_ESTADO[dia.estado]
              const seleccionado = fechaSeleccionada === dia.fecha
              const hoy = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Lima' }) === dia.fecha

              return (
                <button
                  aria-label={`${dia.fecha}: ${estilo.texto}`}
                  aria-pressed={seleccionado}
                  className={`relative flex h-[29px] flex-col items-center justify-center rounded-md border transition focus-visible:outline-2 focus-visible:outline-[#00a6af] ${
                    seleccionado
                      ? 'border-[#41c1ca] bg-[#eaf9fa] shadow-[0_2px_6px_rgba(0,159,170,0.14)]'
                      : hoy
                        ? 'border-[#a4dfe4] bg-[#f5fcfd]'
                        : 'border-transparent hover:bg-[#f5f9fb]'
                  }`}
                  key={dia.fecha}
                  onClick={() => onSeleccionarDia(dia.fecha)}
                  type='button'
                >
                  <span className={`text-[7px] font-extrabold ${seleccionado ? 'text-[#078f99]' : 'text-[#1d3c70]'}`}>{dia.dia}</span>
                  <span className={`mt-px grid h-2.5 w-2.5 place-items-center rounded-full ${estilo.circulo}`}>
                    <IconoMedico className='h-1.5 w-1.5' nombre={estilo.icono} strokeWidth={2.2} />
                  </span>
                </button>
              )
            })}
          </div>
          <div className='mt-1.5 flex flex-wrap items-center justify-center gap-x-2 gap-y-1'>
            {(['completado', 'no-tomada', 'pendiente-hoy', 'sin-dosis'] as const).map((estado) => {
              const estilo = ESTILOS_ESTADO[estado]
              return (
                <span className='flex items-center gap-0.5 text-[5.5px] font-semibold text-[#667997]' key={estado}>
                  <span className={`grid h-2.5 w-2.5 place-items-center rounded-full ${estilo.circulo}`}>
                    <IconoMedico className='h-1.5 w-1.5' nombre={estilo.icono} strokeWidth={2} />
                  </span>
                  {estilo.texto}
                </span>
              )
            })}
          </div>
        </div>
      )}
    </section>
  )
}

export default CronogramaSemanalComp
