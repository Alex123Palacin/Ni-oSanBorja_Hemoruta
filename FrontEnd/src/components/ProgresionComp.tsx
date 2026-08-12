import { Fragment } from 'react'

import type { PasoActivacion } from '../types/NuevoPaciente'
import IconoMedico from './IconoMedico'

interface ProgresionCompProps {
  paso: PasoActivacion
}

function ProgresionComp({ paso }: ProgresionCompProps) {
  const pasos = [
    { numero: 1, titulo: 'Datos básicos' },
    { numero: 2, titulo: 'Credenciales de acceso' },
    { numero: 3, titulo: 'Registro completado' },
  ] as const

  return (
    <div className='overflow-x-auto rounded-xl border border-[#d9e4ef] bg-white px-4 py-3 shadow-[0_1px_3px_rgba(19,53,93,0.04)]'>
      <ol className='grid min-w-[650px] grid-cols-[auto_1fr_auto_1fr_auto] items-center'>
        {pasos.map((item, indice) => {
          const completado = paso > item.numero || paso === 3
          const activo = paso === item.numero
          const habilitado = completado || activo
          const estado = completado ? 'Completado' : activo ? 'En progreso' : 'Pendiente'

          return (
            <Fragment key={item.numero}>
              <li className='relative flex items-center gap-2.5'>
                <span
                  className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-[12px] font-extrabold ${
                    habilitado
                      ? 'bg-gradient-to-br from-[#09aabc] to-[#047f9e] text-white'
                      : 'bg-[#eef3fa] text-[#193879]'
                  }`}
                >
                  {paso === 2 && item.numero === 1 ? (
                    <IconoMedico className='h-4 w-4' nombre='check' strokeWidth={2.8} />
                  ) : (
                    item.numero
                  )}
                </span>
                <span className='min-w-[92px]'>
                  <strong className='block whitespace-nowrap text-[10px] font-extrabold leading-3 text-[#173378]'>
                    {item.titulo}
                  </strong>
                  <span
                    className={`mt-0.5 block text-[9px] font-semibold ${
                      completado ? 'text-[#09a84c]' : activo ? 'text-[#1684aa]' : 'text-[#53698d]'
                    }`}
                  >
                    {estado}
                  </span>
                </span>
              </li>

              {indice < pasos.length - 1 && (
                <li aria-hidden='true' className='mx-4 h-[2px] overflow-hidden rounded-full bg-[#dbe5ef]'>
                  <span
                    className='block h-full rounded-full bg-[#08a9bd] transition-[width] duration-300'
                    style={{
                      width: paso > item.numero ? '100%' : paso === item.numero && item.numero === 1 ? '55%' : '0%',
                    }}
                  />
                </li>
              )}
            </Fragment>
          )
        })}
      </ol>
    </div>
  )
}

export default ProgresionComp
