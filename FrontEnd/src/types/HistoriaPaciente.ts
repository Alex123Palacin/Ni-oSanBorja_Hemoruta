export type FiltroHistorial = 'consultas' | 'documentos' | 'medicacion' | 'todo' | 'tratamientos'
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
