import { Navigate, Outlet, useLocation } from 'react-router-dom'

import type { RolUsuarioApi } from '../api/compartido/TiposApi'
import useAuth from './useAuth'

interface ProtectedRouteProps {
  rolesPermitidos: readonly RolUsuarioApi[]
  rutaLogin: string
}

const RUTA_INICIAL_POR_ROL: Record<RolUsuarioApi, string> = {
  ADMINISTRADOR: '/admin/inicio',
  MEDICO: '/doctor/inicio',
  PACIENTE: '/paciente/inicio',
}

function ProtectedRoute({ rolesPermitidos, rutaLogin }: ProtectedRouteProps) {
  const { cargando, usuario } = useAuth()
  const ubicacion = useLocation()

  if (cargando) {
    return (
      <main className='grid min-h-dvh place-items-center bg-[#f7fbfd] px-5 text-center text-[#0a2b70]'>
        <div aria-live='polite' role='status'>
          <span className='mx-auto block h-9 w-9 animate-spin rounded-full border-4 border-[#d8f1f3] border-t-[#08aabb]' />
          <p className='mt-3 text-sm font-semibold'>Verificando sesión…</p>
        </div>
      </main>
    )
  }

  if (!usuario) {
    return <Navigate replace state={{ from: ubicacion }} to={rutaLogin} />
  }

  if (!rolesPermitidos.includes(usuario.rol)) {
    return <Navigate replace to={RUTA_INICIAL_POR_ROL[usuario.rol]} />
  }

  return <Outlet />
}

export default ProtectedRoute
