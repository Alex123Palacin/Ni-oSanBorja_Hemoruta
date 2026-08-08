import IconoMedico, { type NombreIconoMedico } from '../IconoMedico'

export type NivelIntensidadSintoma = 'fuerte' | 'leve' | 'moderado'

export interface OpcionIntensidadSintoma {
  icono: NombreIconoMedico
  texto: string
  valor: NivelIntensidadSintoma
}

interface SintomasIntencidadCompProps {
  intensidad: NivelIntensidadSintoma | null
  onCambiar: (intensidad: NivelIntensidadSintoma) => void
  opciones: readonly OpcionIntensidadSintoma[]
  titulo: string
}

const ESTILOS_INTENSIDAD: Record<NivelIntensidadSintoma, { activo: string; base: string }> = {
  fuerte: {
    activo: 'border-[#ff8c8c] bg-[#fff7f7] ring-2 ring-[#ff6b6b]/10',
    base: 'text-[#f04747]',
  },
  leve: {
    activo: 'border-[#8bd39a] bg-[#f5fff6] ring-2 ring-[#49b75a]/10',
    base: 'text-[#269b3b]',
  },
  moderado: {
    activo: 'border-[#ffc66a] bg-[#fffaf2] ring-2 ring-[#f7a91c]/10',
    base: 'text-[#f39a0b]',
  },
}

function SintomasIntencidadComp({
  intensidad,
  onCambiar,
  opciones,
  titulo,
}: SintomasIntencidadCompProps) {
  return (
    <section aria-labelledby='titulo-intensidad-sintoma'>
      <h2 className='text-[10px] font-extrabold text-[#14366f]' id='titulo-intensidad-sintoma'>{titulo}</h2>
      <div className='mt-1.5 grid grid-cols-3 gap-2.5' role='radiogroup'>
        {opciones.map((opcion) => {
          const seleccionado = intensidad === opcion.valor
          const estilo = ESTILOS_INTENSIDAD[opcion.valor]

          return (
            <button
              aria-checked={seleccionado}
              className={`flex h-[58px] cursor-pointer flex-col items-center justify-center rounded-lg border bg-white transition focus-visible:outline-2 focus-visible:outline-[#08aabb] ${estilo.base} ${
                seleccionado ? estilo.activo : 'border-[#e0e7ee] hover:brightness-95'
              }`}
              key={opcion.valor}
              onClick={() => onCambiar(opcion.valor)}
              role='radio'
              type='button'
            >
              <IconoMedico className='h-[21px] w-[21px]' nombre={opcion.icono} strokeWidth={1.8} />
              <span className='mt-1 text-[8px] font-extrabold'>{opcion.texto}</span>
            </button>
          )
        })}
      </div>
    </section>
  )
}

export default SintomasIntencidadComp
