import type { OpcionComboBox } from '../../ui/ComboBoxUI'
import ComboBoxUI from '../../ui/ComboBoxUI'
import InputUi from '../../ui/InputUi'
import type { TipoBusqueda } from '../../types/GestionarPacientes'
import IconoMedico from '../IconoMedico'

interface CampoBusquedaGestion {
  etiqueta: string
  valor: TipoBusqueda
}

interface FiltrosGestionPacientesCompProps {
  busqueda: string
  camposBusqueda: readonly CampoBusquedaGestion[]
  diagnostico: string
  estado: string
  onCambiarBusqueda: (valor: string) => void
  onCambiarDiagnostico: (valor: string) => void
  onCambiarEstado: (valor: string) => void
  onCambiarTipoBusqueda: (valor: TipoBusqueda) => void
  onLimpiarFiltros: () => void
  opcionesDiagnostico: OpcionComboBox[]
  opcionesEstado: OpcionComboBox[]
  tipoBusqueda: TipoBusqueda
}

function FiltrosGestionPacientesComp({
  busqueda,
  camposBusqueda,
  diagnostico,
  estado,
  onCambiarBusqueda,
  onCambiarDiagnostico,
  onCambiarEstado,
  onCambiarTipoBusqueda,
  onLimpiarFiltros,
  opcionesDiagnostico,
  opcionesEstado,
  tipoBusqueda,
}: FiltrosGestionPacientesCompProps) {
  return (
    <section className='mt-3 rounded-xl border border-[#dce5ee] bg-white p-3.5 shadow-[0_4px_14px_rgba(18,52,91,0.07)]'>
      <div className='grid items-end gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(300px,1.7fr)_minmax(170px,.9fr)_minmax(160px,.85fr)_136px]'>
        <InputUi
          etiqueta='Búsqueda rápida'
          etiquetaVisible
          id='busquedaPaciente'
          onChange={(event) => onCambiarBusqueda(event.target.value)}
          placeholder='Buscar por DNI o nombre...'
          value={busqueda}
        />

        <ComboBoxUI
          etiqueta='Diagnóstico'
          id='filtroDiagnostico'
          onChange={onCambiarDiagnostico}
          opciones={opcionesDiagnostico}
          valor={diagnostico}
        />
        <ComboBoxUI
          etiqueta='Estado'
          id='filtroEstado'
          onChange={onCambiarEstado}
          opciones={opcionesEstado}
          valor={estado}
        />
        <button
          className='flex h-10 cursor-pointer items-center justify-center gap-2 rounded-lg border border-[#08aabb] bg-white px-3 text-[10px] font-bold text-[#079daf] transition hover:bg-[#f0fbfc] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#08aabb]'
          onClick={onLimpiarFiltros}
          type='button'
        >
          <IconoMedico className='h-[18px] w-[18px]' nombre='filter' />
          Limpiar filtros
        </button>
      </div>

      <fieldset className='mt-3 flex flex-wrap items-center gap-x-6 gap-y-2'>
        <legend className='sr-only'>Búsqueda avanzada por</legend>
        <span className='text-[9px] font-semibold text-[#5a6e91]'>Búsqueda avanzada por</span>
        {camposBusqueda.map((campo) => (
          <label
            className='flex cursor-pointer items-center gap-2 text-[9px] font-medium text-[#4c6186]'
            key={campo.valor}
          >
            <input
              checked={tipoBusqueda === campo.valor}
              className='h-3.5 w-3.5 appearance-none rounded-full border border-[#b8c8da] bg-white transition checked:border-[4px] checked:border-[#08aabb] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#08aabb]'
              name='tipoBusqueda'
              onChange={() => onCambiarTipoBusqueda(campo.valor)}
              type='radio'
            />
            {campo.etiqueta}
          </label>
        ))}
      </fieldset>
    </section>
  )
}

export default FiltrosGestionPacientesComp
