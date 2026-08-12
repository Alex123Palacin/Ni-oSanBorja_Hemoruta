export type EstadoSeguimiento = 'Alerta' | 'En seguimiento'
export type FiltroSeguimiento = 'alertas' | 'documento' | 'medicacion' | 'sintomas' | 'todos' | 'tratamiento'
export type IdCartilla = 'alertas' | 'documentos' | 'pacientes' | 'sintomas'
export type OrigenSeguimiento = 'App móvil' | 'WhatsApp'
export type SemaforoPaciente = 'Amarillo' | 'Rojo' | 'Verde'
export type TipoRegistro = Exclude<FiltroSeguimiento, 'alertas' | 'todos'>

export interface PacienteSeguimiento {
  avatar: string
  colorAvatar: string
  descripcionSemaforo: string
  dni: string
  edad: number | null
  estado: EstadoSeguimiento
  fechaProximaCita: string
  fechaUltimoRegistro: string
  horaProximaCita: string
  horaUltimoRegistro: string
  id: string
  nombre: string
  origen: OrigenSeguimiento
  resumen: string
  semaforo: SemaforoPaciente
  tipoUltimoRegistro: TipoRegistro
}
