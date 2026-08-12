import IconoMedico, { type NombreIconoMedico } from '../IconoMedico'

export type DuracionSintomaPaciente = 'entre-1-y-6' | 'entre-6-y-24' | 'mas-de-24' | 'menos-de-1'
export type EvolucionSintomaPaciente = 'empeoro' | 'igual' | 'mejoro'

export interface BorradorDetalleSintomasPaciente {
  duracion: DuracionSintomaPaciente | null
  evolucion: EvolucionSintomaPaciente | null
  fecha: string
  hora: string
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
        <p className='text-[10px] font-extrabold text-[#14366f]'>{etiquetas.fechaHora}</p>
        <div className='mt-1.5 grid grid-cols-[minmax(0,1.35fr)_minmax(0,.85fr)] gap-2'>
          <label className='relative flex h-[42px] items-center rounded-lg border border-[#dce5ed] bg-white px-2.5 focus-within:border-[#05aeb0] focus-within:ring-2 focus-within:ring-[#05aeb0]/15'>
            <IconoMedico className='mr-2 h-4 w-4 shrink-0 text-[#2688a1]' nombre='calendar' />
            <span className='sr-only'>{etiquetas.fechaPlaceholder}</span>
            <input
              aria-label='Fecha en que iniciaron los síntomas'
              className='min-w-0 flex-1 bg-transparent text-[9px] font-semibold text-[#314c76] outline-none'
              max={new Date().toISOString().slice(0, 10)}
              onChange={(evento) => onCambiar({ fecha: evento.target.value })}
              type='date'
              value={valor.fecha}
            />
          </label>
          <label className='relative flex h-[42px] items-center rounded-lg border border-[#dce5ed] bg-white px-2.5 focus-within:border-[#05aeb0] focus-within:ring-2 focus-within:ring-[#05aeb0]/15'>
            <IconoMedico className='mr-1.5 h-4 w-4 shrink-0 text-[#2688a1]' nombre='clock' />
            <span className='sr-only'>Hora en que iniciaron los síntomas</span>
            <input
              aria-label='Hora en que iniciaron los síntomas'
              className='min-w-0 flex-1 bg-transparent text-[9px] font-semibold text-[#314c76] outline-none'
              onChange={(evento) => onCambiar({ hora: evento.target.value })}
              type='time'
              value={valor.hora}
            />
          </label>
        </div>
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
