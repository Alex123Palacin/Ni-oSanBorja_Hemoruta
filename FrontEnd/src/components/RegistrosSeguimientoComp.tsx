import type {
  EstadoRegistroSeguimiento,
  FiltroDetalleSeguimiento,
  OpcionFiltroDetalle,
  OrigenRegistroSeguimiento,
  RegistroSeguimientoPaciente,
  TipoRegistroSeguimiento,
} from '../types/SeguimientoPaciente'
import InputUi from '../ui/InputUi'
import IconoMedico, { type NombreIconoMedico } from './IconoMedico'

interface ConfiguracionTipo {
  fondo: string
  icono: NombreIconoMedico
  texto: string
}

const CONFIGURACION_TIPO: Record<TipoRegistroSeguimiento, ConfiguracionTipo> = {
  documento: { fondo: 'bg-[#edf2ff]', icono: 'file', texto: 'text-[#4f76dd]' },
  medicacion: { fondo: 'bg-[#f1f3f9]', icono: 'pill', texto: 'text-[#64759d]' },
  sintomas: { fondo: 'bg-[#fff1df]', icono: 'smile', texto: 'text-[#f08320]' },
  tratamiento: { fondo: 'bg-[#eaf4ff]', icono: 'clipboard', texto: 'text-[#277bd9]' },
}

const ETIQUETAS_TIPO: Record<TipoRegistroSeguimiento, string> = {
  documento: 'Documento',
  medicacion: 'Medicación',
  sintomas: 'Síntomas',
  tratamiento: 'Tratamiento',
}

const CONFIGURACION_ORIGEN: Record<OrigenRegistroSeguimiento, { clase: string; icono: NombreIconoMedico }> = {
  'App móvil': { clase: 'text-[#287ee8]', icono: 'smartphone' },
  Médico: { clase: 'text-[#596fa4]', icono: 'stethoscope' },
  WhatsApp: { clase: 'text-[#18b75d]', icono: 'whatsapp' },
}

const CONFIGURACION_ESTADO: Record<EstadoRegistroSeguimiento, { fondo: string; icono: NombreIconoMedico | null; texto: string }> = {
  Alerta: { fondo: 'bg-[#ffe9e9]', icono: 'alertTriangle', texto: 'text-[#e23d49]' },
  Cerrado: { fondo: 'bg-[#fff2df]', icono: null, texto: 'text-[#dd8614]' },
  Cumplido: { fondo: 'bg-[#e5f8ea]', icono: 'check', texto: 'text-[#179747]' },
  'En seguimiento': { fondo: 'bg-[#e8f3ff]', icono: null, texto: 'text-[#277bd9]' },
  Registrado: { fondo: 'bg-[#e5f8ea]', icono: 'check', texto: 'text-[#179747]' },
  Revisado: { fondo: 'bg-[#e5f8ea]', icono: 'check', texto: 'text-[#179747]' },
}

function IconoOrigen({ origen }: { origen: OrigenRegistroSeguimiento }) {
  const origenActual = CONFIGURACION_ORIGEN[origen]

  return <IconoMedico className={`h-4 w-4 shrink-0 ${origenActual.clase}`} nombre={origenActual.icono} />
}

function BadgeEstado({ estado }: { estado: EstadoRegistroSeguimiento }) {
  const configuracion = CONFIGURACION_ESTADO[estado]

  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2 py-1 text-[7px] font-bold ${configuracion.fondo} ${configuracion.texto}`}>
      {configuracion.icono ? (
        <span className={`grid h-3.5 w-3.5 place-items-center rounded-full ${configuracion.texto}`}>
          <IconoMedico className='h-3 w-3' nombre={configuracion.icono} strokeWidth={2.6} />
        </span>
      ) : (
        <span className={`h-2 w-2 rounded-full ${estado === 'Cerrado' ? 'bg-[#f2a116]' : 'bg-[#2788ef]'}`} />
      )}
      {estado}
    </span>
  )
}

interface RegistrosSeguimientoCompProps {
  busqueda: string
  filtroActivo: FiltroDetalleSeguimiento
  filtros: OpcionFiltroDetalle[]
  onCambiarBusqueda: (valor: string) => void
  onCambiarFiltro: (filtro: FiltroDetalleSeguimiento) => void
  onLimpiarFiltros: () => void
  onVerRegistro: (registro: RegistroSeguimientoPaciente) => void
  registros: RegistroSeguimientoPaciente[]
  totalRegistros: number
}

function RegistrosSeguimientoComp({
  busqueda,
  filtroActivo,
  filtros,
  onCambiarBusqueda,
  onCambiarFiltro,
  onLimpiarFiltros,
  onVerRegistro,
  registros,
  totalRegistros,
}: RegistrosSeguimientoCompProps) {
  const tienePaginas = totalRegistros > 5

  return (
    <section className='overflow-hidden rounded-xl border border-[#dce5ee] bg-white shadow-[0_2px_8px_rgba(18,52,91,0.06)]'>
      <div className='p-3'>
        <h2 className='text-[11px] font-extrabold text-[#102e78]'>Registros recibidos</h2>

        <div className='mt-2 flex flex-col gap-2 min-[700px]:flex-row min-[700px]:items-center min-[700px]:justify-between'>
          <nav aria-label='Filtrar registros de seguimiento' className='overflow-x-auto pb-0.5'>
            <div className='flex min-w-max gap-2'>
              {filtros.map((filtro) => {
                const activo = filtroActivo === filtro.valor

                return (
                  <button
                    aria-pressed={activo}
                    className={`h-7 min-w-[62px] cursor-pointer rounded-lg border px-3 text-[8px] font-bold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#08aabb] ${
                      activo
                        ? 'border-[#079daf] bg-gradient-to-r from-[#08aabc] to-[#078da9] text-white shadow-sm'
                        : 'border-[#dbe5ee] bg-white text-[#365083] hover:border-[#91d8df] hover:bg-[#f3fbfc]'
                    }`}
                    key={filtro.valor}
                    onClick={() => onCambiarFiltro(filtro.valor)}
                    type='button'
                  >
                    {filtro.etiqueta}
                  </button>
                )
              })}
            </div>
          </nav>

          <div className='flex min-w-0 gap-2 min-[700px]:w-[330px]'>
            <InputUi
              contenedorClassName='flex-1'
              etiqueta='Buscar en registros'
              onChange={(event) => onCambiarBusqueda(event.target.value)}
              placeholder='Buscar en registros...'
              tamano='compacto'
              value={busqueda}
            />
            <button
              aria-label='Restablecer búsqueda y filtros'
              className='flex h-8 shrink-0 cursor-pointer items-center gap-2 rounded-lg border border-[#08aabb] bg-white px-3 text-[8px] font-bold text-[#079daf] transition hover:bg-[#effafb] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#08aabb]'
              onClick={onLimpiarFiltros}
              type='button'
            >
              <IconoMedico className='h-4 w-4' nombre='filter' />
              Filtros
            </button>
          </div>
        </div>
      </div>

      <div className='overflow-x-auto'>
        <table className='w-full min-w-[680px] table-fixed border-collapse'>
          <colgroup>
            <col className='w-[17%]' />
            <col className='w-[14%]' />
            <col className='w-[16%]' />
            <col className='w-[27%]' />
            <col className='w-[15%]' />
            <col className='w-[11%]' />
          </colgroup>
          <thead>
            <tr className='h-8 border-y border-[#e1e9f0] bg-[#fbfcfe] text-left text-[7px] font-extrabold text-[#3d5682]'>
              <th className='px-3' scope='col'>
                <span className='flex items-center gap-1'>
                  Fecha y hora
                  <IconoMedico className='h-3 w-3 text-[#079daf]' nombre='chevronDown' />
                </span>
              </th>
              <th className='px-3' scope='col'>Origen</th>
              <th className='px-3' scope='col'>Tipo</th>
              <th className='px-3' scope='col'>Resumen</th>
              <th className='px-3' scope='col'>Estado</th>
              <th className='px-3' scope='col'>Acción</th>
            </tr>
          </thead>
          <tbody className='divide-y divide-[#e1e9f0]'>
            {registros.map((registro) => {
              const configuracionTipo = CONFIGURACION_TIPO[registro.tipo]
              const accion = registro.tipo === 'documento' ? 'Ver archivo' : 'Ver detalle'

              return (
                <tr className='h-[48px] text-[8px] text-[#35507f] transition hover:bg-[#f8fcfd]' key={registro.id}>
                  <td className='px-3 font-bold leading-[12px] text-[#3e5987]'>
                    {registro.fecha}
                    <br />
                    {registro.hora}
                  </td>
                  <td className='px-3'>
                    <span className='flex items-center gap-1.5 font-bold'>
                      <IconoOrigen origen={registro.origen} />
                      {registro.origen}
                    </span>
                  </td>
                  <td className='px-3'>
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 font-bold ${configuracionTipo.fondo} ${configuracionTipo.texto}`}>
                      <IconoMedico className='h-3.5 w-3.5' nombre={configuracionTipo.icono} />
                      {ETIQUETAS_TIPO[registro.tipo]}
                    </span>
                  </td>
                  <td className='px-3 font-semibold leading-[12px]'>{registro.resumen}</td>
                  <td className='px-3'><BadgeEstado estado={registro.estado} /></td>
                  <td className='px-3'>
                    <button
                      className='inline-flex cursor-pointer items-center gap-1.5 whitespace-nowrap font-bold text-[#158eb1] underline decoration-[#8dd0dc] underline-offset-2 transition hover:text-[#086c8d] focus-visible:rounded focus-visible:outline-2 focus-visible:outline-[#08aabb]'
                      onClick={() => onVerRegistro(registro)}
                      type='button'
                    >
                      <IconoMedico className='h-4 w-4' nombre={registro.tipo === 'documento' ? 'file' : 'eye'} />
                      {accion}
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {registros.length === 0 && (
          <div className='grid min-h-40 place-items-center px-5 text-center text-[10px] font-medium text-[#617493]'>
            No se encontraron registros con la búsqueda actual.
          </div>
        )}
      </div>

      <footer className='flex flex-wrap items-center justify-between gap-2 border-t border-[#e1e9f0] px-3 py-2'>
        <p className='text-[8px] font-medium text-[#53688d]'>
          Mostrando {registros.length === 0 ? 0 : 1} a {registros.length} de {totalRegistros} registros
        </p>
        <nav aria-label='Paginación de registros' className='flex items-center gap-1.5'>
          <button
            aria-label='Página anterior'
            className='grid h-7 w-7 cursor-pointer place-items-center rounded-lg border border-[#d7e1ec] text-[#49618b] transition hover:bg-[#f4fafb]'
            type='button'
          >
            <IconoMedico className='h-3.5 w-3.5' nombre='arrowLeft' />
          </button>
          {(tienePaginas ? [1, 2, 3] : [1]).map((pagina) => (
            <button
              aria-current={pagina === 1 ? 'page' : undefined}
              className={`grid h-7 w-7 cursor-pointer place-items-center rounded-lg border text-[9px] font-bold ${
                pagina === 1
                  ? 'border-[#08aabb] bg-[#edfafa] text-[#079daf]'
                  : 'border-[#d7e1ec] bg-white text-[#49618b] hover:bg-[#f4fafb]'
              }`}
              key={pagina}
              type='button'
            >
              {pagina}
            </button>
          ))}
          {tienePaginas && (
            <>
              <span className='px-1 text-[9px] text-[#60749a]'>...</span>
              <button
                className='grid h-7 w-7 cursor-pointer place-items-center rounded-lg border border-[#d7e1ec] text-[9px] font-bold text-[#49618b] hover:bg-[#f4fafb]'
                type='button'
              >
                7
              </button>
            </>
          )}
          <button
            aria-label='Página siguiente'
            className='grid h-7 w-7 cursor-pointer place-items-center rounded-lg border border-[#d7e1ec] text-[#49618b] transition hover:bg-[#f4fafb]'
            type='button'
          >
            <IconoMedico className='h-3.5 w-3.5' nombre='arrowRight' />
          </button>
        </nav>
      </footer>
    </section>
  )
}

export default RegistrosSeguimientoComp
