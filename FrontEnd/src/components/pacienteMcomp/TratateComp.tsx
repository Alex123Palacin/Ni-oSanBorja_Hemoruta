import { useId } from 'react'
import IconoMedico, { type NombreIconoMedico } from '../IconoMedico'

export type TipoItemTratamientoPaciente =
  | 'tratamiento-indicado'
  | 'medicacion-indicada'
  | 'indicaciones-casa'
  | 'examenes-solicitados'
  | 'proximo-control'

export interface LineaTratamientoPaciente {
  id: string
  texto: string
}

export interface ItemTratamientoPaciente {
  formato: 'lista' | 'texto'
  id: string
  lineas: readonly LineaTratamientoPaciente[]
  tipo: TipoItemTratamientoPaciente
  titulo: string
}

interface TratateCompProps {
  descripcion: string
  items: readonly ItemTratamientoPaciente[]
  titulo: string
}

interface ConfiguracionItemTratamiento {
  altura: string
  icono: NombreIconoMedico
}

const CONFIGURACION_ITEM: Record<TipoItemTratamientoPaciente, ConfiguracionItemTratamiento> = {
  'tratamiento-indicado': { altura: 'min-h-[58px]', icono: 'shield' },
  'medicacion-indicada': { altura: 'min-h-[95px]', icono: 'pill' },
  'indicaciones-casa': { altura: 'min-h-[70px]', icono: 'droplet' },
  'examenes-solicitados': { altura: 'min-h-[58px]', icono: 'flask' },
  'proximo-control': { altura: 'min-h-[58px]', icono: 'calendar' },
}

function TratateComp({ descripcion, items, titulo }: TratateCompProps) {
  const tituloId = useId()

  return (
    <section aria-labelledby={tituloId}>
      <header className='flex h-[56px] items-center px-1.5'>
        <span className='grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#e9f9fa] text-[#00a9b1]'>
          <IconoMedico className='h-[24px] w-[24px]' nombre='shield' strokeWidth={1.7} />
        </span>
        <div className='ml-2.5 min-w-0'>
          <h1 className='text-[15px] font-extrabold leading-[19px] tracking-[-0.02em] text-[#0a2b70]' id={tituloId}>
            {titulo}
          </h1>
          <p className='mt-0.5 text-[7.5px] font-medium leading-[11px] text-[#5b7091]'>{descripcion}</p>
        </div>
      </header>

      <ol className='mt-1 overflow-hidden rounded-[14px] border border-[#e1e8ef] bg-white shadow-[0_3px_12px_rgba(23,55,96,0.05)]'>
        {items.map((item, indice) => {
          const configuracion = CONFIGURACION_ITEM[item.tipo]

          return (
            <li
              className={`flex items-center px-2.5 py-2 ${configuracion.altura} ${indice < items.length - 1 ? 'border-b border-[#e7edf2]' : ''}`}
              key={item.id}
            >
              <span className='grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#edfafb] text-[#00a9b1]'>
                <IconoMedico className='h-[21px] w-[21px]' nombre={configuracion.icono} strokeWidth={1.65} />
              </span>

              <div className='ml-2.5 min-w-0 flex-1'>
                <h2 className='text-[9.5px] font-extrabold leading-[13px] text-[#00a0aa]'>{item.titulo}</h2>

                {item.formato === 'lista' ? (
                  <ul className='mt-1 space-y-0.5 pl-3 text-[7.8px] font-medium leading-[11px] text-[#203d70]'>
                    {item.lineas.map((linea) => (
                      <li className='relative before:absolute before:-left-2.5 before:top-[4px] before:h-1 before:w-1 before:rounded-full before:bg-[#02aeb2]' key={linea.id}>
                        {linea.texto}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className='mt-0.5 space-y-0.5'>
                    {item.lineas.map((linea) => (
                      <p className='text-[7.8px] font-medium leading-[11px] text-[#203d70]' key={linea.id}>
                        {linea.texto}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            </li>
          )
        })}
      </ol>
    </section>
  )
}

export default TratateComp
