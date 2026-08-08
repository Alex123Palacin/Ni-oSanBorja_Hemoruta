export type CanalActivacion = 'WhatsApp' | 'App móvil'
export type PasoActivacion = 1 | 2 | 3

export interface DatosPaciente {
  nombre: string
  dni: string
  tutor: string
  telefono: string
  correo: string
  canal: CanalActivacion
  estado: string
  fechaNacimiento: string
  diagnostico: string
  factorBase: string
  peso: string
  grupoRh: string
  parentesco: string
  dniTutor: string
  direccion: string
  idioma: string
  canalesActivos: CanalActivacion[]
  fechaActivacion: string
  registradoPor: string
}

export interface FormularioActivacion {
  nombre: string
  dni: string
  telefono: string
  correo: string
  canal: CanalActivacion
  copiaCorreo: boolean
}

export type ActualizarFormulario = <Campo extends keyof FormularioActivacion>(
  campo: Campo,
  valor: FormularioActivacion[Campo],
) => void
