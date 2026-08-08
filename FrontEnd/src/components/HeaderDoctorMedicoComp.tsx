import IconoMedico from './IconoMedico'

interface HeaderDoctorMedicoCompProps {
  especialidad: string
  nombre: string
  notificaciones?: number
}

function HeaderDoctorMedicoComp({ especialidad, nombre, notificaciones }: HeaderDoctorMedicoCompProps) {
  return (
    <header className='sticky top-0 z-30 flex h-[46px] items-center justify-end border-b border-[#dbe5ef] bg-white px-4 sm:px-5'>
      {notificaciones !== undefined && (
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
      )}

      <button
        aria-label='Abrir perfil de la doctora'
        className='flex cursor-pointer items-center gap-2 rounded-xl px-2 py-1 text-left transition hover:bg-[#f2fafb] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#08aebb]'
        type='button'
      >
        <span className='grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-full border-2 border-[#d8e5ed] bg-gradient-to-b from-[#f9d9c8] to-[#f4b89b] text-[22px] shadow-sm'>
          <span aria-hidden='true' className='translate-y-0.5'>👩🏻‍⚕️</span>
        </span>
        <span className='hidden min-w-0 sm:block'>
          <strong className='block truncate text-[12px] font-extrabold leading-4 text-[#0b2b7a]'>
            {nombre}
          </strong>
          <span className='block truncate text-[9px] font-medium leading-3 text-[#526a91]'>
            {especialidad}
          </span>
        </span>
        <IconoMedico className='h-4 w-4 text-[#173b91]' nombre='chevronDown' strokeWidth={2.2} />
      </button>
    </header>
  )
}

export default HeaderDoctorMedicoComp
