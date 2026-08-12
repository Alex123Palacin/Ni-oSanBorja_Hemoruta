import { solicitarApi } from '../compartido/ClienteApi'

export interface MedicamentoConsultaVozApi {
  diasSemana: number[]
  dosisCantidad: string
  dosisUnidad: string
  duracionDias: number
  frecuenciaTexto: string
  horas: string[]
  indicaciones: string
  nombre: string
  via: string
}

export interface ProximoControlConsultaVozApi {
  detalle: string
  fecha: string
  hora: string
}

export interface SeccionesConsultaVozApi {
  evolucionClinica: string
  indicacionesCasa: string
  medicacionIndicada: MedicamentoConsultaVozApi[]
  motivoConsulta: string
  proximoControl: ProximoControlConsultaVozApi
  tratamientoIndicado: string
}

export interface IntervencionConsultaVozApi {
  fecha: string
  rol: 'IA' | 'MEDICO'
  texto: string
}

export interface SesionConsultaVozApi {
  actualizadoEn: string
  consultaId: string
  creadoEn: string
  estado: 'BORRADOR' | 'CANCELADO' | 'LISTO' | 'PUBLICADO'
  iaDisponible: boolean
  id: string
  intervenciones: IntervencionConsultaVozApi[]
  mensajeIa: string
  paciente: {
    edad: number
    historiaClinica: string
    id: string
    nombre: string
  }
  preguntaActual: string
  preguntasOmitidas: string[]
  publicadoEn: string | null
  secciones: SeccionesConsultaVozApi
  transcripcion: string
}

export interface PublicacionConsultaVozApi {
  citaId: string | null
  consultaId: string
  planTratamientoId: string | null
  prescripcionesIds: string[]
  publicadoEn: string
}

export interface SesionPublicadaConsultaVozApi extends SesionConsultaVozApi {
  publicacion: PublicacionConsultaVozApi
}

export function crearSesionConsultaVozApi(pacienteId: string) {
  return solicitarApi<SesionConsultaVozApi>('/ml/consultas-voz/', {
    cuerpo: { pacienteId },
    method: 'POST',
  })
}

export function actualizarSesionConsultaVozApi(
  sesionId: string,
  secciones: SeccionesConsultaVozApi,
) {
  return solicitarApi<SesionConsultaVozApi>(
    `/ml/consultas-voz/${encodeURIComponent(sesionId)}/`,
    {
      cuerpo: { secciones },
      method: 'PATCH',
    },
  )
}

export function transcribirRespuestaConsultaVozApi(
  sesionId: string,
  { audio, texto }: { audio?: Blob | null; texto?: string },
) {
  const datos = new FormData()
  const textoLimpio = texto?.trim()

  if (audio && audio.size > 0) {
    const extension = audio.type.includes('ogg') ? 'ogg' : audio.type.includes('mp4') ? 'm4a' : 'webm'
    datos.append('audio', new File([audio], `respuesta-consulta.${extension}`, { type: audio.type }))
  }
  if (textoLimpio) datos.append('texto', textoLimpio)

  return solicitarApi<SesionConsultaVozApi>(
    `/ml/consultas-voz/${encodeURIComponent(sesionId)}/transcribir/`,
    {
      cuerpo: datos,
      method: 'POST',
    },
  )
}

export function publicarConsultaVozApi(
  sesionId: string,
  secciones: SeccionesConsultaVozApi,
) {
  return solicitarApi<SesionPublicadaConsultaVozApi>(
    `/ml/consultas-voz/${encodeURIComponent(sesionId)}/publicar/`,
    {
      cuerpo: { secciones },
      method: 'POST',
    },
  )
}
