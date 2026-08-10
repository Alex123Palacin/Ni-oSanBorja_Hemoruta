import type { NombreIconoMedico } from '../components/IconoMedico'

export interface PerfilFichaPaciente {
  adultoResponsable: string
  cuentaMovil: string
  diagnosticoPrincipal: string
  edad: number
  especialidadMedica: string
  estadoCuenta: string
  historiaClinica: string
  imagen: string
  medicoTratante: string
  nombre: string
  parentescoResponsable: string
  tipoSangre: string
}

export interface DocumentoFichaPaciente {
  fecha: string
  formato: string
  nombre: string
}

export interface DetalleDatoFichaPaciente {
  icono?: NombreIconoMedico
  texto: string
  tono?: 'azul' | 'normal'
}

export interface ItemDatosFichaPaciente {
  detalles?: DetalleDatoFichaPaciente[]
  etiqueta: string
  secundario?: string
  tono?: 'alerta' | 'exito' | 'normal'
  valor: string
}

export interface SeccionDatosFichaPaciente {
  distribucion?: 'contacto' | 'lista'
  icono: NombreIconoMedico
  items: ItemDatosFichaPaciente[]
  titulo: string
}
