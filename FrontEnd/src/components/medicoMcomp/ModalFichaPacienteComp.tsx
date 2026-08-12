import { useEffect, type ReactNode } from 'react'

import IconoMedico from '../IconoMedico'

interface ModalFichaPacienteCompProps {
  children: ReactNode
  descripcion?: string
  onCerrar: () => void
  titulo: string
}

function ModalFichaPacienteComp({ children, descripcion, onCerrar, titulo }: ModalFichaPacienteCompProps) {
  useEffect(() => {
    function cerrarConEscape(evento: KeyboardEvent) {
      if (evento.key === 'Escape') onCerrar()
    }
    window.addEventListener('keydown', cerrarConEscape)
    return () => window.removeEventListener('keydown', cerrarConEscape)
  }, [onCerrar])

  return (
    <div
      aria-label={titulo}
      aria-modal='true'
      className='fixed inset-0 z-[80] grid place-items-center overflow-y-auto bg-[#061a45]/45 p-3 backdrop-blur-[2px] sm:p-6'
      onMouseDown={(evento) => {
        if (evento.currentTarget === evento.target) onCerrar()
      }}
      role='dialog'
    >
      <section className='flex max-h-[min(86dvh,760px)] w-full max-w-[860px] flex-col overflow-hidden rounded-2xl border border-[#d8e4ed] bg-[#fbfdff] shadow-[0_24px_70px_rgba(8,39,103,.24)]'>
        <header className='flex items-start justify-between gap-4 border-b border-[#dce5ee] bg-white px-5 py-4'>
          <div>
            <h2 className='text-[18px] font-extrabold tracking-[-.02em] text-[#082767]'>{titulo}</h2>
            {descripcion && <p className='mt-1 text-[10px] leading-4 text-[#5c7193]'>{descripcion}</p>}
          </div>
          <button
            aria-label={`Cerrar ${titulo}`}
            className='grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-[#d9e3ec] bg-white text-[#53698e] transition hover:bg-[#f2f8fb] focus-visible:outline-2 focus-visible:outline-[#08aabb]'
            onClick={onCerrar}
            type='button'
          >
            <IconoMedico className='h-5 w-5' nombre='x' />
          </button>
        </header>
        <div className='min-h-0 flex-1 overflow-y-auto p-4 sm:p-5'>{children}</div>
      </section>
    </div>
  )
}

export default ModalFichaPacienteComp
