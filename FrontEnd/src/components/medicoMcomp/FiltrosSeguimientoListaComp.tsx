import type { FiltroSeguimiento } from '../../types/SeguimientoPacientesLista'
import InputUi from '../../ui/InputUi'
import IconoMedico from '../IconoMedico'

interface OpcionFiltroSeguimiento {
  etiqueta: string
  valor: Exclude<FiltroSeguimiento, 'alertas'>
}

interface FiltrosSeguimientoListaCompProps {
  busqueda: string
  filtroActivo: FiltroSeguimiento
  filtros: readonly OpcionFiltroSeguimiento[]
  hayFiltrosActivos: boolean
  onCambiarBusqueda: (valor: string) => void
  onCambiarFiltro: (filtro: FiltroSeguimiento) => void
  onLimpiarFiltros: () => void
}

function FiltrosSeguimientoListaComp({
  busqueda,
  filtroActivo,
  filtros,
  hayFiltrosActivos,
  onCambiarBusqueda,
  onCambiarFiltro,
  onLimpiarFiltros,
}: FiltrosSeguimientoListaCompProps) {
  return (
    <section className='mt-3 rounded-xl border border-[#dce5ee] bg-white p-2 shadow-[0_2px_8px_rgba(18,52,91,0.05)]'>
      <div className='flex gap-2'>
        <InputUi
          contenedorClassName='flex-1'
          etiqueta='Buscar paciente'
          onChange={(event) => onCambiarBusqueda(event.target.value)}
          placeholder='Buscar por nombre del paciente o DNI...'
          tamano='compacto'
          value={busqueda}
        />
        <button
          aria-label={hayFiltrosActivos ? 'Limpiar filtros' : 'Filtros de pacientes'}
          className='flex h-8 shrink-0 cursor-pointer items-center gap-2 rounded-lg border border-[#08aabb] bg-white px-4 text-[10px] font-bold text-[#079daf] transition hover:bg-[#effafb] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#08aabb] disabled:cursor-default disabled:opacity-100'
          disabled={!hayFiltrosActivos}
          onClick={onLimpiarFiltros}
          type='button'
        >
          <IconoMedico className='h-4 w-4' nombre='filter' />
          {hayFiltrosActivos ? 'Limpiar filtros' : 'Filtros'}
        </button>
      </div>

      <nav aria-label='Filtrar por tipo de registro' className='mt-1.5 overflow-x-auto'>
        <div className='flex min-w-max gap-2'>
          {filtros.map((filtro) => {
            const activo = filtroActivo === filtro.valor

            return (
              <button
                aria-pressed={activo}
                className={`h-6 min-w-[62px] cursor-pointer rounded-full border px-3 text-[8px] font-bold transition motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#08aabb] ${
                  activo
                    ? 'border-[#079daf] bg-[#079daf] text-white'
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
          {filtroActivo === 'alertas' && (
            <button
              aria-pressed='true'
              className='h-6 min-w-[62px] cursor-pointer rounded-full border border-[#f28a13] bg-[#fff1df] px-3 text-[8px] font-bold text-[#dc7c0d] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f28a13]'
              onClick={() => onCambiarFiltro('todos')}
              type='button'
            >
              Alertas ×
            </button>
          )}
        </div>
      </nav>
    </section>
  )
}

export default FiltrosSeguimientoListaComp
