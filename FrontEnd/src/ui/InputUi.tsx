import { forwardRef, useId, type ComponentPropsWithoutRef } from 'react'

import IconoMedico, { type NombreIconoMedico } from '../components/IconoMedico'

interface InputUiProps extends Omit<ComponentPropsWithoutRef<'input'>, 'size'> {
  contenedorClassName?: string
  etiqueta: string
  etiquetaVisible?: boolean
  icono?: NombreIconoMedico
  tamano?: 'compacto' | 'normal'
}

const InputUi = forwardRef<HTMLInputElement, InputUiProps>(function InputUi(
  {
    className = '',
    contenedorClassName = '',
    etiqueta,
    etiquetaVisible = false,
    icono = 'search',
    id,
    tamano = 'normal',
    type = 'search',
    ...inputProps
  },
  ref,
) {
  const idGenerado = useId()
  const inputId = id ?? idGenerado

  return (
    <label className={`block min-w-0 ${contenedorClassName}`} htmlFor={inputId}>
      <span
        className={
          etiquetaVisible
            ? `${tamano === 'compacto' ? 'text-[9px]' : 'text-[10px]'} mb-1 block font-bold text-[#43577d]`
            : 'sr-only'
        }
      >
        {etiqueta}
      </span>
      <span className='relative block'>
        <IconoMedico
          className='pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#60749a]'
          nombre={icono}
        />
        <input
          {...inputProps}
          className={`${tamano === 'compacto' ? 'h-8 text-[10px]' : 'h-10 text-[11px]'} w-full rounded-lg border border-[#d3dfeb] bg-white pl-9 pr-3 font-medium text-[#183775] outline-none transition placeholder:text-[#627698] focus:border-[#08aabb] focus:ring-3 focus:ring-[#08aabb]/10 disabled:cursor-not-allowed disabled:bg-[#f2f5f8] ${className}`}
          id={inputId}
          ref={ref}
          type={type}
        />
      </span>
    </label>
  )
})

export type { InputUiProps }
export default InputUi
