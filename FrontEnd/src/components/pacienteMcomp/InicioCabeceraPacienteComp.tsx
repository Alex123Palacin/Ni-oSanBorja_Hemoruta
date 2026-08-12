import IconoMedico from '../IconoMedico'
import AvatarUsuarioComp from '../AvatarUsuarioComp'

interface InicioCabeceraPacienteCompProps {
  descripcion?: string
  fotoCuenta?: string
  imagenPaciente?: string
  logo: string
  nombre?: string
  notificaciones?: number
}

function InicioCabeceraPacienteComp({
  descripcion,
  fotoCuenta,
  imagenPaciente,
  logo,
  nombre,
  notificaciones = 2,
}: InicioCabeceraPacienteCompProps) {
  const muestraBienvenida = Boolean(nombre && descripcion && imagenPaciente)

  return (
    <header
      className={`relative shrink-0 overflow-hidden bg-white ${
        muestraBienvenida ? 'h-[112px]' : 'h-[39px]'
      }`}
    >
      <img
        alt='HemoRuta Pediátrica'
        className={`absolute object-contain ${
          muestraBienvenida ? 'left-1/2 top-0.5 w-[105px] -translate-x-1/2' : 'left-1/2 top-0 w-[91px] -translate-x-1/2'
        }`}
        draggable={false}
        src={logo}
      />

      {fotoCuenta && (
        <AvatarUsuarioComp clase='absolute left-2 top-1 h-8 w-8 text-[8px]' foto={fotoCuenta} nombre={nombre} />
      )}

      <button
        aria-label={`Notificaciones: ${notificaciones} pendientes`}
        className='absolute right-2 top-1 grid h-9 w-9 place-items-center rounded-full text-[#173a78] transition hover:bg-[#eef8fb] focus-visible:outline-2 focus-visible:outline-[#00aab1]'
        type='button'
      >
        <IconoMedico className='h-[19px] w-[19px]' nombre='bell' strokeWidth={1.8} />
        {notificaciones > 0 && (
          <span className='absolute right-[5px] top-[3px] grid h-3.5 min-w-3.5 place-items-center rounded-full bg-[#ff4e58] px-0.5 text-[7px] font-extrabold text-white'>
            {notificaciones}
          </span>
        )}
      </button>

      {muestraBienvenida && (
        <>
          <div className='absolute bottom-3 left-2.5 z-10 max-w-[58%]'>
            <h1 className='text-[19px] font-extrabold leading-tight tracking-[-0.03em] text-[#0a2b70]'>
              Hola, {nombre} <span aria-hidden='true'>👋</span>
            </h1>
            <p className='mt-1 text-[9.5px] font-medium leading-[14px] text-[#5d7192]'>
              {descripcion} <span aria-hidden='true' className='text-[#08aeb4]'>♥</span>
            </p>
          </div>

          <div aria-hidden='true' className='absolute bottom-0 right-0 h-[78px] w-[144px] overflow-hidden'>
            <img
              alt=''
              className='absolute -right-[12px] -top-[25px] h-[158px] w-[158px] max-w-none scale-x-[-1] object-cover'
              draggable={false}
              src={imagenPaciente}
            />
          </div>
        </>
      )}
    </header>
  )
}

export default InicioCabeceraPacienteComp
