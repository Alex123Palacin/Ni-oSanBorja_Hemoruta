import IconoMedico from '../IconoMedico'

interface CabeceraVerificacionPacienteCompProps {
  imagenPaciente: string
  logo: string
  logoAlt: string
  subtitulo: string
  telefono: string
  titulo: string
}

function CabeceraVerificacionPacienteComp({
  imagenPaciente,
  logo,
  logoAlt,
  subtitulo,
  telefono,
  titulo,
}: CabeceraVerificacionPacienteCompProps) {
  return (
    <header className='relative h-[194px] shrink-0 overflow-hidden bg-white px-5 pt-1.5'>
      <div className='absolute -bottom-[92px] -left-12 -right-12 h-[232px] rounded-[50%] bg-[#eef8ff]' />

      <div className='relative z-30 flex items-start justify-between'>
        <img alt={logoAlt} className='h-auto w-[129px] object-contain' draggable={false} src={logo} />
        <button
          aria-label='Ver notificaciones'
          className='relative mt-0.5 grid h-10 w-10 cursor-pointer place-items-center rounded-full text-[#173b7e] transition hover:bg-white/70 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#08aabb]'
          type='button'
        >
          <IconoMedico className='h-[22px] w-[22px]' nombre='bell' strokeWidth={1.8} />
          <span className='absolute right-[7px] top-[3px] h-2.5 w-2.5 rounded-full border-2 border-white bg-[#f05251]' />
        </button>
      </div>

      <div className='absolute left-5 top-[84px] z-20 w-[136px] text-left'>
        <h1 className='whitespace-pre-line text-[22px] font-extrabold leading-[27px] tracking-[-0.025em] text-[#0a2b70]'>{titulo}</h1>
        <p className='mt-2 text-[11px] font-medium leading-[16px] text-[#60718f]'>{subtitulo}</p>
        <strong className='block text-[13px] font-extrabold leading-[17px] text-[#0a2b70]'>{telefono}</strong>
      </div>

      <span aria-hidden='true' className='absolute left-[47%] top-[92px] z-10 text-[10px] text-[#65aef2]'>✦</span>
      <span aria-hidden='true' className='absolute left-[45%] top-[129px] z-10 text-[9px] text-[#65aef2]'>✦</span>
      <span aria-hidden='true' className='absolute right-4 top-[64px] z-10 text-[11px] text-[#65aef2]'>✦</span>

      <div className='absolute -right-1 bottom-0 z-10 h-[154px] w-[157px] overflow-hidden'>
        <img
          alt='Niño de HemoRuta dando la bienvenida'
          className='absolute -left-5 -top-3 h-[190px] w-[190px] max-w-none scale-x-[-1] object-cover'
          draggable={false}
          src={imagenPaciente}
        />
      </div>
    </header>
  )
}

export default CabeceraVerificacionPacienteComp
