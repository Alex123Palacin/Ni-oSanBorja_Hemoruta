import { useState } from 'react'
import FondoNino from '../../assets/FondoNiño5.png'
import AdaptadoMobil from '../../components/pacienteMcomp/AdaptadoMobil'
import CronogramaSemanalComp, {
  type DiaMedicacionPaciente,
} from '../../components/pacienteMcomp/CronogramaSemanalComp'
import CumplimientoComp, {
  type DatosCumplimientoPaciente,
  type DatosProximaConsultaPaciente,
} from '../../components/pacienteMcomp/CumplimientoComp'
import DosisHoyComp, {
  type MotivoNoTomaPaciente,
  type OpcionMotivoDosisPaciente,
  type OpcionRespuestaDosisPaciente,
  type RespuestaDosisPaciente,
} from '../../components/pacienteMcomp/DosisHoyComp'
import MedicacionIndicadaComp, {
  type MedicamentoIndicadoPaciente,
} from '../../components/pacienteMcomp/MedicacionIndicadaComp'
import MenuPaciente from '../../components/pacienteMcomp/MenuPaciente'
import PerfilPacienteNiñoComp, {
  type DatosPerfilPacienteNino,
} from '../../components/pacienteMcomp/PerfilPacienteNiñoComp'

const PACIENTE: DatosPerfilPacienteNino = {
  edad: '8 años',
  estado: 'Activo',
  historiaClinica: 'HC-2024-01568',
  imagen: FondoNino,
  nombre: 'Mateo Gabriel Flores',
}

const PROXIMA_CONSULTA: DatosProximaConsultaPaciente = {
  fecha: '24/05/2024',
  fechaIso: '2024-05-24',
  titulo: 'Próxima consulta',
}

const CUMPLIMIENTO: DatosCumplimientoPaciente = {
  detalle: 'Muy bueno',
  etiqueta: 'Cumplimiento semanal',
  valor: 86,
}

const DIAS_MEDICACION: readonly DiaMedicacionPaciente[] = [
  { dia: 'L', estado: 'completado', id: 'lunes', nombre: 'Lunes' },
  { dia: 'M', estado: 'completado', id: 'martes', nombre: 'Martes' },
  { dia: 'M', estado: 'pendiente-hoy', id: 'miercoles', nombre: 'Miércoles' },
  { dia: 'J', estado: 'completado', id: 'jueves', nombre: 'Jueves' },
  { dia: 'V', estado: 'completado', id: 'viernes', nombre: 'Viernes' },
  { dia: 'S', estado: 'pendiente', id: 'sabado', nombre: 'Sábado' },
  { dia: 'D', estado: 'sin-dosis', id: 'domingo', nombre: 'Domingo' },
]

const MEDICAMENTOS: readonly MedicamentoIndicadoPaciente[] = [
  {
    dosis: '1 tableta - Oral',
    estado: 'Hoy pendiente',
    horarios: [{ detalle: 'Diaria', horaIso: '08:00', icono: 'clock', valor: '08:00 a. m.' }],
    id: 'prednisona',
    nombre: 'Prednisona 10 mg',
    tono: 'azul',
  },
  {
    dosis: '1 cápsula - Oral',
    estado: 'Hoy pendiente',
    horarios: [{ detalle: 'Diaria', horaIso: '13:00', icono: 'clock', valor: '01:00 p. m.' }],
    id: 'omeprazol',
    nombre: 'Omeprazol 20 mg',
    tono: 'morado',
  },
  {
    dosis: '1 tableta - Oral',
    estado: 'Hoy pendiente',
    horarios: [{ detalle: 'Diaria', horaIso: '20:00', icono: 'clock', valor: '08:00 p. m.' }],
    id: 'acido-folico',
    nombre: 'Ácido fólico',
    tono: 'verde',
  },
  {
    dosis: '1 tableta - Oral',
    horarios: [
      { detalle: 'Días indicados', icono: 'calendar', valor: 'Lun, mié, vie' },
      { detalle: '', horaIso: '09:00', icono: 'clock', valor: '09:00 a. m.' },
    ],
    id: 'sulfato-ferroso',
    nombre: 'Sulfato ferroso',
    tono: 'coral',
  },
]

const DOSIS_HOY = {
  fecha: 'Lunes, 20 de mayo',
  fechaIso: '2024-05-20',
  informacion: 'Este cronograma se actualiza según las indicaciones registradas por el doctor.',
  medicamentoId: 'prednisona',
  preguntaMotivo: 'Si no la tomó, cuéntanos el motivo:',
  registroId: 'dosis-2024-05-20-prednisona',
  titulo: 'Dosis de hoy',
} as const

const OPCIONES_DOSIS: readonly OpcionRespuestaDosisPaciente[] = [
  { icono: 'check', texto: 'Sí la tomó', tono: 'verde', valor: 'tomada' },
  { icono: 'clock', texto: 'La tomó tarde', tono: 'naranja', valor: 'tarde' },
  { icono: 'x', texto: 'No la tomó', tono: 'rojo', valor: 'no-tomada' },
]

const MOTIVOS_NO_TOMA: readonly OpcionMotivoDosisPaciente[] = [
  { texto: 'Olvidó', valor: 'olvido' },
  { texto: 'No había medicamento', valor: 'sin-medicamento' },
  { texto: 'Malestar', valor: 'malestar' },
  { texto: 'Otro', valor: 'otro' },
]

function MedicamentosPage() {
  const [respuestaDosis, setRespuestaDosis] = useState<RespuestaDosisPaciente | null>(null)
  const [motivoNoToma, setMotivoNoToma] = useState<MotivoNoTomaPaciente | null>(null)

  function registrarRespuesta(registroId: string, respuesta: RespuestaDosisPaciente) {
    if (registroId !== DOSIS_HOY.registroId) return
    setRespuestaDosis(respuesta)

    if (respuesta !== 'no-tomada') {
      setMotivoNoToma(null)
    }
  }

  function registrarMotivo(registroId: string, motivo: MotivoNoTomaPaciente) {
    if (registroId === DOSIS_HOY.registroId) {
      setMotivoNoToma(motivo)
    }
  }

  return (
    <AdaptadoMobil estilos='bg-[#f8fbfd] text-[#082767]'>
      <main className='flex min-h-full w-full flex-col bg-[#f8fbfd]'>
        <div className='mx-1.5 mt-0.5'>
          <PerfilPacienteNiñoComp paciente={PACIENTE} />
        </div>

        <div className='mx-1.5 mt-2'>
          <CumplimientoComp cumplimiento={CUMPLIMIENTO} proximaConsulta={PROXIMA_CONSULTA} />
        </div>

        <div className='mx-1.5 mt-1.5'>
          <CronogramaSemanalComp dias={DIAS_MEDICACION} />
        </div>

        <div className='mx-1.5 mt-1.5'>
          <MedicacionIndicadaComp
            medicamentos={MEDICAMENTOS}
            notaHorario='Horarios en formato 12 h.'
            titulo='Medicaciones indicadas'
          />
        </div>

        <div className='mx-1.5 mt-[3px]'>
          <DosisHoyComp
            {...DOSIS_HOY}
            motivo={motivoNoToma}
            motivos={MOTIVOS_NO_TOMA}
            onMotivo={registrarMotivo}
            onRespuesta={registrarRespuesta}
            opciones={OPCIONES_DOSIS}
            respuesta={respuestaDosis}
          />
        </div>

        <div className='min-h-[10px] flex-1' />
        <MenuPaciente />
      </main>
    </AdaptadoMobil>
  )
}

export default MedicamentosPage
