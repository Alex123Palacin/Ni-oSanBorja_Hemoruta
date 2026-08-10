import type { ItemDatosFichaPaciente, SeccionDatosFichaPaciente } from '../types/FichaPaciente'
import IconoMedico from './IconoMedico'

interface ValorDatoProps {
  item: ItemDatosFichaPaciente
}

const ESTILOS_VALOR = {
  alerta: 'bg-[#fff0df] px-2.5 py-1 text-[#ed7912]',
  exito: 'bg-[#e1f7e7] px-2.5 py-1 text-[#15953b]',
  normal: 'text-[#173478]',
}

function ValorDato({ item }: ValorDatoProps) {
  return (
    <dd className='min-w-0 text-[9px] font-bold leading-[13px] text-[#173478]'>
      <span className={`inline-flex rounded-md ${ESTILOS_VALOR[item.tono ?? 'normal']}`}>{item.valor}</span>
      {item.secundario && (
        <span className='mt-0.5 block break-words font-medium text-[#537096]'>{item.secundario}</span>
      )}
    </dd>
  )
}

function ItemContacto({ item }: { item: ItemDatosFichaPaciente }) {
  return (
    <div className='grid grid-cols-[minmax(86px,.85fr)_minmax(112px,1.15fr)] gap-2'>
      <div className='min-w-0'>
        <dt className='text-[9px] font-extrabold leading-[13px] text-[#173478]'>{item.etiqueta}</dt>
        <ValorDato item={item} />
      </div>
      <dd className='space-y-1 pt-0.5'>
        {item.detalles?.map((detalle) => (
          <span
            className={`flex min-w-0 items-center gap-1.5 text-[8px] font-medium ${
              detalle.tono === 'azul' ? 'text-[#2978df]' : 'text-[#53698e]'
            }`}
            key={detalle.texto}
          >
            {detalle.icono && <IconoMedico className='h-3 w-3 shrink-0' nombre={detalle.icono} />}
            <span className='truncate'>{detalle.texto}</span>
          </span>
        ))}
      </dd>
    </div>
  )
}

interface DatosDocPacientCompProps {
  secciones: SeccionDatosFichaPaciente[]
}

function clasesBordeSeccion(indice: number) {
  if (indice === 0) return ''
  if (indice === 1) return 'border-t md:border-l md:border-t-0'
  if (indice === 2) return 'border-t xl:border-l xl:border-t-0'
  return 'border-t md:border-l xl:border-t-0'
}

function DatosDocPacientComp({ secciones }: DatosDocPacientCompProps) {
  return (
    <article className='overflow-hidden rounded-xl border border-[#dce5ee] bg-white shadow-[0_3px_10px_rgba(18,52,91,0.06)]'>
      <div className='grid md:grid-cols-2 xl:grid-cols-[.9fr_1.05fr_.9fr_1.2fr]'>
        {secciones.map((seccion, indice) => (
          <section
            className={`${clasesBordeSeccion(indice)} border-[#e1e8ef]`}
            key={seccion.titulo}
          >
            <h3
              className={`flex h-[38px] items-center justify-center gap-2 border-b px-3 text-[10px] font-extrabold ${
                indice === 0
                  ? 'border-[#08aabb] bg-[#f8fefe] text-[#078fa5]'
                  : 'border-[#e1e8ef] text-[#344d80]'
              }`}
            >
              <IconoMedico className='h-[17px] w-[17px]' nombre={seccion.icono} />
              {seccion.titulo}
            </h3>
            <dl className={`${seccion.distribucion === 'contacto' ? 'space-y-3' : 'space-y-2.5'} p-4`}>
              {seccion.items.map((item) =>
                seccion.distribucion === 'contacto' ? (
                  <ItemContacto item={item} key={`${seccion.titulo}-${item.etiqueta}`} />
                ) : (
                  <div
                    className='grid grid-cols-[112px_minmax(0,1fr)] gap-2'
                    key={`${seccion.titulo}-${item.etiqueta}`}
                  >
                    <dt className='text-[9px] font-semibold leading-[13px] text-[#53698e]'>{item.etiqueta}</dt>
                    <ValorDato item={item} />
                  </div>
                ),
              )}
            </dl>
          </section>
        ))}
      </div>
    </article>
  )
}

export default DatosDocPacientComp
