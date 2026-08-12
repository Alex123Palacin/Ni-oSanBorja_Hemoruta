import { solicitarApi } from '../compartido/ClienteApi'

export interface ConsultaAsistentePacienteApi {
  mensaje: string
  rutaActual: string
}

export interface RespuestaAsistentePacienteApi {
  accionEjecutada?: string | null
  etiquetaRuta: string | null
  iaDisponible: boolean
  respuesta: string
  rutaSugerida: string | null
}

export function consultarAsistentePacienteApi(consulta: ConsultaAsistentePacienteApi) {
  return solicitarApi<RespuestaAsistentePacienteApi>('/ml/asistente-paciente/consultar/', {
    cuerpo: consulta,
    method: 'POST',
  })
}
