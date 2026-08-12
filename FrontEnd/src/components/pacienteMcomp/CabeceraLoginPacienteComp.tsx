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
    <header className='relative h-[clamp(190px,62.6vw,231px)] shrink-0 overflow-hidden bg-white'>
      <div className='absolute inset-x-0 top-0 z-20 flex items-start justify-between px-5 pt-[clamp(8px,2.7vw,10px)]'>
        <img
          alt='HemoRuta Pediátrica'
          className='h-auto w-[clamp(144px,47.7vw,176px)] object-contain'
          draggable={false}
          src={logo}
        />
        <button
          aria-label='Ver notificaciones'
          className='relative -mr-2 grid h-11 w-11 cursor-pointer place-items-center rounded-full text-[#0b3477] transition hover:bg-[#eff9fa] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#08aabb]'
          type='button'
        >
          <IconoMedico className='h-[27px] w-[27px]' nombre='bell' strokeWidth={1.7} />
          <span
            aria-hidden='true'
            className='absolute right-[7px] top-[4px] h-3 w-3 rounded-full border-2 border-white bg-[#ff5c55]'
          />
        </button>
      </div>

      <div className='absolute left-[clamp(20px,6.5vw,24px)] top-[52%] z-20 w-[clamp(150px,46vw,176px)]'>
        <h1 className='whitespace-nowrap text-[clamp(21px,6.5vw,24px)] font-extrabold leading-[1.08] text-[#082767]'>
          {titulo}
        </h1>
        <p className='mt-2 text-[clamp(13px,4.34vw,16px)] font-medium leading-[1.45] text-[#65738e]'>
          {subtitulo}
          <span aria-hidden='true' className='ml-2 text-[0.8em] text-[#05aaad]'>♥</span>
        </p>
      </div>

      <span aria-hidden='true' className='absolute right-[3%] top-[50%] z-10 text-[11px] text-[#62aef2]'>✦</span>

      <div className='absolute bottom-0 right-0 top-[clamp(45px,14.9vw,55px)] w-[clamp(190px,61vw,225px)] overflow-hidden'>
        <img
          alt='Niño de HemoRuta dando la bienvenida'
          className='absolute -right-[30px] -top-[22px] h-auto w-[clamp(230px,75.9vw,280px)] max-w-none scale-x-[-1]'
          draggable={false}
          src={imagenPaciente}
        />
      </div>
    </header>
  )
}

export default CabeceraLoginPacienteComp
