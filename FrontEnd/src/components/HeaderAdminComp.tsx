import { Link } from 'react-router-dom'

import useAuth from '../auth/useAuth'
import AvatarUsuarioComp from './AvatarUsuarioComp'
import IconoMedico from './IconoMedico'

function HeaderAdminComp() {
  const { usuario } = useAuth()
  const nombre = usuario?.nombreCompleto || usuario?.nombre || 'Administrador'

  return (
    <header className='sticky top-0 z-30 flex min-h-[54px] items-center justify-end border-b border-[#dce5ee] bg-white px-4 sm:px-6 lg:px-8'>
      <Link
        aria-label='Abrir mi cuenta'
        className='flex items-center gap-2 rounded-xl px-2 py-1 transition hover:bg-[#f3f9fa]'
        to='/admin/inicio'
      >
        <AvatarUsuarioComp clase='h-10 w-10 text-[11px]' foto={usuario?.fotoPerfil} nombre={nombre} />
        <span className='hidden min-w-0 sm:block'>
          <strong className='block max-w-48 truncate text-[11px] font-extrabold text-[#09286c]'>{nombre}</strong>
          <span className='block text-[8px] font-semibold text-[#657895]'>Administrador general</span>
        </span>
        <IconoMedico className='h-4 w-4 text-[#173b91]' nombre='chevronDown' />
      </Link>
    </header>
  )
}

export default HeaderAdminComp
