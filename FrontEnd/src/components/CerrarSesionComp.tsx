import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import useAuth from '../auth/useAuth'
import IconoMedico from './IconoMedico'

type VarianteCerrarSesion = 'flotanteDoctor' | 'flotantePaciente' | 'menuMedico'

interface CerrarSesionCompProps {
  rutaIngreso: string
  variante: VarianteCerrarSesion
}

const estilos: Record<VarianteCerrarSesion, string> = {
  flotanteDoctor:
    'fixed bottom-4 right-4 z-[95] border-[#d6e4eb] bg-white/95 text-[#c33749] shadow-[0_10px_30px_rgba(15,45,82,0.16)] backdrop-blur',
  flotantePaciente:
    'fixed bottom-[calc(66px+env(safe-area-inset-bottom))] left-3 z-[89] border-[#d4e3e8] bg-white/95 text-[#a83343] shadow-[0_8px_24px_rgba(15,45,82,0.14)] backdrop-blur sm:left-[calc((100vw-clamp(400px,30vw,500px))/2+12px)]',
  menuMedico:
    'mt-3 w-full border-[#e2dfe5] bg-[#fff6f7] text-[#b73547] hover:bg-[#ffeaed]',
}

function CerrarSesionComp({ rutaIngreso, variante }: CerrarSesionCompProps) {
  const { autenticado, cerrarSesion } = useAuth()
  const navigate = useNavigate()
  const [cerrando, setCerrando] = useState(false)
  const esPaciente = variante === 'flotantePaciente'

  async function salir() {
    if (cerrando) return
    setCerrando(true)
    try {
      await cerrarSesion()
    } finally {
      navigate(rutaIngreso, { replace: true })
    }
  }

  if (!autenticado) return null

  return (
    <button
      aria-label={cerrando ? 'Cerrando sesión' : 'Cerrar sesión'}
      className={`flex cursor-pointer items-center justify-center gap-2 rounded-xl border font-extrabold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#cc3d50] disabled:cursor-wait disabled:opacity-60 ${
        esPaciente ? 'h-10 px-3 text-[9px]' : 'h-10 px-3.5 text-[10px]'
      } ${estilos[variante]}`}
      disabled={cerrando}
      onClick={() => void salir()}
      type='button'
    >
      <IconoMedico className='h-4 w-4 shrink-0' nombre='arrowLeft' strokeWidth={2.1} />
      {cerrando ? 'Saliendo…' : esPaciente ? 'Salir' : 'Cerrar sesión'}
    </button>
  )
}

export default CerrarSesionComp
