import IconoMedico from '../IconoMedico'

export interface DatosPerfilPacienteNino {
  edad: string
  estado: string
  historiaClinica: string
  imagen: string
  nombre: string
}

interface PerfilPacienteNinoCompProps {
  paciente: DatosPerfilPacienteNino
  tamano?: 'compacto' | 'normal'
}

function PerfilPacienteNiñoComp({ paciente, tamano = 'normal' }: PerfilPacienteNinoCompProps) {
  const esCompacto = tamano === 'compacto'

  return (
    <section
      className={`flex items-center rounded-[14px] border border-[#e1e8ef] bg-white shadow-[0_4px_13px_rgba(23,55,96,0.08)] ${
        esCompacto ? 'h-[82px] px-2.5' : 'h-[98px] px-2.5'
      }`}
    >
      <div className={`relative shrink-0 overflow-visible ${esCompacto ? 'h-[58px] w-[58px]' : 'h-[67px] w-[67px]'}`}>
        <div className='relative h-full w-full overflow-hidden rounded-full border-[3px] border-[#e1f4f5] bg-[#e6f7f5]'>
          <img
            alt={`Foto de ${paciente.nombre}`}
            className='absolute left-1/2 top-[-18%] h-[185%] w-[185%] max-w-none -translate-x-1/2 object-cover'
            draggable={false}
            src={paciente.imagen}
          />
        </div>
        <span
          className={`absolute -bottom-0.5 -right-0.5 grid place-items-center rounded-full border-2 border-white bg-[#02aeb2] text-white ${
            esCompacto ? 'h-[18px] w-[18px]' : 'h-5 w-5'
          }`}
        >
          <IconoMedico className='h-3 w-3' nombre='check' strokeWidth={2.4} />
        </span>
      </div>

      <div className={`min-w-0 flex-1 ${esCompacto ? 'ml-2.5' : 'ml-3'}`}>
        <strong className={`block truncate font-extrabold tracking-[-0.02em] text-[#0a2b70] ${esCompacto ? 'text-[13px]' : 'text-[13.5px]'}`}>
          {paciente.nombre}
        </strong>

        <dl className={`grid grid-cols-[0.72fr_1.15fr_0.88fr] divide-x divide-[#e3e9f0] ${esCompacto ? 'mt-1.5' : 'mt-2'}`}>
          <div className='flex min-w-0 flex-col items-center px-1 text-center'>
            <IconoMedico className={`${esCompacto ? 'h-[13px] w-[13px]' : 'h-[15px] w-[15px]'} text-[#617797]`} nombre='user' strokeWidth={1.6} />
            <dd className='mt-0.5 truncate text-[7px] font-medium text-[#53698d]'>{paciente.edad}</dd>
          </div>
          <div className='flex min-w-0 flex-col items-center px-1 text-center'>
            <IconoMedico className={`${esCompacto ? 'h-[13px] w-[13px]' : 'h-[15px] w-[15px]'} text-[#617797]`} nombre='clipboard' strokeWidth={1.6} />
            <dd className='mt-0.5 truncate text-[6.7px] font-medium text-[#53698d]'>{paciente.historiaClinica}</dd>
          </div>
          <div className='flex min-w-0 flex-col items-center px-1 text-center'>
            <dd className={`inline-flex items-center gap-1 rounded-full bg-[#e7f8e9] font-bold text-[#22973e] ${esCompacto ? 'px-2 py-0.5 text-[6.8px]' : 'px-2 py-1 text-[7px]'}`}>
              <span className='h-1.5 w-1.5 rounded-full bg-[#27b54b]' />
              {paciente.estado}
            </dd>
            <dt className='mt-0.5 text-[6.5px] font-medium text-[#53698d]'>Estado</dt>
          </div>
        </dl>
      </div>
    </section>
  )
}

export default PerfilPacienteNiñoComp
