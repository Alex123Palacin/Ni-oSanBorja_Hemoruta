export type EstadoRegistroSeguimiento =
  | 'Alerta'
  | 'Cerrado'
  | 'Cumplido'
  | 'En seguimiento'
  | 'Registrado'
  | 'Revisado'

export type FiltroDetalleSeguimiento = 'documento' | 'medicacion' | 'sintomas' | 'todos' | 'tratamiento'
export type OrigenRegistroSeguimiento = 'App móvil' | 'Médico' | 'WhatsApp'
export type TipoRegistroSeguimiento = Exclude<FiltroDetalleSeguimiento, 'todos'>

export interface PerfilSeguimientoPaciente {
  adultoResponsable: string
  diagnostico: string
  edad: number
  estado: string
  fechaProximaCita: string
  historiaClinica: string
  horaProximaCita: string
  imagen: string
  nombre: string
  parentescoResponsable: string
  semaforo: string
  semaforoDescripcion: string
  ultimaSincronizacion: string
}

export interface OpcionFiltroDetalle {
  etiqueta: string
  valor: FiltroDetalleSeguimiento
}

export interface RegistroSeguimientoPaciente {
  estado: EstadoRegistroSeguimiento
  fecha: string
  hora: string
  id: string
  origen: OrigenRegistroSeguimiento
  resumen: string
  tipo: TipoRegistroSeguimiento
}

export interface DocumentoSeguimientoPaciente {
  fecha: string
  id: string
  nombre: string
  origen: Exclude<OrigenRegistroSeguimiento, 'Médico'>
}

export interface ResumenPanelSeguimiento {
  adherenciaGeneral: number
  adherenciaMedicacion: number
  documentos: DocumentoSeguimientoPaciente[]
  dosisOmitida: {
    fecha: string
    hora: string
    medicamento: string
  }
  indicacionesTratamiento: string[]
  medicamentoReciente: {
    fecha: string
    hora: string
    nombre: string
  }
  resumenDocumental: {
    alertas: number
    enSeguimiento: number
    revisados: number
    total: number
  }
  semaforo: string
  semaforoDescripcion: string
  sintomaReciente: {
    conAlerta: number
    descripcion: string
    fecha: string
    hora: string
    sinSintomas: number
    totalReportes: number
  }
}
