import IconoMedico, { type NombreIconoMedico } from '../IconoMedico'

export interface TipoSintomaPaciente {
  icono: NombreIconoMedico
  id: string
  texto: string
}

interface TipoSintomaPacienteCompProps {
  onAlternar: (sintomaId: string) => void
  seleccionados: readonly string[]
  sintomas: readonly TipoSintomaPaciente[]
  titulo: string
}

function TipoSintomaPacienteComp({
  onAlternar,
  seleccionados,
  sintomas,
  titulo,
}: TipoSintomaPacienteCompProps) {
  return (
    <section aria-labelledby='titulo-tipos-sintomas'>
      <h2 className='text-[10px] font-extrabold text-[#14366f]' id='titulo-tipos-sintomas'>{titulo}</h2>
      <div className='mt-1.5 grid grid-cols-4 gap-2'>
        {sintomas.map((sintoma) => {
          const seleccionado = seleccionados.includes(sintoma.id)

          return (
            <button
              aria-pressed={seleccionado}
              className={`flex h-[38px] min-w-0 cursor-pointer items-center justify-center gap-1.5 rounded-lg border px-1 text-[7px] font-semibold transition focus-visible:outline-2 focus-visible:outline-[#08aabb] ${
                seleccionado
                  ? 'border-[#00aeb2] bg-[#f2fcfd] text-[#123c78] shadow-[0_2px_6px_rgba(0,158,169,0.10)]'
                  : 'border-[#e0e7ee] bg-white text-[#17366f] hover:border-[#94dce1] hover:bg-[#f7fcfd]'
              }`}
              key={sintoma.id}
              onClick={() => onAlternar(sintoma.id)}
              type='button'
            >
              <IconoMedico className='h-[17px] w-[17px] shrink-0 text-[#00aeb2]' nombre={sintoma.icono} strokeWidth={1.7} />
              <span className='truncate'>{sintoma.texto}</span>
            </button>
          )
        })}
      </div>
    </section>
  )
}

export default TipoSintomaPacienteComp
