import useRedirrecion from '../hooks/Redirrecion'

type BtnCrearProps = {
  ruta: string
  tamano?: 'compacto' | 'normal'
  texto: string
}

function BtnCrear({ ruta, tamano = 'normal', texto }: BtnCrearProps) {
  const redirigir = useRedirrecion()
  const esCompacto = tamano === 'compacto'

  return (
    <button
      className={`flex max-w-full cursor-pointer items-center justify-center border border-[#078a96] bg-gradient-to-b from-[#078e99] to-[#05aab6] font-bold text-white shadow-[0_5px_12px_rgba(5,111,124,0.22)] transition hover:-translate-y-0.5 hover:brightness-105 hover:shadow-[0_8px_18px_rgba(5,111,124,0.28)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#078e99] active:translate-y-0 ${
        esCompacto
          ? 'h-11 w-[180px] gap-2 rounded-lg px-4 text-[12px]'
          : 'h-16 w-[360px] gap-3 rounded-xl px-6 text-lg sm:text-xl'
      }`}
      onClick={() => redirigir(ruta)}
      type='button'
    >
      <svg
        aria-hidden='true'
        className={`${esCompacto ? 'h-5 w-5' : 'h-8 w-8'} shrink-0`}
        fill='none'
        viewBox='0 0 32 32'
      >
        <circle cx='12.5' cy='8' r='4.5' stroke='currentColor' strokeWidth='2' />
        <path
          d='M4.5 27c0-4.7 3.6-8 8-8s8 3.3 8 8h-16ZM25 10v8m-4-4h8'
          stroke='currentColor'
          strokeLinecap='round'
          strokeLinejoin='round'
          strokeWidth='2'
        />
      </svg>
      <span>{texto}</span>
    </button>
  )
}

export { BtnCrear }
export default BtnCrear
