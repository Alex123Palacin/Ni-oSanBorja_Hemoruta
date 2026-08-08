import IconoMedico from '../IconoMedico'

interface CabeceraLoginPacienteCompProps {
  imagenPaciente: string
  logo: string
  subtitulo: string
  titulo: string
}

function CabeceraLoginPacienteComp({
  imagenPaciente,
  logo,
  subtitulo,
  titulo,
}: CabeceraLoginPacienteCompProps) {
  return (
    <header className='relative h-[190px] shrink-0 overflow-hidden bg-white px-5 pt-3'>
      <div className='relative z-20 flex items-start justify-between'>
        <img
          alt='HemoRuta Pediátrica'
          className='h-auto w-[136px] object-contain'
          draggable={false}
          src={logo}
        />
        <button
          aria-label='Ver notificaciones'
          className='relative mt-1 grid h-10 w-10 cursor-pointer place-items-center rounded-full text-[#163a7e] transition hover:bg-[#eff9fa] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#08aabb]'
          type='button'
        >
          <IconoMedico className='h-6 w-6' nombre='bell' strokeWidth={1.8} />
          <span className='absolute right-2 top-1.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-[#f05251]' />
        </button>
      </div>

      <div className='relative z-20 mt-9 w-[130px]'>
        <h1 className='text-[21px] font-extrabold leading-6 tracking-[-0.03em] text-[#0a2b70]'>{titulo}</h1>
        <p className='mt-2 text-[13px] font-medium leading-[18px] text-[#5d6e8d]'>
          {subtitulo}
          <span aria-hidden='true' className='ml-2 text-[#05aeb0]'>♥</span>
        </p>
      </div>

      <span aria-hidden='true' className='absolute left-[50%] top-[82px] z-10 text-[12px] text-[#56aaf0]'>✦</span>
      <span aria-hidden='true' className='absolute left-[45%] top-[128px] z-10 text-[9px] text-[#56aaf0]'>✦</span>
      <span aria-hidden='true' className='absolute right-3 top-[98px] z-10 text-[10px] text-[#56aaf0]'>✦</span>

      <div className='absolute -right-5 bottom-0 h-[145px] w-[190px] overflow-hidden'>
        <img
          alt='Niño de HemoRuta dando la bienvenida'
          className='absolute -left-1 top-[-20px] h-[195px] w-[195px] max-w-none scale-x-[-1] object-cover'
          draggable={false}
          src={imagenPaciente}
        />
      </div>
    </header>
  )
}

export default CabeceraLoginPacienteComp
