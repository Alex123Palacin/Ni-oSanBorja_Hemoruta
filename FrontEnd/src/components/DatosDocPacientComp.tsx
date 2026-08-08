import type { ItemDatosFichaPaciente, SeccionDatosFichaPaciente } from '../types/FichaPaciente'
import IconoMedico from './IconoMedico'

interface ValorDatoProps {
  item: ItemDatosFichaPaciente
}

const ESTILOS_VALOR = {
  alerta: 'bg-[#fff0df] px-2 py-1 text-[#ed7912]',
  exito: 'bg-[#e1f7e7] px-2 py-1 text-[#15953b]',
  normal: 'text-[#173478]',
}

function ValorDato({ item }: ValorDatoProps) {
  return (
    <dd className='min-w-0 text-[8px] font-bold leading-[12px] text-[#173478]'>
      <span className={`inline-flex rounded-md ${ESTILOS_VALOR[item.tono ?? 'normal']}`}>{item.valor}</span>
      {item.secundario && <span className='mt-0.5 block break-words font-medium text-[#537096]'>{item.secundario}</span>}
    </dd>
  )
}

interface DatosDocPacientCompProps {
  secciones: SeccionDatosFichaPaciente[]
}

function DatosDocPacientComp({ secciones }: DatosDocPacientCompProps) {
  return (
    <article className='overflow-hidden rounded-xl border border-[#dce5ee] bg-white shadow-[0_2px_8px_rgba(18,52,91,0.05)]'>
      <div className='grid md:grid-cols-2 lg:grid-cols-4'>
        {secciones.map((seccion, indice) => (
          <section
            className={`${indice > 0 ? 'border-t lg:border-l lg:border-t-0' : ''} border-[#e1e8ef]`}
            key={seccion.titulo}
          >
            <h3
              className={`flex h-9 items-center justify-center gap-2 border-b px-3 text-[9px] font-extrabold ${
                indice === 0
                  ? 'border-[#08aabb] bg-[#f8fefe] text-[#078fa5]'
                  : 'border-[#e1e8ef] text-[#344d80]'
              }`}
            >
              <IconoMedico className='h-4 w-4' nombre={seccion.icono} />
              {seccion.titulo}
            </h3>
            <dl className='space-y-2 p-4'>
              {seccion.items.map((item) => (
                <div className='grid grid-cols-[96px_minmax(0,1fr)] gap-2' key={`${seccion.titulo}-${item.etiqueta}`}>
                  <dt className='text-[8px] font-semibold leading-[12px] text-[#53698e]'>{item.etiqueta}</dt>
                  <ValorDato item={item} />
                </div>
              ))}
            </dl>
          </section>
        ))}
      </div>
    </article>
  )
}

export default DatosDocPacientComp
