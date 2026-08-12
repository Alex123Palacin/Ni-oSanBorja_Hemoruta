import { useCallback, useEffect, useState } from 'react'
import { obtenerMensajeErrorApi } from '../api/compartido/ClienteApi'
import {
  obtenerMedicacionPacienteApi,
  registrarTomaMedicamentoPacienteApi,
  type RegistrarTomaMedicamentoPacienteApi,
  type RespuestaMedicacionPacienteApi,
} from '../api/paciente/PacienteApi'

export type EstadoRegistroTomaPaciente = 'error' | 'exito' | 'guardando' | 'inactivo'

function useMedicacionPacienteApi(mes?: string) {
  const [datos, setDatos] = useState<RespuestaMedicacionPacienteApi | null>(null)
  const [cargaFinalizada, setCargaFinalizada] = useState(false)
  const [errorCarga, setErrorCarga] = useState('')
  const [estadoRegistro, setEstadoRegistro] = useState<EstadoRegistroTomaPaciente>('inactivo')
  const [mensajeRegistro, setMensajeRegistro] = useState('')

  const cargarMedicacion = useCallback(async (componenteActivo: () => boolean = () => true) => {
    try {
      const respuesta = await obtenerMedicacionPacienteApi(mes)
      if (!componenteActivo()) return

      setDatos(respuesta)
      setErrorCarga('')
    } catch (errorSolicitud) {
      if (!componenteActivo()) return

      setErrorCarga(obtenerMensajeErrorApi(errorSolicitud))
    } finally {
      if (componenteActivo()) setCargaFinalizada(true)
    }
  }, [mes])

  useEffect(() => {
    let componenteActivo = true
    setCargaFinalizada(false)
    void cargarMedicacion(() => componenteActivo)

    return () => {
      componenteActivo = false
    }
  }, [cargarMedicacion])

  const registrarToma = useCallback(async (registro: RegistrarTomaMedicamentoPacienteApi) => {
    setEstadoRegistro('guardando')
    setMensajeRegistro('Guardando el registro de la dosis...')

    try {
      await registrarTomaMedicamentoPacienteApi(registro)
      await cargarMedicacion()
      setEstadoRegistro('exito')
      setMensajeRegistro('La dosis se registró correctamente.')
      return true
    } catch (errorSolicitud) {
      setEstadoRegistro('error')
      setMensajeRegistro(obtenerMensajeErrorApi(errorSolicitud))
      return false
    }
  }, [cargarMedicacion])

  return {
    cargaFinalizada,
    datos,
    errorCarga,
    estadoRegistro,
    mensajeRegistro,
    recargar: cargarMedicacion,
    registrarToma,
  }
}

export default useMedicacionPacienteApi
