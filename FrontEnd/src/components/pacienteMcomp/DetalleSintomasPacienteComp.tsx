import IconoMedico, { type NombreIconoMedico } from '../IconoMedico'

export type DuracionSintomaPaciente = 'entre-1-y-6' | 'entre-6-y-24' | 'mas-de-24' | 'menos-de-1'
export type EvolucionSintomaPaciente = 'empeoro' | 'igual' | 'mejoro'

export interface BorradorDetalleSintomasPaciente {
  duracion: DuracionSintomaPaciente | null
  evolucion: EvolucionSintomaPaciente | null
  fechaHora: string
  observacion: string
}

export interface OpcionDuracionSintomaPaciente {
  texto: string
  valor: DuracionSintomaPaciente
}

export interface OpcionEvolucionSintomaPaciente {
  icono: NombreIconoMedico
  texto: string
  tono: 'azul' | 'rojo' | 'verde'
  valor: EvolucionSintomaPaciente
}

export interface EtiquetasDetalleSintomasPaciente {
  evolucion: string
  fechaHora: string
  fechaPlaceholder: string
  observacion: string
  observacionPlaceholder: string
  tiempoPresente: string
}

interface DetalleSintomasPacienteCompProps {
  etiquetas: EtiquetasDetalleSintomasPaciente
  maximoObservacion: number
  onCambiar: (cambio: Partial<BorradorDetalleSintomasPaciente>) => void
  opcionesDuracion: readonly OpcionDuracionSintomaPaciente[]
  opcionesEvolucion: readonly OpcionEvolucionSintomaPaciente[]
  valor: BorradorDetalleSintomasPaciente
}

const ESTILOS_EVOLUCION: Record<OpcionEvolucionSintomaPaciente['tono'], string> = {
  azul: 'text-[#1b9eae]',
  rojo: 'text-[#f04f55]',
  verde: 'text-[#2fab42]',
}

function mostrarFechaHora(valor: string, placeholder: string) {
  if (!valor) return placeholder

  const fecha = new Date(valor)
  if (Number.isNaN(fecha.getTime())) return valor

  return new Intl.DateTimeFormat('es-PE', {
    day: '2-digit',
    hour: '2-digit',
    hour12: true,
    minute: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(fecha)
}

function DetalleSintomasPacienteComp({
  etiquetas,
  maximoObservacion,
  onCambiar,
  opcionesDuracion,
  opcionesEvolucion,
  valor,
}: DetalleSintomasPacienteCompProps) {
  return (
    <section>
      <fieldset>
        <legend className='text-[10px] font-extrabold text-[#14366f]'>{etiquetas.tiempoPresente}</legend>
        <div className='mt-1.5 grid grid-cols-4 gap-2'>
          {opcionesDuracion.map((opcion) => {
            const seleccionado = valor.duracion === opcion.valor

            return (
              <label
                className={`flex h-[40px] min-w-0 cursor-pointer items-center justify-center gap-1 rounded-lg border px-1 text-center text-[6.7px] font-semibold leading-[9px] transition ${
                  seleccionado
                    ? 'border-[#58bec7] bg-[#f2fcfd] text-[#0e7888]'
                    : 'border-[#e0e7ee] bg-white text-[#17366f] hover:border-[#b8dce0]'
                }`}
                key={opcion.valor}
              >
                <input
                  checked={seleccionado}
                  className='sr-only'
                  name='duracion-sintoma'
                  onChange={() => onCambiar({ duracion: opcion.valor })}
                  type='radio'
                  value={opcion.valor}
                />
                <IconoMedico className='h-[15px] w-[15px] shrink-0 text-[#355c8f]' nombre='clock' strokeWidth={1.7} />
                <span>{opcion.texto}</span>
              </label>
            )
          })}
        </div>
      </fieldset>

      <div className='mt-2'>
        <label className='text-[10px] font-extrabold text-[#14366f]' htmlFor='fecha-hora-sintoma'>{etiquetas.fechaHora}</label>
        <label
          className='relative mt-1.5 flex h-[36px] cursor-pointer items-center rounded-lg border border-[#e0e7ee] bg-white px-2.5 text-[8px] font-medium text-[#6b7c98] shadow-[0_2px_7px_rgba(23,55,96,0.04)]'
          htmlFor='fecha-hora-sintoma'
        >
          <IconoMedico className='mr-2 h-[16px] w-[16px] shrink-0 text-[#5d7192]' nombre='calendar' strokeWidth={1.7} />
          <span className='truncate'>{mostrarFechaHora(valor.fechaHora, etiquetas.fechaPlaceholder)}</span>
          <IconoMedico className='ml-auto h-[15px] w-[15px] shrink-0 text-[#1e57a0]' nombre='arrowRight' strokeWidth={1.8} />
          <input
            className='absolute inset-0 cursor-pointer opacity-0'
            id='fecha-hora-sintoma'
            onChange={(evento) => onCambiar({ fechaHora: evento.target.value })}
            type='datetime-local'
            value={valor.fechaHora}
          />
        </label>
      </div>

      <fieldset className='mt-2'>
        <legend className='text-[10px] font-extrabold text-[#14366f]'>{etiquetas.evolucion}</legend>
        <div className='mt-1.5 grid grid-cols-3 gap-2.5'>
          {opcionesEvolucion.map((opcion) => {
            const seleccionado = valor.evolucion === opcion.valor

            return (
              <label
                className={`flex h-[34px] cursor-pointer items-center justify-center gap-2 rounded-lg border bg-white text-[7.5px] font-semibold transition ${
                  ESTILOS_EVOLUCION[opcion.tono]
                } ${seleccionado ? 'border-[#70cbd2] bg-[#f4fcfd] shadow-[0_2px_7px_rgba(0,158,169,0.08)]' : 'border-[#e0e7ee] hover:border-[#b8dce0]'}`}
                key={opcion.valor}
              >
                <input
                  checked={seleccionado}
                  className='sr-only'
                  name='evolucion-sintoma'
                  onChange={() => onCambiar({ evolucion: opcion.valor })}
                  type='radio'
                  value={opcion.valor}
                />
                <IconoMedico className='h-[15px] w-[15px]' nombre={opcion.icono} strokeWidth={1.8} />
                {opcion.texto}
              </label>
            )
          })}
        </div>
      </fieldset>

      <div className='mt-2'>
        <label className='text-[10px] font-extrabold text-[#14366f]' htmlFor='observacion-sintoma'>{etiquetas.observacion}</label>
        <div className='relative mt-1.5'>
          <textarea
            aria-describedby='contador-observacion-sintoma'
            className='h-[52px] w-full resize-none rounded-lg border border-[#e0e7ee] bg-white px-2.5 py-2 pr-10 text-[8px] font-medium leading-[11px] text-[#17366f] outline-none transition placeholder:text-[#8996aa] focus:border-[#05aeb0] focus:ring-2 focus:ring-[#05aeb0]/15'
            id='observacion-sintoma'
            maxLength={maximoObservacion}
            onChange={(evento) => onCambiar({ observacion: evento.target.value })}
            placeholder={etiquetas.observacionPlaceholder}
            value={valor.observacion}
          />
          <span className='absolute bottom-1.5 right-2 text-[6.5px] font-medium text-[#8a97aa]' id='contador-observacion-sintoma'>
            {valor.observacion.length}/{maximoObservacion}
          </span>
        </div>
      </div>
    </section>
  )
}

export default DetalleSintomasPacienteComp
