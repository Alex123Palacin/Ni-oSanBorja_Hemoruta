import IconoMedico from '../IconoMedico'
import type { PerfilInicioPaciente } from '../../types/InicioPaciente'

interface InicioPerfilPacienteCompProps {
  compacto?: boolean
  onAbrir?: () => void
  paciente: PerfilInicioPaciente
}

function InicioPerfilPacienteComp({ compacto = false, onAbrir, paciente }: InicioPerfilPacienteCompProps) {
  const Contenedor = onAbrir ? 'button' : 'section'

  return (
    <Contenedor
      {...(onAbrir ? { onClick: onAbrir, type: 'button' as const } : {})}
      className={`flex w-full items-center rounded-[14px] border border-[#e1e8ef] bg-white px-2.5 text-left shadow-[0_4px_13px_rgba(23,55,96,0.08)] ${
        compacto ? 'h-[58px]' : 'h-[66px]'
      } ${onAbrir ? 'transition hover:border-[#8ddde0] focus-visible:outline-2 focus-visible:outline-[#00aab1]' : ''}`}
    >
      <div className={`relative shrink-0 ${compacto ? 'h-11 w-11' : 'h-[49px] w-[49px]'}`}>
        <div className='relative h-full w-full overflow-hidden rounded-full border-2 border-[#dff3f4] bg-[#eaf8f8]'>
          <img
            alt={`Foto de ${paciente.nombre}`}
            className='absolute left-1/2 top-[-18%] h-[185%] w-[185%] max-w-none -translate-x-1/2 object-cover'
            draggable={false}
            src={paciente.imagen}
          />
        </div>
        <span className='absolute -bottom-0.5 -right-0.5 grid h-4 w-4 place-items-center rounded-full border-2 border-white bg-[#02aeb2] text-white'>
          <IconoMedico className='h-2.5 w-2.5' nombre='check' strokeWidth={2.5} />
        </span>
      </div>

      <div className='ml-2.5 min-w-0 flex-1'>
        <strong className='block truncate text-[11px] font-extrabold tracking-[-0.02em] text-[#0a2b70]'>
          {paciente.nombre}
        </strong>
        <div className='mt-1.5 flex items-center gap-3 text-[7.5px] font-medium text-[#607493]'>
          <span className='inline-flex items-center gap-1'>
            <IconoMedico className='h-3 w-3' nombre='user' strokeWidth={1.65} />
            {paciente.edad}
          </span>
        </div>
      </div>

      <span className='ml-2 inline-flex shrink-0 items-center gap-1 rounded-full bg-[#e8f8e9] px-2 py-1 text-[7px] font-extrabold text-[#269b3f]'>
        <span className='h-1.5 w-1.5 rounded-full bg-[#27b64c]' />
        {paciente.estado}
      </span>

      {onAbrir && <IconoMedico className='ml-1.5 h-4 w-4 shrink-0 text-[#526b90]' nombre='arrowRight' strokeWidth={1.7} />}
    </Contenedor>
  )
}

export default InicioPerfilPacienteComp
