import { useMemo, useState } from 'react'
import type {
  DiaCalendarioMedicacionPacienteApi,
  MedicamentoPacienteApi,
  RegistrarTomaMedicamentoPacienteApi,
} from '../../api/paciente/PacienteApi'
import FondoNino from '../../assets/FondoNiño5.png'
import AdaptadoMobil from '../../components/pacienteMcomp/AdaptadoMobil'
import CronogramaSemanalComp, {
  type DiaMedicacionPaciente,
  type EstadoDiaMedicacion,
} from '../../components/pacienteMcomp/CronogramaSemanalComp'
import CumplimientoComp, {
  type DatosCumplimientoPaciente,
  type DatosProximaConsultaPaciente,
} from '../../components/pacienteMcomp/CumplimientoComp'
import DosisHoyComp, {
  type DosisActualPaciente,
  type MotivoNoTomaPaciente,
  type RespuestaDosisPaciente,
} from '../../components/pacienteMcomp/DosisHoyComp'
import MedicacionIndicadaComp, {
  type MedicamentoIndicadoPaciente,
} from '../../components/pacienteMcomp/MedicacionIndicadaComp'
import MenuPaciente from '../../components/pacienteMcomp/MenuPaciente'
import PerfilPacienteNiñoComp, {
  type DatosPerfilPacienteNino,
} from '../../components/pacienteMcomp/PerfilPacienteNiñoComp'
import useDatosInicioPacienteApi from '../../hooks/useDatosInicioPacienteApi'
import useMedicacionPacienteApi from '../../hooks/useMedicacionPacienteApi'
import { formatearEdadPaciente } from '../../utils/paciente'

const TONOS_MEDICAMENTO = ['azul', 'morado', 'verde', 'coral'] as const

const RESPUESTAS_API: Record<
  RespuestaDosisPaciente,
  RegistrarTomaMedicamentoPacienteApi['respuesta']
> = {
  'no-tomada': 'NO_TOMADA',
  tarde: 'TOMADA_TARDE',
  tomada: 'TOMADA',
}

const MOTIVOS_API: Record<
  MotivoNoTomaPaciente,
  NonNullable<RegistrarTomaMedicamentoPacienteApi['motivoNoToma']>
> = {
  malestar: 'MALESTAR',
  olvido: 'OLVIDO',
  otro: 'OTRO',
  'sin-medicamento': 'SIN_MEDICAMENTO',
}

const ESTADOS_CALENDARIO: Record<
  DiaCalendarioMedicacionPacienteApi['estado'],
  EstadoDiaMedicacion
> = {
  COMPLETADO: 'completado',
  HOY_PENDIENTE: 'pendiente-hoy',
  NO_TOMADA: 'no-tomada',
  PARCIAL: 'parcial',
  PENDIENTE: 'pendiente',
  SIN_DOSIS: 'sin-dosis',
}

function fechaLimaIso() {
  const partes = new Intl.DateTimeFormat('en-CA', {
    day: '2-digit',
    month: '2-digit',
    timeZone: 'America/Lima',
    year: 'numeric',
  }).formatToParts(new Date())
  const obtener = (tipo: Intl.DateTimeFormatPartTypes) =>
    partes.find((parte) => parte.type === tipo)?.value ?? ''
  return `${obtener('year')}-${obtener('month')}-${obtener('day')}`
}

function formatearHora(hora: string) {
  const [horas, minutos] = hora.split(':').map(Number)
  if (!Number.isInteger(horas) || !Number.isInteger(minutos)) return hora
  return new Intl.DateTimeFormat('es-PE', {
    hour: '2-digit',
    hour12: true,
    minute: '2-digit',
  }).format(new Date(2026, 0, 1, horas, minutos))
}

function formatearVia(via: string) {
  const normalizada = via.replaceAll('_', ' ').toLocaleLowerCase('es-PE')
  return normalizada
    ? `${normalizada.charAt(0).toLocaleUpperCase('es-PE')}${normalizada.slice(1)}`
    : 'Vía indicada'
}

function etiquetaEstado(ocurrencias: MedicamentoPacienteApi['ocurrencias']) {
  if (ocurrencias.every((ocurrencia) => ocurrencia.estado === 'TOMADA')) return 'Tomado'
  if (ocurrencias.every((ocurrencia) => ['TOMADA', 'TARDE'].includes(ocurrencia.estado))) {
    return 'Completado'
  }
  if (ocurrencias.some((ocurrencia) => ocurrencia.estado === 'OMITIDA')) return 'No tomada'
  if (ocurrencias.some((ocurrencia) => ocurrencia.estado === 'PENDIENTE')) return 'Pendiente'
  return undefined
}

function crearMedicamentoMostrado(
  medicamento: MedicamentoPacienteApi,
  fecha: string,
  indice: number,
): MedicamentoIndicadoPaciente | null {
  const ocurrencias = medicamento.ocurrencias.filter((ocurrencia) => ocurrencia.fecha === fecha)
  if (ocurrencias.length === 0) return null

  return {
    dosis: `${medicamento.dosis} - ${formatearVia(medicamento.via)}`,
    estado: etiquetaEstado(ocurrencias),
    horarios: ocurrencias.map((ocurrencia) => ({
      detalle:
        ocurrencia.estado === 'PENDIENTE'
          ? 'Pendiente'
          : ocurrencia.estado === 'OMITIDA'
            ? 'No tomada'
            : ocurrencia.estado === 'TARDE'
              ? 'Tomada tarde'
              : 'Tomada',
      horaIso: ocurrencia.hora,
      icono: 'clock',
      valor: formatearHora(ocurrencia.hora),
    })),
    id: medicamento.id,
    nombre: medicamento.nombre,
    tono: TONOS_MEDICAMENTO[indice % TONOS_MEDICAMENTO.length],
  }
}

function crearCalendario(
  dias: readonly DiaCalendarioMedicacionPacienteApi[] | undefined,
): DiaMedicacionPaciente[] {
  return (dias ?? []).map((dia) => ({
    dia: Number(dia.fecha.slice(-2)),
    estado: ESTADOS_CALENDARIO[dia.estado],
    fecha: dia.fecha,
  }))
}

function formatearFecha(fechaIso: string, opciones?: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat('es-PE', {
    day: 'numeric',
    month: 'long',
    timeZone: 'America/Lima',
    ...(opciones ?? {}),
  }).format(new Date(`${fechaIso}T12:00:00-05:00`))
}

function detalleCumplimiento(valor: number) {
  if (valor >= 80) return 'Muy bueno'
  if (valor >= 60) return 'En progreso'
  if (valor > 0) return 'Necesita atención'
  return 'Sin registros'
}

function capitalizarEstado(valor: string) {
  const normalizado = valor.replaceAll('_', ' ').trim().toLocaleLowerCase('es-PE')
  return normalizado
    ? `${normalizado.charAt(0).toLocaleUpperCase('es-PE')}${normalizado.slice(1)}`
    : 'Pendiente'
}

function MedicamentosPage() {
  const hoy = fechaLimaIso()
  const [mes, setMes] = useState(hoy.slice(0, 7))
  const [fechaSeleccionada, setFechaSeleccionada] = useState(hoy)
  const [calendarioAbierto, setCalendarioAbierto] = useState(false)
  const [guardandoId, setGuardandoId] = useState<string | null>(null)
  const { datos: datosInicio } = useDatosInicioPacienteApi()
  const {
    cargaFinalizada,
    datos: medicacionApi,
    errorCarga,
    estadoRegistro,
    mensajeRegistro,
    registrarToma,
  } = useMedicacionPacienteApi(mes)

  const calendario = useMemo(
    () => crearCalendario(medicacionApi?.calendario),
    [medicacionApi?.calendario],
  )
  const medicamentos = useMemo(
    () =>
      (medicacionApi?.medicamentos ?? [])
        .map((medicamento, indice) => crearMedicamentoMostrado(medicamento, fechaSeleccionada, indice))
        .filter((medicamento): medicamento is MedicamentoIndicadoPaciente => medicamento !== null),
    [fechaSeleccionada, medicacionApi?.medicamentos],
  )
  const dosisHoy: DosisActualPaciente[] = (medicacionApi?.dosisHoy ?? []).map((dosis) => ({
    dosis: dosis.dosis,
    estado: dosis.estado,
    hora: dosis.hora,
    id: dosis.id,
    medicamentoId: dosis.medicamentoId,
    motivoNoToma: dosis.motivoNoToma,
    nombre: dosis.nombre,
    via: formatearVia(dosis.via),
  }))
  const cumplimiento: DatosCumplimientoPaciente = {
    detalle: detalleCumplimiento(medicacionApi?.cumplimientoSemanal ?? 0),
    etiqueta: 'Cumplimiento semanal',
    valor: medicacionApi?.cumplimientoSemanal ?? 0,
  }
  const proximaConsulta: DatosProximaConsultaPaciente = datosInicio?.proximaCita
    ? {
        fecha: new Intl.DateTimeFormat('es-PE', {
          day: '2-digit',
          month: '2-digit',
          timeZone: 'America/Lima',
          year: 'numeric',
        }).format(new Date(datosInicio.proximaCita.fechaHora)),
        fechaIso: datosInicio.proximaCita.fechaHora,
        titulo: 'Próxima consulta',
      }
    : { fecha: 'Por programar', fechaIso: '', titulo: 'Próxima consulta' }
  const paciente: DatosPerfilPacienteNino | null = datosInicio
    ? {
        edad: formatearEdadPaciente(datosInicio.paciente.edad),
        estado: capitalizarEstado(datosInicio.paciente.estado),
        historiaClinica: datosInicio.paciente.historiaClinica,
        imagen: FondoNino,
        nombre: datosInicio.paciente.nombre,
      }
    : null

  function cambiarMes(nuevoMes: string) {
    setMes(nuevoMes)
    setFechaSeleccionada(nuevoMes === hoy.slice(0, 7) ? hoy : `${nuevoMes}-01`)
  }

  async function registrarRespuesta(
    registroId: string,
    respuesta: RespuestaDosisPaciente,
    motivo?: MotivoNoTomaPaciente,
  ) {
    if (guardandoId || estadoRegistro === 'guardando') return
    setGuardandoId(registroId)
    await registrarToma({
      motivoNoToma: motivo ? MOTIVOS_API[motivo] : undefined,
      ocurrenciaId: registroId,
      respuesta: RESPUESTAS_API[respuesta],
    })
    setGuardandoId(null)
  }

  return (
    <AdaptadoMobil estilos='bg-[#f8fbfd] text-[#082767]'>
      <main className='flex min-h-full w-full flex-col bg-[#f8fbfd]'>
        <div className='mx-1.5 mt-0.5'>
          {paciente ? (
            <PerfilPacienteNiñoComp paciente={paciente} />
          ) : (
            <div className='h-[88px] animate-pulse rounded-xl border border-[#e1e9ef] bg-white' />
          )}
        </div>

        {cargaFinalizada && errorCarga && (
          <p className='mx-2 mt-1 rounded-md bg-[#fff2f2] px-2 py-1 text-center text-[6.7px] font-semibold text-[#b34b53]' role='alert'>
            No se pudo cargar la medicación: {errorCarga}
          </p>
        )}

        <div className='mx-1.5 mt-2'>
          <CumplimientoComp cumplimiento={cumplimiento} proximaConsulta={proximaConsulta} />
        </div>

        <div className='mx-1.5 mt-1.5'>
          <DosisHoyComp
            dosis={dosisHoy}
            fecha={formatearFecha(hoy, { weekday: 'long' })}
            guardandoId={guardandoId}
            mensaje={mensajeRegistro}
            onRegistrar={registrarRespuesta}
          />
        </div>

        <div className='mx-1.5 mt-1.5'>
          <CronogramaSemanalComp
            abierto={calendarioAbierto}
            dias={calendario}
            fechaSeleccionada={fechaSeleccionada}
            mes={mes}
            onAlternar={() => setCalendarioAbierto((abierto) => !abierto)}
            onCambiarMes={cambiarMes}
            onSeleccionarDia={(fecha) => {
              setFechaSeleccionada(fecha)
              setCalendarioAbierto(false)
            }}
          />
        </div>

        <div className='mx-1.5 mt-1.5'>
          <MedicacionIndicadaComp
            medicamentos={medicamentos}
            notaHorario='Horarios en formato 12 h.'
            titulo={`Medicaciones del ${formatearFecha(fechaSeleccionada)}`}
          />
        </div>

        <div className='min-h-[10px] flex-1' />
        <MenuPaciente />
      </main>
    </AdaptadoMobil>
  )
}

export default MedicamentosPage
