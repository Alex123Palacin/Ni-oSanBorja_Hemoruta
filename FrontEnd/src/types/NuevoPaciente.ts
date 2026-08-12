export type CanalActivacion = 'App móvil' | 'WhatsApp'
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
  historiaClinica: string
}

export interface CredencialesTemporalesPaciente {
  usuario: string
  contrasenaTemporal: string
  requiereCambioContrasena: boolean
  estado: string
}

export interface ResultadoAltaPacienteMedico {
  paciente: {
    id: string
    nombre: string
    dni: string
    historiaClinica: string
    estado: string
    perfilCompleto: boolean
  }
  cuenta: CredencialesTemporalesPaciente
}

export interface FormularioActivacion {
  nombre: string
  dni: string
  telefono: string
  correo: string
  canal: CanalActivacion
}

export type ActualizarFormulario = <Campo extends keyof FormularioActivacion>(
  campo: Campo,
  valor: FormularioActivacion[Campo],
) => void
