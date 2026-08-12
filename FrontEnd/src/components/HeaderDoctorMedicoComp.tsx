import { Link } from 'react-router-dom'

import useAuth from '../auth/useAuth'
import AvatarUsuarioComp from './AvatarUsuarioComp'
import IconoMedico from './IconoMedico'

interface HeaderDoctorMedicoCompProps {
  especialidad: string
  nombre: string
  notificaciones?: number
  variante?: 'amplia' | 'detalleSeguimiento' | 'normal' | 'seguimiento'
}

function HeaderDoctorMedicoComp({
  especialidad,
  nombre,
  notificaciones,
  variante = 'normal',
}: HeaderDoctorMedicoCompProps) {
  const { usuario } = useAuth()
  const esSesionMedica = usuario?.rol === 'MEDICO'
  const nombreMostrado = esSesionMedica
    ? usuario.nombreCompleto || [usuario.nombre, usuario.apellidos].filter(Boolean).join(' ')
    : nombre
  const especialidadMostrada = esSesionMedica
    ? usuario.especialidad || especialidad
    : especialidad
  const esAmplia = variante === 'amplia'
  const esDetalleSeguimiento = variante === 'detalleSeguimiento'
  const esSeguimiento = variante === 'seguimiento' || esDetalleSeguimiento

  return (
    <header
      className={`sticky top-0 z-30 flex items-center justify-end border-b border-[#dbe5ef] bg-white px-4 sm:px-5 ${
        esAmplia
          ? 'h-[clamp(46px,4.1vw,54px)]'
          : esDetalleSeguimiento
            ? 'h-[52px]'
            : esSeguimiento
              ? 'h-12'
              : 'h-[46px]'
      }`}
    >
      {notificaciones !== undefined && (
        <>
          <button
            aria-label={`${notificaciones} notificaciones pendientes`}
            className='relative mr-2 grid h-9 w-9 cursor-pointer place-items-center rounded-lg text-[#28478c] transition hover:bg-[#f2fafb] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#08aebb]'
            type='button'
          >
            <IconoMedico className='h-5 w-5' nombre='bell' strokeWidth={1.9} />
            {notificaciones > 0 && (
              <span className='absolute right-0.5 top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-[#ed3f4d] px-1 text-[8px] font-extrabold text-white'>
                {notificaciones}
              </span>
            )}
          </button>
          {esSeguimiento && <span aria-hidden='true' className='mr-2 h-7 w-px bg-[#dbe5ef]' />}
        </>
      )}

      <Link
        aria-label={`Abrir perfil de ${nombreMostrado}`}
        className='flex cursor-pointer items-center gap-2 rounded-xl px-2 py-1 text-left transition hover:bg-[#f2fafb] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#08aebb]'
        to='/doctor/inicio'
      >
        <AvatarUsuarioComp
          clase={esAmplia ? 'h-[42px] w-[42px] text-[12px]' : esSeguimiento ? 'h-10 w-10 text-[11px]' : 'h-9 w-9 text-[10px]'}
          foto={esSesionMedica ? usuario.fotoPerfil : undefined}
          nombre={nombreMostrado}
        />
        <span className='hidden min-w-0 sm:block'>
          <strong className={`${esAmplia ? 'text-[13px]' : 'text-[12px]'} block truncate font-extrabold leading-4 text-[#0b2b7a]`}>
            {nombreMostrado}
          </strong>
          <span className={`${esAmplia ? 'text-[10px]' : 'text-[9px]'} block truncate font-medium leading-3 text-[#526a91]`}>
            {especialidadMostrada}
          </span>
        </span>
        <IconoMedico className='h-4 w-4 text-[#173b91]' nombre='chevronDown' strokeWidth={2.2} />
      </Link>
    </header>
  )
}

export default HeaderDoctorMedicoComp
