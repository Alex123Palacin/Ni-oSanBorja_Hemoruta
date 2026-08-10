import { useId } from 'react'

import IconoMedico, { type NombreIconoMedico } from './IconoMedico'

export type TipoSeccionResumenEstructurado =
  | 'evolucion'
  | 'indicaciones'
  | 'medicacion'
  | 'motivo'
  | 'proximo-control'
  | 'tratamiento'

export interface LineaResumenEstructurado {
  id: string
  texto: string
}

export interface SeccionResumenEstructurado {
  formato: 'lista' | 'texto'
  id: string
  lineas: readonly LineaResumenEstructurado[]
  tipo: TipoSeccionResumenEstructurado
  titulo: string
}

export interface ContenidoResumenEstructurado {
  distintivo: string
  subtitulo: string
  titulo: string
}

interface ResumenEstructuraCompProps {
  contenido: ContenidoResumenEstructurado
  secciones: readonly SeccionResumenEstructurado[]
}

const ICONOS_SECCION: Record<TipoSeccionResumenEstructurado, NombreIconoMedico> = {
  evolucion: 'chart',
  indicaciones: 'home',
  medicacion: 'pill',
  motivo: 'stethoscope',
  'proximo-control': 'calendar',
  tratamiento: 'clipboard',
}

function ResumenEstructuraComp({ contenido, secciones }: ResumenEstructuraCompProps) {
  const tituloId = useId()

  return (
    <section
      aria-labelledby={tituloId}
      className='flex h-full min-h-[350px] flex-col rounded-xl border border-[#dce5ee] bg-white p-3 shadow-[0_2px_8px_rgba(18,52,91,0.04)]'
    >
      <header className='flex flex-wrap items-start justify-between gap-2'>
        <div className='min-w-0 flex-1'>
          <h2 className='break-words text-[12px] font-extrabold text-[#0a2b70]' id={tituloId}>{contenido.titulo}</h2>
          <p className='mt-0.5 break-words text-[8px] font-medium text-[#52698e]'>{contenido.subtitulo}</p>
        </div>
        <span className='inline-flex items-center gap-1.5 rounded-lg bg-[#e8f3ff] px-3 py-1.5 text-[8px] font-extrabold text-[#2878de]'>
          <IconoMedico className='h-3.5 w-3.5' nombre='sparkles' strokeWidth={1.8} />
          {contenido.distintivo}
        </span>
      </header>

      <ul className='mt-2 flex-1 overflow-x-hidden rounded-xl border border-[#e1e8ef] bg-white'>
        {secciones.map((seccion, indice) => (
          <li
            className={`grid grid-cols-[34px_minmax(0,1fr)] gap-2 px-2.5 py-1.5 ${indice < secciones.length - 1 ? 'border-b border-[#e7edf2]' : ''}`}
            key={seccion.id}
          >
            <span className='grid h-[30px] w-[30px] place-items-center rounded-full bg-[#eaf8fa] text-[#08a8b7]'>
              <IconoMedico className='h-[18px] w-[18px]' nombre={ICONOS_SECCION[seccion.tipo]} strokeWidth={1.7} />
            </span>
            <div className='min-w-0'>
              <h3 className='text-[10px] font-extrabold leading-[13px] text-[#173879]'>{seccion.titulo}</h3>
              {seccion.formato === 'lista' ? (
                <ul className='mt-0.5 space-y-0.5 break-words pl-3 text-[8px] font-medium leading-[11px] text-[#314d7f]'>
                  {seccion.lineas.map((linea) => (
                    <li className='relative before:absolute before:-left-2.5 before:top-[4px] before:h-1 before:w-1 before:rounded-full before:bg-[#08aeb7]' key={linea.id}>
                      {linea.texto}
                    </li>
                  ))}
                </ul>
              ) : (
                <div className='mt-0.5 space-y-0.5 break-words'>
                  {seccion.lineas.map((linea) => (
                    <p className='text-[8px] font-medium leading-[11px] text-[#314d7f]' key={linea.id}>{linea.texto}</p>
                  ))}
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default ResumenEstructuraComp
