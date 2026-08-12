import { useCallback, useState } from 'react'

import { registrarAltaPacienteMedicoApi } from '../api/medico/AltaPacienteMedicoApi'
import { obtenerMensajeErrorApi } from '../api/compartido/ClienteApi'
import type { FormularioActivacion, ResultadoAltaPacienteMedico } from '../types/NuevoPaciente'

function useAltaPacienteMedico() {
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')
  const [resultado, setResultado] = useState<ResultadoAltaPacienteMedico | null>(null)

  const registrar = useCallback(async (formulario: FormularioActivacion) => {
    setCargando(true)
    setError('')
    try {
      const alta = await registrarAltaPacienteMedicoApi(formulario)
      setResultado(alta)
      return alta
    } catch (errorSolicitud) {
      setError(obtenerMensajeErrorApi(errorSolicitud))
      return null
    } finally {
      setCargando(false)
    }
  }, [])

  return { cargando, error, registrar, resultado }
}

export default useAltaPacienteMedico
