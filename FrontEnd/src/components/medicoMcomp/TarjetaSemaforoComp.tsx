import IconoMedico from '../IconoMedico'
import BotonSecundarioComp from './BotonSecundarioComp'

export interface SemaforoFichaPaciente {
  codigo: string
  descripcion: string
  titulo: string
}

interface TarjetaSemaforoCompProps {
  onVerDetalles?: () => void
  semaforo?: SemaforoFichaPaciente
}

const SEMAFORO_POR_DEFECTO: SemaforoFichaPaciente = {
  codigo: 'VERDE',
  descripcion: 'Buen control clínico. Continúa con el plan actual.',
  titulo: 'Estable',
}

const ESTILOS_SEMAFORO: Record<string, { aro: string; fondo: string; texto: string }> = {
  AMARILLO: {
    aro: 'border-[#ffe0a3]',
    fondo: 'bg-[#f5ad24]',
    texto: 'text-[#d68700]',
  },
  ROJO: {
    aro: 'border-[#ffc7c7]',
    fondo: 'bg-[#ef4d4d]',
    texto: 'text-[#d83232]',
  },
  SIN_DATOS: {
    aro: 'border-[#dce5ee]',
    fondo: 'bg-[#8ca0b8]',
    texto: 'text-[#60749a]',
  },
  VERDE: {
    aro: 'border-[#a7e8bd]',
    fondo: 'bg-[#20b956]',
    texto: 'text-[#15953b]',
  },
}

function TarjetaSemaforoComp({ onVerDetalles, semaforo = SEMAFORO_POR_DEFECTO }: TarjetaSemaforoCompProps) {
  const estilos = ESTILOS_SEMAFORO[semaforo.codigo] ?? ESTILOS_SEMAFORO.SIN_DATOS

  return (
    <article className='flex min-h-[166px] flex-col rounded-xl border border-[#dce5ee] bg-white p-4 shadow-[0_3px_10px_rgba(18,52,91,0.06)]'>
      <h2 className='text-[12px] font-extrabold text-[#078fa5]'>Semáforo actual</h2>
      <div className='mt-2 flex flex-1 items-center justify-between gap-4'>
        <div className='text-[9px] leading-[14px] text-[#4d6388]'>
          <strong className={`mb-3 flex items-center gap-2 text-[11px] ${estilos.texto}`}>
            <span aria-hidden='true' className={`h-3 w-3 rounded-full ${estilos.fondo}`} />
            {semaforo.titulo}
          </strong>
          {semaforo.descripcion}
        </div>
        <span
          aria-label={`Estado ${semaforo.titulo.toLowerCase()}`}
          className={`grid h-[74px] w-[74px] shrink-0 place-items-center rounded-full border-[9px] text-white shadow-inner ${estilos.aro} ${estilos.fondo}`}
          role='img'
        >
          <IconoMedico className='h-9 w-9' nombre='smile' strokeWidth={1.7} />
        </span>
      </div>
      <BotonSecundarioComp onClick={onVerDetalles}>Ver detalles</BotonSecundarioComp>
    </article>
  )
}

export default TarjetaSemaforoComp
