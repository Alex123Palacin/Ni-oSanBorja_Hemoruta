import type { PacienteSeguimiento, TipoRegistro } from '../../types/SeguimientoPacientesLista'
import { formatearEdadPaciente } from '../../utils/paciente'
import IconoMedico from '../IconoMedico'
import SemaforoBadgeComp from './SemaforoBadgeComp'

interface TablaSeguimientoPacientesCompProps {
  cargando: boolean
  errorCarga: boolean
  etiquetasRegistro: Record<TipoRegistro, string>
  onCambiarPagina: (pagina: number) => void
  onSeleccionarPaciente: (id: string) => void
  pagina: number
  pacienteSeleccionadoId: string | null
  pacientes: readonly PacienteSeguimiento[]
  paginasTotales: number
  tamanoPagina: number
  totalPacientes: number
}

function obtenerElementosPaginacion(pagina: number, paginasTotales: number) {
  const candidatas = new Set([1, paginasTotales, pagina - 1, pagina, pagina + 1])

  if (pagina <= 3) {
    candidatas.add(2)
    candidatas.add(3)
  }
  if (pagina >= paginasTotales - 2) {
    candidatas.add(paginasTotales - 1)
    candidatas.add(paginasTotales - 2)
  }

  const paginas = [...candidatas]
    .filter((numeroPagina) => numeroPagina >= 1 && numeroPagina <= paginasTotales)
    .sort((a, b) => a - b)
  const elementos: (number | string)[] = []

  paginas.forEach((numeroPagina, indice) => {
    const paginaAnterior = paginas[indice - 1]
    if (paginaAnterior && numeroPagina - paginaAnterior > 1) {
      elementos.push(`separador-${paginaAnterior}-${numeroPagina}`)
    }
    elementos.push(numeroPagina)
  })

  return elementos
}

function TablaSeguimientoPacientesComp({
  cargando,
  errorCarga,
  etiquetasRegistro,
  onCambiarPagina,
  onSeleccionarPaciente,
  pagina,
  pacienteSeleccionadoId,
  pacientes,
  paginasTotales,
  tamanoPagina,
  totalPacientes,
}: TablaSeguimientoPacientesCompProps) {
  const inicioPagina = totalPacientes === 0 ? 0 : (pagina - 1) * tamanoPagina + 1
  const finPagina = Math.min(pagina * tamanoPagina, totalPacientes)
  const elementosPaginacion = obtenerElementosPaginacion(pagina, paginasTotales)
  const controlesDeshabilitados = cargando || errorCarga || totalPacientes === 0

  return (
    <section className='mt-2 overflow-hidden rounded-xl border border-[#dce5ee] bg-white shadow-[0_2px_8px_rgba(18,52,91,0.06)]'>
      <div aria-label='Listado de pacientes en seguimiento' className='overflow-x-auto' tabIndex={0}>
        <table className='w-full min-w-[760px] table-fixed border-collapse'>
          <caption className='sr-only'>Pacientes con seguimiento clínico activo</caption>
          <colgroup>
            <col className='w-[22%]' />
            <col className='w-[13%]' />
            <col className='w-[17%]' />
            <col className='w-[18%]' />
            <col className='w-[15%]' />
            <col className='w-[11%]' />
            <col className='w-[4%]' />
          </colgroup>
          <thead>
            <tr className='h-7 bg-[#f8fafc] text-left text-[8px] font-extrabold text-[#3d5682]'>
              <th className='px-2' scope='col'>Paciente</th>
              <th className='px-2' scope='col'>Origen reciente</th>
              <th className='px-2' scope='col'>
                <span className='flex items-center gap-1'>
                  Último registro
                  <IconoMedico className='h-3 w-3' nombre='chevronDown' />
                </span>
              </th>
              <th className='px-2' scope='col'>Semáforo</th>
              <th className='px-2' scope='col'>Próxima cita</th>
              <th className='px-2' scope='col'>Estado</th>
              <th className='px-1' scope='col'><span className='sr-only'>Seleccionar</span></th>
            </tr>
          </thead>
          <tbody className='divide-y divide-[#e1e9f0]'>
            {pacientes.map((paciente) => {
              const seleccionado = pacienteSeleccionadoId === paciente.id

              return (
                <tr
                  className={`h-11 text-[8px] text-[#314a78] transition motion-reduce:transition-none ${
                    seleccionado ? 'bg-[#eaf8fa]' : 'hover:bg-[#f7fbfc]'
                  }`}
                  key={paciente.id}
                >
                  <td className='px-2'>
                    <button
                      aria-pressed={seleccionado}
                      className='flex w-full cursor-pointer items-center gap-2 text-left focus-visible:rounded focus-visible:outline-2 focus-visible:outline-[#08aabb]'
                      onClick={() => onSeleccionarPaciente(paciente.id)}
                      type='button'
                    >
                      <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-[17px] ${paciente.colorAvatar}`}>
                        <span aria-hidden='true'>{paciente.avatar}</span>
                      </span>
                      <span className='min-w-0'>
                        <strong className='block truncate text-[9px] font-extrabold leading-[11px] text-[#153679]'>{paciente.nombre}</strong>
                        <span className='text-[8px] leading-[10px] text-[#647797]'>{formatearEdadPaciente(paciente.edad)} · DNI {paciente.dni}</span>
                      </span>
                    </button>
                  </td>
                  <td className='px-2'>
                    <span className='flex items-center gap-1 font-semibold'>
                      <IconoMedico
                        className={`h-4 w-4 ${paciente.origen === 'WhatsApp' ? 'text-[#18b75d]' : 'text-[#287ee8]'}`}
                        nombre={paciente.origen === 'WhatsApp' ? 'whatsapp' : 'smartphone'}
                      />
                      {paciente.origen}
                    </span>
                  </td>
                  <td className='px-2 leading-[11px]'>
                    <strong className='block font-bold text-[#385482]'>{paciente.fechaUltimoRegistro} {paciente.horaUltimoRegistro}</strong>
                    <span>{etiquetasRegistro[paciente.tipoUltimoRegistro]}</span>
                  </td>
                  <td className='px-2'><SemaforoBadgeComp paciente={paciente} /></td>
                  <td className='px-2 leading-[11px]'>
                    <span className='flex items-start gap-1'>
                      <IconoMedico className='h-3.5 w-3.5 shrink-0 text-[#516b96]' nombre='calendar' />
                      <span>
                        <strong className='block font-bold text-[#385482]'>{paciente.fechaProximaCita}</strong>
                        {paciente.horaProximaCita}
                      </span>
                    </span>
                  </td>
                  <td className='px-2'>
                    <span className={`inline-flex whitespace-nowrap rounded-full px-2 py-1 text-[8px] font-bold ${
                      paciente.estado === 'Alerta'
                        ? 'bg-[#ffe8e8] text-[#e23d49]'
                        : 'bg-[#e8f4ff] text-[#277bd9]'
                    }`}>
                      {paciente.estado}
                    </span>
                  </td>
                  <td className='px-1'>
                    <button
                      aria-label={`Seleccionar a ${paciente.nombre}`}
                      className='grid h-6 w-6 cursor-pointer place-items-center rounded text-[#28509c] transition hover:bg-[#dff3f6] focus-visible:outline-2 focus-visible:outline-[#08aabb]'
                      onClick={(event) => {
                        event.stopPropagation()
                        onSeleccionarPaciente(paciente.id)
                      }}
                      type='button'
                    >
                      <IconoMedico className='h-3.5 w-3.5' nombre='arrowRight' strokeWidth={2.2} />
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {cargando && (
          <div className='grid min-h-32 place-items-center px-5 text-center text-[10px] font-medium text-[#617493]' role='status'>
            Cargando pacientes en seguimiento…
          </div>
        )}

        {!cargando && errorCarga && (
          <div className='grid min-h-32 place-items-center px-5 text-center text-[10px] font-medium text-[#a54a4a]' role='alert'>
            La lista de seguimiento no está disponible en este momento.
          </div>
        )}

        {!cargando && !errorCarga && pacientes.length === 0 && (
          <div className='grid min-h-32 place-items-center px-5 text-center text-[10px] font-medium text-[#617493]'>
            No se encontraron pacientes con los filtros seleccionados.
          </div>
        )}
      </div>

      <footer className='flex min-h-[38px] flex-wrap items-center justify-between gap-2 border-t border-[#e1e9f0] px-3 py-1'>
        <p className='text-[9px] font-medium text-[#53688d]'>
          Mostrando {inicioPagina} a {finPagina} de {totalPacientes} pacientes
        </p>
        <nav aria-label='Paginación de seguimiento' className='flex items-center gap-1.5'>
          <button
            aria-label='Página anterior'
            className='grid h-[30px] w-[30px] cursor-pointer place-items-center rounded-lg border border-[#d7e1ec] text-[#49618b] transition hover:bg-[#f4fafb] disabled:cursor-not-allowed disabled:text-[#9aabc1] disabled:opacity-60'
            disabled={controlesDeshabilitados || pagina <= 1}
            onClick={() => onCambiarPagina(pagina - 1)}
            type='button'
          >
            <IconoMedico className='h-3.5 w-3.5' nombre='arrowLeft' />
          </button>
          {elementosPaginacion.map((elemento) =>
            typeof elemento === 'number' ? (
              <button
                aria-current={elemento === pagina ? 'page' : undefined}
                aria-label={`Página ${elemento}`}
                className={`grid h-[30px] w-[30px] place-items-center rounded-lg border text-[9px] font-bold transition disabled:cursor-not-allowed ${
                  elemento === pagina
                    ? 'cursor-default border-[#08aabb] bg-[#edfafa] text-[#079daf]'
                    : 'cursor-pointer border-[#d7e1ec] bg-white text-[#49618b] hover:bg-[#f4fafb] disabled:opacity-60'
                }`}
                disabled={controlesDeshabilitados || elemento === pagina}
                key={elemento}
                onClick={() => onCambiarPagina(elemento)}
                type='button'
              >
                {elemento}
              </button>
            ) : (
              <span aria-hidden='true' className='px-1 text-[9px] text-[#60749a]' key={elemento}>
                …
              </span>
            ),
          )}
          <button
            aria-label='Página siguiente'
            className='grid h-[30px] w-[30px] cursor-pointer place-items-center rounded-lg border border-[#d7e1ec] text-[#49618b] transition hover:bg-[#f4fafb] disabled:cursor-not-allowed disabled:text-[#9aabc1] disabled:opacity-60'
            disabled={controlesDeshabilitados || pagina >= paginasTotales}
            onClick={() => onCambiarPagina(pagina + 1)}
            type='button'
          >
            <IconoMedico className='h-3.5 w-3.5' nombre='arrowRight' />
          </button>
        </nav>
      </footer>
    </section>
  )
}

export default TablaSeguimientoPacientesComp
