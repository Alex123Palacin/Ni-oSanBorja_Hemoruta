import IconoMedico from '../components/IconoMedico'

export interface OpcionComboBox {
  etiqueta: string
  valor: string
}

interface ComboBoxUIProps {
  etiqueta: string
  id: string
  onChange: (valor: string) => void
  opciones: readonly OpcionComboBox[]
  valor: string
}

function ComboBoxUI({ etiqueta, id, onChange, opciones, valor }: ComboBoxUIProps) {
  return (
    <label className='block min-w-0' htmlFor={id}>
      <span className='mb-1 block text-[9px] font-bold text-[#43577d]'>{etiqueta}</span>
      <span className='relative block'>
        <select
          className='h-9 w-full cursor-pointer appearance-none rounded-lg border border-[#d3dfeb] bg-white px-3 pr-9 text-[10px] font-semibold text-[#183775] outline-none transition focus:border-[#08aabb] focus:ring-3 focus:ring-[#08aabb]/10'
          id={id}
          onChange={(event) => onChange(event.target.value)}
          value={valor}
        >
          {opciones.map((opcion) => (
            <option key={opcion.valor} value={opcion.valor}>
              {opcion.etiqueta}
            </option>
          ))}
        </select>
        <IconoMedico
          className='pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#49618b]'
          nombre='chevronDown'
          strokeWidth={2}
        />
      </span>
    </label>
  )
}

export default ComboBoxUI
