import { useMemo, useState } from 'react'

import type {
  FiltroSeguimiento,
  IdCartilla,
  PacienteSeguimiento,
} from '../types/SeguimientoPacientesLista'

const FILTROS_POR_CARTILLA: Record<IdCartilla, FiltroSeguimiento> = {
  alertas: 'alertas',
  documentos: 'documento',
  pacientes: 'todos',
  sintomas: 'sintomas',
}

function useSeguimientoPacientesLista(pacientes: readonly PacienteSeguimiento[]) {
  const [busqueda, setBusqueda] = useState('')
  const [filtroActivo, setFiltroActivo] = useState<FiltroSeguimiento>('todos')
  const [pacienteSeleccionadoId, setPacienteSeleccionadoId] = useState<string | null>(null)

  const pacientesFiltrados = useMemo(() => {
    const termino = busqueda.trim().toLocaleLowerCase('es')

    return pacientes.filter((paciente) => {
      const coincideBusqueda =
        !termino ||
        paciente.nombre.toLocaleLowerCase('es').includes(termino) ||
        paciente.dni.includes(termino)
      const coincideFiltro =
        filtroActivo === 'todos' ||
        (filtroActivo === 'alertas' && paciente.estado === 'Alerta') ||
        paciente.tipoUltimoRegistro === filtroActivo

      return coincideBusqueda && coincideFiltro
    })
  }, [busqueda, filtroActivo, pacientes])

  const pacienteSeleccionado =
    pacientesFiltrados.find((paciente) => paciente.id === pacienteSeleccionadoId) ?? null
  const hayFiltrosActivos = busqueda.trim().length > 0 || filtroActivo !== 'todos'

  function manejarAccionCartilla(id: IdCartilla) {
    setBusqueda('')
    setFiltroActivo(FILTROS_POR_CARTILLA[id])
  }

  function limpiarFiltros() {
    setBusqueda('')
    setFiltroActivo('todos')
  }

  return {
    busqueda,
    filtroActivo,
    hayFiltrosActivos,
    limpiarFiltros,
    manejarAccionCartilla,
    pacienteSeleccionado,
    pacienteSeleccionadoId,
    pacientesFiltrados,
    setBusqueda,
    setFiltroActivo,
    setPacienteSeleccionadoId,
  }
}

export default useSeguimientoPacientesLista
