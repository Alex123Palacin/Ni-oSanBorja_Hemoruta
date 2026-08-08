import IconoMedico, { type NombreIconoMedico } from '../IconoMedico'

export type RespuestaDosisPaciente = 'no-tomada' | 'tarde' | 'tomada'
export type MotivoNoTomaPaciente = 'malestar' | 'olvido' | 'otro' | 'sin-medicamento'
export type TonoRespuestaDosis = 'naranja' | 'rojo' | 'verde'

export interface OpcionRespuestaDosisPaciente {
  icono: NombreIconoMedico
  texto: string
  tono: TonoRespuestaDosis
  valor: RespuestaDosisPaciente
}

export interface OpcionMotivoDosisPaciente {
  texto: string
  valor: MotivoNoTomaPaciente
}

interface DosisHoyCompProps {
  fecha: string
  fechaIso: string
  informacion: string
  medicamentoId: string
  motivo: MotivoNoTomaPaciente | null
  motivos: readonly OpcionMotivoDosisPaciente[]
  onMotivo: (registroId: string, motivo: MotivoNoTomaPaciente) => void
  onRespuesta: (registroId: string, respuesta: RespuestaDosisPaciente) => void
  opciones: readonly OpcionRespuestaDosisPaciente[]
  preguntaMotivo: string
  registroId: string
  respuesta: RespuestaDosisPaciente | null
  titulo: string
}

const ESTILOS_RESPUESTA: Record<TonoRespuestaDosis, { activo: string; base: string; icono: string }> = {
  naranja: {
    activo: 'ring-2 ring-[#f4aa29]/35',
    base: 'border-[#f1cf91] bg-[#fffaf0] text-[#d9870c]',
    icono: 'border-[#f5a91c] text-[#ed9815]',
  },
  rojo: {
    activo: 'ring-2 ring-[#ff6969]/30',
    base: 'border-[#ffb6b6] bg-[#fff5f5] text-[#e9484f]',
    icono: 'border-[#ff6969] text-[#f15158]',
  },
  verde: {
    activo: 'ring-2 ring-[#45b950]/30',
    base: 'border-[#b5dfb9] bg-[#f4fff5] text-[#319e3d]',
    icono: 'border-[#3fb74a] bg-[#3fb74a] text-white',
  },
}

function DosisHoyComp({
  fecha,
  fechaIso,
  informacion,
  medicamentoId,
  motivo,
  motivos,
  onMotivo,
  onRespuesta,
  opciones,
  preguntaMotivo,
  registroId,
  respuesta,
  titulo,
}: DosisHoyCompProps) {
  return (
    <section
      aria-label={`${titulo}: ${medicamentoId}`}
      className='flex h-[150px] flex-col overflow-hidden rounded-xl border border-[#e0e7ee] bg-white shadow-[0_3px_10px_rgba(23,55,96,0.05)]'
    >
      <div className='min-h-0 flex-1 px-2.5 pt-2'>
        <div className='flex items-center gap-1 text-[8px] text-[#637694]'>
          <h2 className='font-extrabold text-[#17366f]'>{titulo}</h2>
          <span aria-hidden='true'>|</span>
          <time className='font-medium' dateTime={fechaIso}>{fecha}</time>
        </div>

        <fieldset className='mt-2 grid grid-cols-3 gap-1.5'>
          <legend className='sr-only'>Registra si tomaste la dosis</legend>
          {opciones.map((opcion) => {
            const estilo = ESTILOS_RESPUESTA[opcion.tono]
            const seleccionado = respuesta === opcion.valor

            return (
              <label
                className={`flex h-[31px] cursor-pointer items-center justify-center gap-1 rounded-md border text-[6.5px] font-bold transition ${estilo.base} ${seleccionado ? estilo.activo : 'hover:brightness-95'}`}
                key={opcion.valor}
              >
                <input
                  checked={seleccionado}
                  className='sr-only'
                  name={`respuesta-${registroId}`}
                  onChange={() => onRespuesta(registroId, opcion.valor)}
                  type='radio'
                  value={opcion.valor}
                />
                <span className={`grid h-4 w-4 shrink-0 place-items-center rounded-full border ${estilo.icono}`}>
                  <IconoMedico className='h-2.5 w-2.5' nombre={opcion.icono} strokeWidth={2} />
                </span>
                {opcion.texto}
              </label>
            )
          })}
        </fieldset>

        <fieldset className='mt-2'>
          <legend className='text-[7px] font-bold text-[#17366f]'>{preguntaMotivo}</legend>
          <div className='mt-1.5 grid grid-cols-[0.8fr_1.7fr_0.8fr_0.65fr] gap-1.5'>
            {motivos.map((opcion) => {
              const seleccionado = motivo === opcion.valor
              const deshabilitado = respuesta !== 'no-tomada'

              return (
                <label
                  aria-disabled={deshabilitado}
                  className={`flex h-[22px] min-w-0 items-center justify-center rounded-md border px-1 text-center text-[5.8px] font-medium transition ${
                    seleccionado
                      ? 'cursor-pointer border-[#34b8be] bg-[#eafafa] font-bold text-[#078f99]'
                      : deshabilitado
                        ? 'cursor-default border-[#e5ebf1] bg-[#fbfcfd] text-[#8290a5]'
                        : 'cursor-pointer border-[#dfe7ef] bg-white text-[#617492] hover:bg-[#f5fafc]'
                  }`}
                  key={opcion.valor}
                >
                  <input
                    checked={seleccionado}
                    className='sr-only'
                    disabled={deshabilitado}
                    name={`motivo-${registroId}`}
                    onChange={() => onMotivo(registroId, opcion.valor)}
                    type='radio'
                    value={opcion.valor}
                  />
                  <span className='truncate'>{opcion.texto}</span>
                </label>
              )
            })}
          </div>
        </fieldset>
      </div>

      <div className='flex h-[34px] shrink-0 items-center gap-2 border-t border-[#dbe8f3] bg-[#f1f8ff] px-2.5' role='note'>
        <IconoMedico className='h-[16px] w-[16px] shrink-0 text-[#2777df]' nombre='info' strokeWidth={1.8} />
        <p className='text-[6.5px] font-medium leading-[9px] text-[#315b91]'>{informacion}</p>
      </div>
    </section>
  )
}

export default DosisHoyComp
