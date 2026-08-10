import { Link } from 'react-router-dom'
import IconoMedico from './IconoMedico'

export interface DatosHeaderActivacionCuenta {
  avatar: string
  especialidad: string
  modulo: string
  nombre: string
  notificaciones: number
  rutaRegreso: string
}

interface HeaderActivacionCuentaCompProps {
  datos: DatosHeaderActivacionCuenta
}

function HeaderActivacionCuentaComp({ datos }: HeaderActivacionCuentaCompProps) {
  return (
    <header className='sticky top-0 z-40 flex h-[52px] items-center justify-between border-b border-[#dce6ee] bg-white px-3 sm:px-5'>
      <div className='flex min-w-0 items-center gap-2'>
        <Link
          aria-label='Volver al listado de pacientes'
          className='grid h-9 w-9 shrink-0 place-items-center rounded-lg text-[#00a1ad] transition hover:bg-[#edf9fa] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#08aabb]'
          to={datos.rutaRegreso}
        >
          <IconoMedico className='h-5 w-5' nombre='arrowLeft' strokeWidth={1.9} />
        </Link>
        <span className='truncate text-[10px] font-bold text-[#078d9b] sm:text-[11px]'>{datos.modulo}</span>
      </div>

      <div className='flex shrink-0 items-center gap-1 sm:gap-2'>
        <button
          aria-label={`${datos.notificaciones} notificación pendiente`}
          className='relative grid h-9 w-9 cursor-pointer place-items-center rounded-lg text-[#27468c] transition hover:bg-[#f2fafb] focus-visible:outline-2 focus-visible:outline-[#08aabb]'
          type='button'
        >
          <IconoMedico className='h-5 w-5' nombre='bell' strokeWidth={1.8} />
          {datos.notificaciones > 0 && (
            <span className='absolute right-0.5 top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-[#ef4852] px-1 text-[8px] font-extrabold text-white'>
              {datos.notificaciones}
            </span>
          )}
        </button>

        <button
          aria-label='Abrir perfil de la doctora'
          className='flex cursor-pointer items-center gap-2 rounded-xl px-1.5 py-1 text-left transition hover:bg-[#f2fafb] focus-visible:outline-2 focus-visible:outline-[#08aabb]'
          type='button'
        >
          <span className='grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-full border-2 border-[#d8e5ed] bg-gradient-to-b from-[#f9d9c8] to-[#f4b89b] text-[22px] shadow-sm'>
            <span aria-hidden='true' className='translate-y-0.5'>{datos.avatar}</span>
          </span>
          <span className='hidden min-w-0 sm:block'>
            <strong className='block max-w-[150px] truncate text-[11px] font-extrabold leading-4 text-[#0b2b7a]'>
              {datos.nombre}
            </strong>
            <span className='block max-w-[150px] truncate text-[8px] font-medium leading-3 text-[#526a91]'>
              {datos.especialidad}
            </span>
          </span>
          <IconoMedico className='hidden h-4 w-4 text-[#173b91] sm:block' nombre='chevronDown' strokeWidth={2} />
        </button>
      </div>
    </header>
  )
}

export default HeaderActivacionCuentaComp
