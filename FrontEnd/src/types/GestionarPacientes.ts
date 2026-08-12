export type EstadoPaciente = 'Evaluado' | 'Hoy' | 'Programado'
export type TipoBusqueda = 'dni' | 'nombre'

export interface Paciente {
  avatar: string
  colorAvatar: string
  diagnostico: string
  dni: string
  edad: number | null
  estado: EstadoPaciente
  fechaCita: string
  horaCita: string
  id: string
  nombre: string
  parentescoTutor: string
  tutor: string
}
