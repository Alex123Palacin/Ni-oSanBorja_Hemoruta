import IconoMedico, { type NombreIconoMedico } from './IconoMedico'

export type TonoCartilla = 'azul' | 'morado' | 'naranja' | 'turquesa'

export interface CartillaInformacionCompProps {
  accion: string
  descripcion: string
  icono: NombreIconoMedico
  onAccion?: () => void
  titulo: string
  tono: TonoCartilla
  valor: number | string
}

const ESTILOS_TONO: Record<TonoCartilla, { fondo: string; texto: string }> = {
  azul: { fondo: 'bg-[#e4f5fc]', texto: 'text-[#118fc6]' },
  morado: { fondo: 'bg-[#f0eaff]', texto: 'text-[#7450df]' },
  naranja: { fondo: 'bg-[#fff1df]', texto: 'text-[#f28a13]' },
  turquesa: { fondo: 'bg-[#e2f7f5]', texto: 'text-[#079f9d]' },
}

function CartillaInformacionComp({
  accion,
  descripcion,
  icono,
  onAccion,
  titulo,
  tono,
  valor,
}: CartillaInformacionCompProps) {
  const estilo = ESTILOS_TONO[tono]

  return (
    <article className='flex min-h-[100px] min-w-0 flex-col rounded-xl border border-[#dce5ee] bg-white px-3.5 py-3 shadow-[0_2px_8px_rgba(18,52,91,0.045)]'>
      <div className='flex min-w-0 items-center gap-3'>
        <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-full ${estilo.fondo} ${estilo.texto}`}>
          <IconoMedico className='h-6 w-6' nombre={icono} strokeWidth={1.75} />
        </span>
        <div className='min-w-0'>
          <strong className='block text-[20px] font-extrabold leading-5 text-[#092b79]'>{valor}</strong>
          <h2 className='mt-0.5 truncate text-[9px] font-extrabold leading-[11px] text-[#173777]'>{titulo}</h2>
          <p className='mt-0.5 text-[8px] font-medium leading-[11px] text-[#586d91]'>{descripcion}</p>
        </div>
      </div>

      <button
        aria-label={`${accion}: ${titulo}`}
        className='mt-auto flex cursor-pointer items-center justify-between pt-2 text-[9px] font-bold text-[#36528a] transition hover:text-[#079daf] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#08aabb] disabled:cursor-default disabled:text-[#36528a]'
        disabled={!onAccion}
        onClick={onAccion}
        type='button'
      >
        {accion}
        <IconoMedico className='h-4 w-4' nombre='arrowRight' strokeWidth={2.2} />
      </button>
    </article>
  )
}

export default CartillaInformacionComp
