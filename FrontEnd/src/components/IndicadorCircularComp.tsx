interface IndicadorCircularCompProps {
  color?: string
  detalle?: string
  etiqueta: string
  valor: number
}

function IndicadorCircularComp({
  color = '#079daf',
  detalle,
  etiqueta,
  valor,
}: IndicadorCircularCompProps) {
  const valorSeguro = Math.min(100, Math.max(0, valor))

  return (
    <div className='flex flex-col items-center text-center'>
      <div
        aria-label={`${etiqueta}: ${valorSeguro}%`}
        aria-valuemax={100}
        aria-valuemin={0}
        aria-valuenow={valorSeguro}
        className='relative h-[72px] w-[72px]'
        role='meter'
      >
        <svg aria-hidden='true' className='h-full w-full -rotate-90' viewBox='0 0 72 72'>
          <circle cx='36' cy='36' fill='none' r='28' stroke='#e5eef2' strokeWidth='6' />
          <circle
            cx='36'
            cy='36'
            fill='none'
            pathLength='100'
            r='28'
            stroke={color}
            strokeDasharray={`${valorSeguro} ${100 - valorSeguro}`}
            strokeLinecap='round'
            strokeWidth='6'
          />
        </svg>
        <strong className='absolute inset-0 grid place-items-center text-[16px] font-extrabold text-[#1689ab]'>
          {valorSeguro}%
        </strong>
      </div>
      <span className='mt-1 text-[8px] font-bold leading-[11px] text-[#435a83]'>{etiqueta}</span>
      {detalle && <span className='text-[8px] font-medium leading-[11px] text-[#687a98]'>{detalle}</span>}
    </div>
  )
}

export default IndicadorCircularComp
