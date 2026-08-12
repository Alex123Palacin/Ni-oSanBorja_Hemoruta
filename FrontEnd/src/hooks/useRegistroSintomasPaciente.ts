import { useState } from 'react'

import { obtenerMensajeErrorApi } from '../api/compartido/ClienteApi'
import { registrarSintomasPacienteApi } from '../api/paciente/PacienteApi'
import type {
  BorradorDetalleSintomasPaciente,
  DuracionSintomaPaciente,
  EvolucionSintomaPaciente,
} from '../components/pacienteMcomp/DetalleSintomasPacienteComp'
import type { NivelIntensidadSintoma } from '../components/pacienteMcomp/SintomasIntencidadComp'

export interface BorradorRegistroSintomasPaciente extends BorradorDetalleSintomasPaciente {
  intensidadGeneral: NivelIntensidadSintoma | null
  sintomasIds: string[]
}

export type EstadoEnvioSintomasPaciente = 'error' | 'enviando' | 'exito' | 'inactivo'

function crearRegistroInicial(): BorradorRegistroSintomasPaciente {
  const ahora = new Date()
  const compensada = new Date(ahora.getTime() - ahora.getTimezoneOffset() * 60_000)
  return {
    duracion: null,
    evolucion: null,
    fecha: compensada.toISOString().slice(0, 10),
    hora: compensada.toISOString().slice(11, 16),
    intensidadGeneral: null,
    observacion: '',
    sintomasIds: [],
  }
}

const DURACION_API: Record<DuracionSintomaPaciente, string> = {
  'entre-1-y-6': 'ENTRE_1_Y_6',
  'entre-6-y-24': 'ENTRE_6_Y_24',
  'mas-de-24': 'MAS_DE_24',
  'menos-de-1': 'MENOS_DE_1',
}

const EVOLUCION_API: Record<EvolucionSintomaPaciente, string> = {
  empeoro: 'EMPEORO',
  igual: 'IGUAL',
  mejoro: 'MEJORO',
}

const INTENSIDAD_API: Record<NivelIntensidadSintoma, string> = {
  fuerte: 'FUERTE',
  leve: 'LEVE',
  moderado: 'MODERADO',
}

function useRegistroSintomasPaciente() {
  const [registro, setRegistro] = useState<BorradorRegistroSintomasPaciente>(crearRegistroInicial)
  const [estadoEnvio, setEstadoEnvio] = useState<EstadoEnvioSintomasPaciente>('inactivo')
  const [mensajeEnvio, setMensajeEnvio] = useState('')

  function alternarSintoma(sintomaId: string) {
    setRegistro((actual) => ({
      ...actual,
      sintomasIds: actual.sintomasIds.includes(sintomaId)
        ? actual.sintomasIds.filter((id) => id !== sintomaId)
        : [...actual.sintomasIds, sintomaId],
    }))
    setEstadoEnvio('inactivo')
    setMensajeEnvio('')
  }

  function cambiarDetalle(cambio: Partial<BorradorDetalleSintomasPaciente>) {
    setRegistro((actual) => ({ ...actual, ...cambio }))
    setEstadoEnvio('inactivo')
    setMensajeEnvio('')
  }

  function cambiarIntensidad(intensidadGeneral: NivelIntensidadSintoma) {
    setRegistro((actual) => ({ ...actual, intensidadGeneral }))
    setEstadoEnvio('inactivo')
    setMensajeEnvio('')
  }

  async function enviarReporte() {
    if (!registro.sintomasIds.length) {
      setEstadoEnvio('error')
      setMensajeEnvio('Selecciona al menos un síntoma.')
      return false
    }
    if (!registro.intensidadGeneral || !registro.duracion || !registro.fecha || !registro.hora || !registro.evolucion) {
      setEstadoEnvio('error')
      setMensajeEnvio('Completa la intensidad, duración, fecha y evolución.')
      return false
    }

    const fecha = new Date(`${registro.fecha}T${registro.hora}`)
    if (Number.isNaN(fecha.getTime())) {
      setEstadoEnvio('error')
      setMensajeEnvio('Selecciona una fecha y hora válidas.')
      return false
    }

    setEstadoEnvio('enviando')
    setMensajeEnvio('Enviando el reporte al equipo médico...')

    try {
      await registrarSintomasPacienteApi({
        duracion: DURACION_API[registro.duracion],
        evolucion: EVOLUCION_API[registro.evolucion],
        intensidad: INTENSIDAD_API[registro.intensidadGeneral],
        observadoEn: fecha.toISOString(),
        observacion: registro.observacion.trim(),
        sintomas: registro.sintomasIds,
      })
      setRegistro(crearRegistroInicial())
      setEstadoEnvio('exito')
      setMensajeEnvio('Reporte enviado. El médico ya puede verlo en el seguimiento.')
      return true
    } catch (error) {
      setEstadoEnvio('error')
      setMensajeEnvio(obtenerMensajeErrorApi(error))
      return false
    }
  }

  return {
    alternarSintoma,
    cambiarDetalle,
    cambiarIntensidad,
    enviarReporte,
    estadoEnvio,
    mensajeEnvio,
    registro,
  }
}

export default useRegistroSintomasPaciente
