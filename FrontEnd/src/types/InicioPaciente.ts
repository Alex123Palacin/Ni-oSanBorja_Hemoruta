export type VistaInicioPaciente =
  | 'resumen'
  | 'datos-personales'
  | 'datos-tutor'
  | 'registrar-cita'

export interface PerfilInicioPaciente {
  edad: string
  estado: string
  historiaClinica: string
  id: string
  imagen: string
  nombre: string
}

export interface DatosPersonalesInicioPaciente {
  apellidos: string
  diagnosticoPrincipal: string
  dni: string
  fechaNacimiento: string
  grupoSanguineo: string
  historiaClinica: string
  nombres: string
  procedencia: string
  sexo: string
}

export interface DatosTutorInicioPaciente {
  correo: string
  direccion: string
  distrito: string
  dni: string
  horarioContacto: string
  nombreCompleto: string
  parentesco: string
  personaAutorizada: string
  preferenciaContacto: PreferenciaContactoPaciente
  telefonoAlterno: string
  telefonoEmergencia: string
  telefonoPrincipal: string
}

export type PreferenciaContactoPaciente = 'llamada' | 'whatsapp' | 'correo'

export interface RegistroCitaInicioPaciente {
  fecha: string
  hora: string
  medico: string
}

export interface ProximaCitaInicioPaciente {
  estado: string
  fecha: string
  fechaIso: string
  hora: string
  horaIso: string
}

export interface OpcionCampoInicioPaciente {
  texto: string
  valor: string
}
