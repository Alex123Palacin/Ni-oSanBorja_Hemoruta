import { useState } from 'react'

import type {
  FiltroDetalleSeguimiento,
  RegistroSeguimientoPaciente,
} from '../types/SeguimientoPaciente'

interface UseRegistrosSeguimientoParams {
  registrosPorFiltro: Record<FiltroDetalleSeguimiento, RegistroSeguimientoPaciente[]>
  totalRegistros: Record<FiltroDetalleSeguimiento, number>
}

function useRegistrosSeguimiento({
  registrosPorFiltro,
  totalRegistros,
}: UseRegistrosSeguimientoParams) {
  const [busqueda, setBusqueda] = useState('')
  const [filtroActivo, setFiltroActivo] = useState<FiltroDetalleSeguimiento>('todos')

  const registrosVisibles = registrosPorFiltro[filtroActivo]

  function cambiarFiltro(filtro: FiltroDetalleSeguimiento) {
    setFiltroActivo(filtro)
    setBusqueda('')
  }

  function limpiarFiltros() {
    setBusqueda('')
    setFiltroActivo('todos')
  }

  const totalVisible = totalRegistros[filtroActivo]

  return {
    busqueda,
    cambiarFiltro,
    filtroActivo,
    limpiarFiltros,
    registrosVisibles,
    setBusqueda,
    totalVisible,
  }
}

export default useRegistrosSeguimiento
