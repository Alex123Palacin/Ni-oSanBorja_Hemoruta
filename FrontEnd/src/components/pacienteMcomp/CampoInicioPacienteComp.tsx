import type { HTMLInputTypeAttribute } from 'react'
import IconoMedico, { type NombreIconoMedico } from '../IconoMedico'
import type { OpcionCampoInicioPaciente } from '../../types/InicioPaciente'

interface CampoInicioPacienteCompProps {
  autoComplete?: string
  className?: string
  etiqueta: string
  icono?: NombreIconoMedico
  id: string
  onCambiar: (valor: string) => void
  opciones?: readonly OpcionCampoInicioPaciente[]
  placeholder: string
  requerido?: boolean
  tipo?: HTMLInputTypeAttribute
  valor: string
}

function CampoInicioPacienteComp({
  autoComplete,
  className = '',
  etiqueta,
  icono,
  id,
  onCambiar,
  opciones,
  placeholder,
  requerido = false,
  tipo = 'text',
  valor,
}: CampoInicioPacienteCompProps) {
  const clasesControl = `h-[38px] w-full rounded-[8px] border border-[#dce5ed] bg-white text-[9px] font-medium text-[#17366f] outline-none transition placeholder:text-[#8b9ab2] focus:border-[#07aeb4] focus:ring-2 focus:ring-[#07aeb4]/15 ${
    icono ? 'pl-8 pr-2.5' : 'px-2.5'
  }`

  return (
    <div className={className}>
      <label className='mb-1 block text-[8px] font-bold leading-tight text-[#17366f]' htmlFor={id}>
        {etiqueta}
        {requerido && <span className='ml-0.5 text-[#ff626d]'>*</span>}
      </label>

      <div className='relative'>
        {icono && (
          <IconoMedico
            className='pointer-events-none absolute left-2.5 top-1/2 h-[13px] w-[13px] -translate-y-1/2 text-[#6d809d]'
            nombre={icono}
            strokeWidth={1.65}
          />
        )}

        {opciones ? (
          <>
            <select
              className={`${clasesControl} appearance-none pr-7`}
              id={id}
              onChange={(evento) => onCambiar(evento.target.value)}
              required={requerido}
              value={valor}
            >
              <option value=''>{placeholder}</option>
              {opciones.map((opcion) => (
                <option key={opcion.valor} value={opcion.valor}>
                  {opcion.texto}
                </option>
              ))}
            </select>
            <IconoMedico
              className='pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#667b9c]'
              nombre='chevronDown'
              strokeWidth={1.7}
            />
          </>
        ) : (
          <input
            autoComplete={autoComplete}
            className={clasesControl}
            id={id}
            onChange={(evento) => onCambiar(evento.target.value)}
            placeholder={placeholder}
            required={requerido}
            type={tipo}
            value={valor}
          />
        )}
      </div>
    </div>
  )
}

export default CampoInicioPacienteComp
