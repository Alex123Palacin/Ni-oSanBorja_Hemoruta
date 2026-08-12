export type FiltroHistorial =
  | 'consultas'
  | 'documentos'
  | 'medicacion'
  | 'sintomas'
  | 'todo'
  | 'tratamientos'
export type TipoDetalleHistorial = 'medicacion' | 'tratamiento'

export interface DetalleHistorialPaciente {
  descripcion: string
  fecha: string
  fechaHoraIso: string
  hora: string
  id: string
  lineas: string[]
  tipo: TipoDetalleHistorial
  titulo: string
}

export interface EpisodioHistorialPaciente {
  descripcion: string
  detalles: DetalleHistorialPaciente[]
  especialidad: string
  estado: string
  fecha: string
  fechaHoraIso: string
  hora: string
  id: string
  medico: string
  titulo: string
}

export interface DocumentoHistorialPaciente {
  archivoDisponible: boolean
  descripcion: string
  estado: string
  fecha: string
  fechaHoraIso: string
  formato: string
  hora: string
  id: string
  nombre: string
  origen: string
  tipoMime: string
}

export interface SintomaHistorialPaciente {
  codigo: string
  detalle: string
  id: string
  nombre: string
}

export interface ReporteSintomasHistorialPaciente {
  descripcion: string
  duracion: string
  estado: string
  evolucion: string
  fecha: string
  fechaHoraIso: string
  hora: string
  id: string
  intensidad: 'FUERTE' | 'LEVE' | 'MODERADA'
  origen: string
  reportadoPor: string
  sintomas: SintomaHistorialPaciente[]
}
