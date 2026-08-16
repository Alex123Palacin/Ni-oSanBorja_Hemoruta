import { Outlet, useNavigate } from 'react-router-dom'
import { useState } from 'react'

import useAuth from '../../auth/useAuth'
import IconoMedico from '../IconoMedico'
import MenuAdmin from '../MenuAdmin'

function AdminSessionLayoutComp() {
  const { cerrarSesion, usuario } = useAuth()
  const navigate = useNavigate()
  const [cerrando, setCerrando] = useState(false)

  async function salir() {
    if (cerrando) return
    setCerrando(true)
    try {
      await cerrarSesion()
    } finally {
      navigate('/login', { replace: true })
    }
  }

  return (
    <>
      <div className='flex min-h-dvh bg-[#fbfdff] text-[#0b2b69]'>
        <MenuAdmin />
        <div className='min-w-0 flex-1'>
          <Outlet />
        </div>
      </div>
      <aside className='fixed bottom-4 right-4 z-[100] flex max-w-[calc(100vw-2rem)] items-center gap-3 rounded-2xl border border-[#d9e5ec] bg-white/95 p-2 pl-3 shadow-[0_12px_35px_rgba(14,48,89,0.16)] backdrop-blur'>
        <span className='hidden min-w-0 sm:block'>
          <strong className='block max-w-40 truncate text-[11px] text-[#0a2b70]'>{usuario?.nombre}</strong>
          <span className='block text-[9px] font-semibold text-[#71809a]'>Sesión administrativa</span>
        </span>
        <button
          className='flex h-9 cursor-pointer items-center gap-2 rounded-xl bg-[#fff0f1] px-3 text-[10px] font-extrabold text-[#c83445] transition hover:bg-[#ffe5e8] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d34454] disabled:cursor-wait disabled:opacity-60'
          disabled={cerrando}
          onClick={() => void salir()}
          type='button'
        >
          <IconoMedico className='h-4 w-4' nombre='arrowLeft' strokeWidth={2} />
          {cerrando ? 'Saliendo…' : 'Cerrar sesión'}
        </button>
      </aside>
    </>
  )
}

export default AdminSessionLayoutComp
