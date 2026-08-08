interface CabeceraRecuperacionPacienteCompProps {
  ilustracionAlt: string
  imagenPaciente: string
  logo: string
  logoAlt: string
}

function CabeceraRecuperacionPacienteComp({
  ilustracionAlt,
  imagenPaciente,
  logo,
  logoAlt,
}: CabeceraRecuperacionPacienteCompProps) {
  return (
    <header className='flex w-full shrink-0 flex-col items-center bg-white pt-3'>
      <img alt={logoAlt} className='h-auto w-[136px] object-contain' draggable={false} src={logo} />

      <div
        aria-label={ilustracionAlt}
        className='relative mt-1 h-[176px] w-full max-w-[286px] overflow-hidden'
        role='img'
      >
        <div className='absolute bottom-0 left-2 right-2 h-[133px] rounded-[52%_48%_0_0/62%_62%_0_0] bg-[#eef8ff]' />

        <img
          alt=''
          aria-hidden='true'
          className='absolute left-[14px] top-[-8px] h-[210px] w-[210px] max-w-none object-cover'
          draggable={false}
          src={imagenPaciente}
        />

        <svg
          aria-hidden='true'
          className='absolute bottom-[-2px] right-[11px] h-[96px] w-[92px] drop-shadow-[0_5px_8px_rgba(8,124,145,0.18)]'
          fill='none'
          viewBox='0 0 96 108'
        >
          <defs>
            <linearGradient id='escudo-recuperacion' x1='16' x2='80' y1='11' y2='94' gradientUnits='userSpaceOnUse'>
              <stop stopColor='#1bc4bb' />
              <stop offset='1' stopColor='#009aa8' />
            </linearGradient>
          </defs>
          <path
            d='M48 4 89 19v29c0 27-16 47-41 57C23 95 7 75 7 48V19L48 4Z'
            fill='white'
            stroke='#d9f3f5'
            strokeWidth='6'
          />
          <path d='M48 12 81 24v24c0 22-12 38-33 48-21-10-33-26-33-48V24l33-12Z' fill='url(#escudo-recuperacion)' />
          <rect x='34' y='45' width='28' height='27' rx='5' fill='white' />
          <path d='M40 45v-6a8 8 0 0 1 16 0v6M48 55v8' stroke='#0babaf' strokeLinecap='round' strokeWidth='4' />
        </svg>

        <span aria-hidden='true' className='absolute left-2 top-[55px] text-[13px] text-[#43c7c0]'>•</span>
        <span aria-hidden='true' className='absolute right-[47px] top-[27px] text-[14px] text-[#65aef2]'>✦</span>
        <span aria-hidden='true' className='absolute right-[14px] top-[55px] text-[15px] text-[#ff654f]'>✦</span>
      </div>
    </header>
  )
}

export default CabeceraRecuperacionPacienteComp
