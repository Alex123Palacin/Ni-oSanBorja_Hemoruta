import type { Paciente } from '../../types/GestionarPacientes'
import { formatearEdadPaciente } from '../../utils/paciente'
import IconoMedico from '../IconoMedico'
import EstadoBadgeComp from './EstadoBadgeComp'

interface TablaPacientesCompProps {
  columnas: readonly string[]
  onCambiarPagina: (pagina: number) => void
  onVerFicha: (paciente: Paciente) => void
  paginaActual: number
  pacientes: readonly Paciente[]
  paginasTotales: number
  tamanoPagina: number
  totalPacientes: number
}

type ElementoPaginacion = number | `separador-${number}-${number}`

function crearPaginasVisibles(paginaActual: number, paginasTotales: number): ElementoPaginacion[] {
  if (paginasTotales <= 5) {
    return Array.from({ length: paginasTotales }, (_, indice) => indice + 1)
  }

  const paginas = [...new Set([1, paginaActual - 1, paginaActual, paginaActual + 1, paginasTotales])]
    .filter((pagina) => pagina >= 1 && pagina <= paginasTotales)
    .sort((a, b) => a - b)

  return paginas.flatMap((pagina, indice) => {
    const anterior = paginas[indice - 1]
    return anterior && pagina - anterior > 1
      ? [`separador-${anterior}-${pagina}` as const, pagina]
      : [pagina]
  })
}

function TablaPacientesComp({
  columnas,
  onCambiarPagina,
  onVerFicha,
  paginaActual,
  pacientes,
  paginasTotales,
  tamanoPagina,
  totalPacientes,
}: TablaPacientesCompProps) {
  const paginasVisibles = crearPaginasVisibles(paginaActual, paginasTotales)
  const primerPaciente = totalPacientes === 0 ? 0 : (paginaActual - 1) * tamanoPagina + 1
  const ultimoPaciente = Math.min(paginaActual * tamanoPagina, totalPacientes)
  return (
    <section className='mt-2.5 overflow-hidden rounded-xl border border-[#dce5ee] bg-white shadow-[0_5px_16px_rgba(18,52,91,0.08)]'>
      <div aria-label='Tabla de pacientes' className='overflow-x-auto' tabIndex={0}>
        <table className='w-full min-w-[900px] table-fixed border-collapse'>
          <caption className='sr-only'>Listado de pacientes hematológicos pediátricos del hospital</caption>
          <colgroup>
            <col className='w-[20%]' />
            <col className='w-[9%]' />
            <col className='w-[16%]' />
            <col className='w-[18%]' />
            <col className='w-[14%]' />
            <col className='w-[11%]' />
            <col className='w-[12%]' />
          </colgroup>
          <thead>
            <tr className='h-10 border-b border-[#dce5ee] bg-[#fcfeff] text-left text-[10px] font-extrabold text-[#078fa6]'>
              {columnas.map((columna) => (
                <th className='px-3' key={columna} scope='col'>
                  <span className={`flex items-center gap-1 ${columna === 'Acciones' ? 'justify-center' : ''}`}>
                    {columna}
                    {columna !== 'Acciones' && (
                      <IconoMedico className='h-3 w-3 text-[#7390ae]' nombre='chevronDown' />
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className='divide-y divide-[#e3eaf1]'>
            {pacientes.map((paciente) => (
              <tr
                className='h-[54px] text-[10px] text-[#314a78] transition hover:bg-[#f7fcfd]'
                key={paciente.dni}
              >
                <td className='px-3'>
                  <div className='flex items-center gap-2.5'>
                    <span
                      className={`grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-full border border-[#cbe9eb] text-[26px] shadow-sm ${paciente.colorAvatar}`}
                    >
                      <span aria-hidden='true' className='translate-y-0.5'>{paciente.avatar}</span>
                    </span>
                    <span className='min-w-0'>
                      <strong className='block truncate text-[10px] font-extrabold text-[#153679]'>
                        {paciente.nombre}
                      </strong>
                      <span className='text-[9px] text-[#657797]'>{formatearEdadPaciente(paciente.edad)}</span>
                    </span>
                  </div>
                </td>
                <td className='px-3 text-[10px] font-semibold'>{paciente.dni}</td>
                <td className='px-3'>
                  <span className='block font-medium'>{paciente.tutor}</span>
                  <span className='text-[9px] text-[#71819d]'>{paciente.parentescoTutor}</span>
                </td>
                <td className='px-3 font-medium leading-[14px]'>{paciente.diagnostico}</td>
                <td className='px-3'>
                  <span className='flex items-start gap-2'>
                    <IconoMedico className='mt-0.5 h-4 w-4 shrink-0 text-[#526b96]' nombre='calendar' />
                    <span className='leading-[14px]'>
                      {paciente.fechaCita}
                      <br />
                      {paciente.horaCita}
                    </span>
                  </span>
                </td>
                <td className='px-3'>
                  <EstadoBadgeComp estado={paciente.estado} />
                </td>
                <td className='px-3'>
                  <div className='flex items-center justify-center gap-1 text-[#079daf]'>
                    <button
                      aria-label={`Ver ficha de ${paciente.nombre}`}
                      className='grid h-8 w-8 cursor-pointer place-items-center rounded-lg transition hover:bg-[#eaf8fa] focus-visible:outline-2 focus-visible:outline-[#08aabb]'
                      onClick={() => onVerFicha(paciente)}
                      type='button'
                    >
                      <IconoMedico className='h-[18px] w-[18px]' nombre='eye' />
                    </button>
                    <button
                      aria-label={`Editar a ${paciente.nombre}`}
                      className='grid h-8 w-8 cursor-not-allowed place-items-center rounded-lg opacity-45'
                      disabled
                      title='La edición de la ficha todavía no está habilitada'
                      type='button'
                    >
                      <IconoMedico className='h-[18px] w-[18px]' nombre='edit' />
                    </button>
                    <button
                      aria-label={`Más acciones para ${paciente.nombre}`}
                      className='grid h-8 w-8 cursor-not-allowed place-items-center rounded-lg text-[#173478] opacity-45'
                      disabled
                      title='No hay acciones adicionales disponibles'
                      type='button'
                    >
                      <IconoMedico className='h-[18px] w-[18px]' nombre='moreVertical' strokeWidth={2.5} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {pacientes.length === 0 && (
          <div className='grid min-h-36 place-items-center px-4 text-center text-[12px] font-medium text-[#617493]'>
            No se encontraron pacientes con los filtros seleccionados.
          </div>
        )}
      </div>

      <footer className='flex min-h-[54px] flex-wrap items-center justify-between gap-3 border-t border-[#e1e9f0] px-4 py-2'>
        <p className='text-[10px] font-medium text-[#53688d]'>
          Mostrando {primerPaciente} a {ultimoPaciente} de {totalPacientes} pacientes
        </p>
        <nav aria-label='Paginación de pacientes' className='flex items-center gap-2'>
          <button
            aria-label='Página anterior'
            className='grid h-8 w-8 cursor-pointer place-items-center rounded-lg border border-[#d7e1ec] text-[#49618b] transition hover:bg-[#f4fafb] disabled:cursor-not-allowed disabled:text-[#8a9bb5] disabled:opacity-55'
            disabled={paginaActual <= 1 || totalPacientes === 0}
            onClick={() => onCambiarPagina(paginaActual - 1)}
            type='button'
          >
            <IconoMedico className='h-4 w-4' nombre='arrowLeft' />
          </button>
          {paginasVisibles.map((elemento) => {
            if (typeof elemento === 'string') {
              return <span aria-hidden='true' className='px-1 text-[11px] text-[#60749a]' key={elemento}>…</span>
            }

            const esActual = elemento === paginaActual
            return (
              <button
                aria-current={esActual ? 'page' : undefined}
                className={`grid h-8 w-8 cursor-pointer place-items-center rounded-lg border text-[11px] font-bold transition ${
                  esActual
                    ? 'border-[#08aabb] bg-[#edfafa] text-[#079daf]'
                    : 'border-[#d7e1ec] bg-white text-[#49618b] hover:bg-[#f4fafb]'
                }`}
                disabled={esActual}
                key={elemento}
                onClick={() => onCambiarPagina(elemento)}
                type='button'
              >
                {elemento}
              </button>
            )
          })}
          <button
            aria-label='Página siguiente'
            className='grid h-8 w-8 cursor-pointer place-items-center rounded-lg border border-[#d7e1ec] text-[#49618b] transition hover:bg-[#f4fafb] disabled:cursor-not-allowed disabled:text-[#8a9bb5] disabled:opacity-55'
            disabled={paginaActual >= paginasTotales || totalPacientes === 0}
            onClick={() => onCambiarPagina(paginaActual + 1)}
            type='button'
          >
            <IconoMedico className='h-4 w-4' nombre='arrowRight' />
          </button>
        </nav>
      </footer>
    </section>
  )
}

export default TablaPacientesComp
