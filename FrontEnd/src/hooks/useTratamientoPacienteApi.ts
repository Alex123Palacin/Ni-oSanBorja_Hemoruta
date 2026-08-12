import { useEffect, useState } from 'react'

import { obtenerMensajeErrorApi } from '../api/compartido/ClienteApi'
import {
  obtenerTratamientoPacienteApi,
  type RespuestaTratamientoPacienteApi,
} from '../api/paciente/PacienteApi'

function useTratamientoPacienteApi() {
  const [datos, setDatos] = useState<RespuestaTratamientoPacienteApi | null>(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let activo = true

    async function cargar() {
      try {
        const respuesta = await obtenerTratamientoPacienteApi()
        if (!activo) return
        setDatos(respuesta)
        setError('')
      } catch (errorSolicitud) {
        if (!activo) return
        setError(obtenerMensajeErrorApi(errorSolicitud))
      } finally {
        if (activo) setCargando(false)
      }
    }

    void cargar()
    return () => {
      activo = false
    }
  }, [])

  return { cargando, datos, error }
}

export default useTratamientoPacienteApi
