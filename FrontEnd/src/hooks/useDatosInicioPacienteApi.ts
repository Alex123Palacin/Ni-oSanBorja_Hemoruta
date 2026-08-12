import { useEffect, useState } from 'react'
import {
  obtenerInicioPacienteApi,
  type InicioPacienteApi,
} from '../api/paciente/PacienteApi'
import { obtenerMensajeErrorApi } from '../api/compartido/ClienteApi'

function useDatosInicioPacienteApi() {
  const [datos, setDatos] = useState<InicioPacienteApi | null>(null)
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    let componenteActivo = true

    async function cargarInicioPaciente() {
      try {
        const respuesta = await obtenerInicioPacienteApi()
        if (!componenteActivo) return

        setDatos(respuesta)
        setError('')
      } catch (errorSolicitud) {
        if (!componenteActivo) return

        setError(obtenerMensajeErrorApi(errorSolicitud))
      } finally {
        if (componenteActivo) setCargando(false)
      }
    }

    void cargarInicioPaciente()

    return () => {
      componenteActivo = false
    }
  }, [])

  return { cargando, datos, error }
}

export default useDatosInicioPacienteApi
