import { useMemo, useState } from 'react'

import type { Paciente, TipoBusqueda } from '../types/GestionarPacientes'

function normalizarTexto(texto: string) {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('es')
}

function useGestionarPacientes(pacientes: readonly Paciente[]) {
  const [busqueda, setBusqueda] = useState('')
  const [diagnostico, setDiagnostico] = useState('todos')
  const [estado, setEstado] = useState('todos')
  const [tipoBusqueda, setTipoBusqueda] = useState<TipoBusqueda>('dni')

  const pacientesFiltrados = useMemo(() => {
    const termino = normalizarTexto(busqueda.trim())

    return pacientes.filter((paciente) => {
      const valorBusqueda = {
        dni: paciente.dni,
        nombre: paciente.nombre,
      }[tipoBusqueda]
      const coincideBusqueda = !termino || normalizarTexto(valorBusqueda).includes(termino)
      const coincideDiagnostico = diagnostico === 'todos' || paciente.diagnostico === diagnostico
      const coincideEstado = estado === 'todos' || paciente.estado === estado

      return coincideBusqueda && coincideDiagnostico && coincideEstado
    })
  }, [busqueda, diagnostico, estado, pacientes, tipoBusqueda])

  function limpiarFiltros() {
    setBusqueda('')
    setDiagnostico('todos')
    setEstado('todos')
    setTipoBusqueda('dni')
  }

  return {
    busqueda,
    diagnostico,
    estado,
    limpiarFiltros,
    pacientesFiltrados,
    setBusqueda,
    setDiagnostico,
    setEstado,
    setTipoBusqueda,
    tipoBusqueda,
  }
}

export default useGestionarPacientes
