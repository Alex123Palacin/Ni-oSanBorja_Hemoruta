import { useEffect, useMemo, useState, type FormEvent } from 'react'

import type {
  AjustarProgramacionClinicaDiaApi,
  ProgramacionClinicaDiaApi,
  ProgramarClinicaDiaApi,
  SolicitudClinicaDiaApi,
  TurnoClinicaDiaApi,
} from '../../api/admin/ClinicaDiaAdminApi'
import IconoMedico from '../IconoMedico'
import { nombreBreveClinicaDia } from '../../utils/nombreClinicaDia'

const claseCampo = 'h-10 w-full rounded-xl border border-[#d5e1e9] bg-white px-3 text-[10px] font-semibold text-[#29496f] outline-none transition focus:border-[#0aaab3] focus:ring-3 focus:ring-[#0aaab3]/10'

function minutosDelTurno(turno: TurnoClinicaDiaApi) {
  const [horaInicio, minutoInicio] = turno.horaInicio.split(':').map(Number)
  const [horaFin, minutoFin] = turno.horaFin.split(':').map(Number)
  return horaFin * 60 + minutoFin - (horaInicio * 60 + minutoInicio)
}

function sumarDias(fecha: string, cantidad: number) {
  const valor = new Date(`${fecha}T12:00:00`)
  do {
    valor.setDate(valor.getDate() + cantidad)
  } while (valor.getDay() === 0 || valor.getDay() === 6)
  return `${valor.getFullYear()}-${String(valor.getMonth() + 1).padStart(2, '0')}-${String(valor.getDate()).padStart(2, '0')}`
}

function fechaHoy() {
  const valor = new Date()
  while (valor.getDay() === 0 || valor.getDay() === 6) valor.setDate(valor.getDate() + 1)
  return `${valor.getFullYear()}-${String(valor.getMonth() + 1).padStart(2, '0')}-${String(valor.getDate()).padStart(2, '0')}`
}

function normalizarFechaHabil(fecha: string) {
  const valor = fecha ? new Date(`${fecha}T12:00:00`) : new Date()
  while (valor.getDay() === 0 || valor.getDay() === 6) valor.setDate(valor.getDate() + 1)
  return `${valor.getFullYear()}-${String(valor.getMonth() + 1).padStart(2, '0')}-${String(valor.getDate()).padStart(2, '0')}`
}

interface ModalProgramarClinicaDiaCompProps {
  fecha: string
  onAsignar: (datos: ProgramarClinicaDiaApi) => Promise<void>
  onCerrar: () => void
  procesando: boolean
  solicitud: SolicitudClinicaDiaApi
  turnos: TurnoClinicaDiaApi[]
}

export function ModalProgramarClinicaDiaComp({
  fecha,
  onAsignar,
  onCerrar,
  procesando,
  solicitud,
  turnos,
}: ModalProgramarClinicaDiaCompProps) {
  const primerTurno = turnos.find(
    (turno) => turno.disponibles > 0 && solicitud.duracionMinutos <= minutosDelTurno(turno),
  )
  const [turno, setTurno] = useState(primerTurno?.codigo ?? '')
  const [cama, setCama] = useState(primerTurno?.camas.find((item) => !item.programacion)?.numero ?? 0)
  const [crearRecordatorio, setCrearRecordatorio] = useState(Boolean(solicitud.telefono))
  const turnoSeleccionado = turnos.find((item) => item.codigo === turno)
  const camasDisponibles = turnoSeleccionado?.camas.filter((item) => !item.programacion) ?? []

  useEffect(() => {
    const siguienteTurno = turnos.find(
      (item) => item.disponibles > 0 && solicitud.duracionMinutos <= minutosDelTurno(item),
    )
    setTurno(siguienteTurno?.codigo ?? '')
    setCama(siguienteTurno?.camas.find((item) => !item.programacion)?.numero ?? 0)
    setCrearRecordatorio(Boolean(solicitud.telefono))
  }, [solicitud.duracionMinutos, solicitud.id, solicitud.telefono, turnos])

  function cambiarTurno(codigo: string) {
    setTurno(codigo)
    const seleccionado = turnos.find((item) => item.codigo === codigo)
    setCama(seleccionado?.camas.find((item) => !item.programacion)?.numero ?? 0)
  }

  async function enviar(evento: FormEvent) {
    evento.preventDefault()
    if (!turnoSeleccionado || solicitud.duracionMinutos > minutosDelTurno(turnoSeleccionado) || cama <= 0) return
    try {
      await onAsignar({ cama, crearRecordatorio, fecha, solicitudId: solicitud.id, turno })
      onCerrar()
    } catch {
      // El error se presenta en el aviso global del tablero.
    }
  }

  return (
    <div aria-labelledby='titulo-programar-clinica' aria-modal='true' className='fixed inset-0 z-[150] grid place-items-center overflow-y-auto bg-[#071b43]/50 p-4 backdrop-blur-[2px]' role='dialog'>
      <form className='w-full max-w-[520px] rounded-[22px] border border-white/60 bg-white p-5 shadow-[0_24px_70px_rgba(7,27,67,0.3)] sm:p-6' onSubmit={(evento) => void enviar(evento)}>
        <header className='flex items-start justify-between gap-4'>
          <div className='flex gap-3'>
            <span className='grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#e9f9f9] text-[#079da8]'><IconoMedico className='h-5 w-5' nombre='calendar' /></span>
            <div>
              <h2 className='text-[18px] font-black text-[#0a2b70]' id='titulo-programar-clinica'>Programar paciente</h2>
              <p className='mt-0.5 text-[9px] font-medium text-[#71839b]'>Asigna un turno y una cama con disponibilidad real.</p>
            </div>
          </div>
          <button aria-label='Cerrar modal' className='grid h-8 w-8 cursor-pointer place-items-center rounded-lg text-[#72839a] hover:bg-[#f1f5f7]' onClick={onCerrar} type='button'><IconoMedico className='h-4 w-4' nombre='x' /></button>
        </header>

        <section className='mt-5 rounded-2xl border border-[#dfe9ee] bg-[#f8fbfc] p-4'>
          <strong className='block text-[12px] font-black text-[#143574]'>{nombreBreveClinicaDia(solicitud.nombreCompleto)}</strong>
          <div className='mt-2 grid gap-2 text-[9px] font-semibold text-[#61758f] sm:grid-cols-2'>
            <span>{solicitud.duracionMinutos} minutos</span>
            <span>Prioridad {solicitud.prioridad.toLowerCase()}</span>
            {solicitud.protocolo && <span className='sm:col-span-2'>{solicitud.protocolo}</span>}
          </div>
        </section>

        <div className='mt-4 grid gap-4 sm:grid-cols-2'>
          <label className='block text-[9px] font-extrabold text-[#28476f]'>Fecha
            <input className={`${claseCampo} mt-1.5 bg-[#f5f8fa]`} readOnly type='date' value={fecha} />
          </label>
          <label className='block text-[9px] font-extrabold text-[#28476f]'>Horario
            <select className={`${claseCampo} mt-1.5 cursor-pointer`} onChange={(evento) => cambiarTurno(evento.target.value)} required value={turno}>
              <option value=''>Selecciona un horario</option>
              {turnos.map((item) => <option disabled={item.disponibles === 0 || solicitud.duracionMinutos > minutosDelTurno(item)} key={item.codigo} value={item.codigo}>{item.horaInicio}–{item.horaFin} · {item.disponibles} disponibles{solicitud.duracionMinutos > minutosDelTurno(item) ? ' · duración no compatible' : ''}</option>)}
            </select>
          </label>
          <label className='block text-[9px] font-extrabold text-[#28476f] sm:col-span-2'>Cama
            <select className={`${claseCampo} mt-1.5 cursor-pointer`} disabled={!turno} onChange={(evento) => setCama(Number(evento.target.value))} required value={cama || ''}>
              <option value=''>Selecciona una cama</option>
              {camasDisponibles.map((item) => <option key={item.numero} value={item.numero}>Cama {item.numero}</option>)}
            </select>
          </label>
        </div>

        <aside className={`mt-4 flex items-center gap-2 rounded-xl border px-3 py-2.5 text-[9px] font-bold ${cama > 0 ? 'border-[#bfe6d5] bg-[#effaf5] text-[#16835c]' : 'border-[#efd6aa] bg-[#fff9ef] text-[#a76c18]'}`}>
          <IconoMedico className='h-4 w-4' nombre={cama > 0 ? 'check' : 'alertTriangle'} />
          {cama > 0 ? `Cama ${cama} disponible en el horario seleccionado.` : 'Selecciona un horario con camas disponibles.'}
        </aside>

        <label className={`mt-4 flex cursor-pointer items-start gap-3 rounded-xl border border-[#dfe9ee] p-3 ${!solicitud.telefono ? 'cursor-not-allowed opacity-60' : ''}`}>
          <input checked={crearRecordatorio} className='mt-0.5 h-4 w-4 accent-[#09a9b0]' disabled={!solicitud.telefono} onChange={(evento) => setCrearRecordatorio(evento.target.checked)} type='checkbox' />
          <span><strong className='flex items-center gap-1.5 text-[10px] font-extrabold text-[#173777]'><IconoMedico className='h-4 w-4 text-[#14a34e]' nombre='whatsapp' />Preparar recordatorio por WhatsApp</strong><span className='mt-0.5 block text-[8.5px] font-medium leading-4 text-[#72839a]'>{solicitud.telefono ? `Se registrará para ${solicitud.telefono}.` : 'El paciente no tiene un teléfono registrado.'}</span></span>
        </label>

        <footer className='mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end'>
          <button className='h-10 cursor-pointer rounded-xl border border-[#d5e1e9] px-5 text-[10px] font-extrabold text-[#586e8b] hover:bg-[#f7fafb]' onClick={onCerrar} type='button'>Cancelar</button>
          <button className='flex h-10 cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#08afb5] to-[#008e9f] px-5 text-[10px] font-extrabold text-white shadow-[0_8px_18px_rgba(0,151,162,0.2)] hover:brightness-105 disabled:cursor-wait disabled:opacity-60' disabled={procesando || !turnoSeleccionado || solicitud.duracionMinutos > minutosDelTurno(turnoSeleccionado) || cama <= 0} type='submit'><IconoMedico className='h-4 w-4' nombre='check' />{procesando ? 'Asignando...' : 'Asignar horario'}</button>
        </footer>
      </form>
    </div>
  )
}

interface ModalAjustarClinicaDiaCompProps {
  fecha: string
  onAjustar: (programacionId: string, datos: AjustarProgramacionClinicaDiaApi) => Promise<void>
  onCambiarFecha: (fecha: string) => void
  onCancelar: (programacionId: string, motivo: string, reprogramar: boolean) => Promise<void>
  onCerrar: () => void
  onConfirmar: (programacionId: string) => Promise<void>
  onCompletar: (programacionId: string) => Promise<void>
  onConsultarPendientes: () => Promise<SolicitudClinicaDiaApi[]>
  onConsultarTurnos: (fecha: string) => Promise<TurnoClinicaDiaApi[]>
  procesando: boolean
  programacionInicial: ProgramacionClinicaDiaApi | null
  turnos: TurnoClinicaDiaApi[]
}

export function ModalAjustarClinicaDiaComp({
  fecha,
  onAjustar,
  onCambiarFecha,
  onCancelar,
  onCerrar,
  onConfirmar,
  onCompletar,
  onConsultarPendientes,
  onConsultarTurnos,
  procesando,
  programacionInicial,
  turnos,
}: ModalAjustarClinicaDiaCompProps) {
  const programaciones = useMemo(
    () => turnos.flatMap((turno) => turno.camas.map((cama) => cama.programacion)).filter((programacion): programacion is ProgramacionClinicaDiaApi => Boolean(programacion)),
    [turnos],
  )
  const [programacionId, setProgramacionId] = useState(programacionInicial?.id ?? '')
  const programacion =
    programaciones.find((item) => item.id === programacionId) ??
    (programacionInicial?.id === programacionId ? programacionInicial : null)
  const [accion, setAccion] = useState<'AJUSTAR' | 'CANCELAR'>('AJUSTAR')
  const [turno, setTurno] = useState(programacionInicial?.turno ?? '')
  const [cama, setCama] = useState(programacionInicial?.cama ?? 0)
  const [fechaDestino, setFechaDestino] = useState(programacionInicial?.fecha ?? fecha)
  const [turnosDestino, setTurnosDestino] = useState<TurnoClinicaDiaApi[]>(turnos)
  const [cargandoDisponibilidad, setCargandoDisponibilidad] = useState(false)
  const [errorDisponibilidad, setErrorDisponibilidad] = useState('')
  const [colaPendientes, setColaPendientes] = useState<SolicitudClinicaDiaApi[]>([])
  const [cargandoPendientes, setCargandoPendientes] = useState(true)
  const [errorPendientes, setErrorPendientes] = useState('')
  const [motivo, setMotivo] = useState('Ajuste administrativo de agenda')
  const [solicitudId, setSolicitudId] = useState('')
  const [reprogramar, setReprogramar] = useState(true)
  const [crearRecordatorio, setCrearRecordatorio] = useState(Boolean(programacionInicial?.solicitud.telefono) && programacionInicial?.recordatorioEstado !== 'NO_REQUERIDO')
  const solicitudReemplazo = colaPendientes.find((item) => item.id === solicitudId)
  const duracionAProgramar =
    solicitudReemplazo?.duracionMinutos ?? programacion?.solicitud.duracionMinutos ?? 0
  const telefonoRecordatorio =
    solicitudReemplazo?.telefono ?? programacion?.solicitud.telefono ?? ''
  const esEditable =
    programacion?.estado === 'PROGRAMADA' || programacion?.estado === 'CONFIRMADA'

  useEffect(() => {
    const vigente = programaciones.find((item) => item.id === programacionId)
    if (vigente || programacionInicial?.id === programacionId) return
    const siguiente = programaciones[0] ?? null
    setProgramacionId(siguiente?.id ?? '')
  }, [programacionId, programacionInicial, programaciones])

  useEffect(() => {
    if (!programacion) return
    setTurno(programacion.turno)
    setCama(programacion.cama)
    setFechaDestino(programacion.fecha)
    setAccion('AJUSTAR')
    setCrearRecordatorio(Boolean(programacion.solicitud.telefono) && programacion.recordatorioEstado !== 'NO_REQUERIDO')
    setSolicitudId('')
  }, [programacion])

  useEffect(() => {
    let vigente = true
    if (fechaDestino === fecha) {
      setTurnosDestino(turnos)
      setErrorDisponibilidad('')
      return () => {
        vigente = false
      }
    }
    setCargandoDisponibilidad(true)
    setErrorDisponibilidad('')
    void onConsultarTurnos(fechaDestino)
      .then((respuesta) => {
        if (vigente) setTurnosDestino(respuesta)
      })
      .catch(() => {
        if (vigente) {
          setTurnosDestino([])
          setErrorDisponibilidad('No se pudo consultar la disponibilidad de la fecha destino.')
        }
      })
      .finally(() => {
        if (vigente) setCargandoDisponibilidad(false)
      })
    return () => {
      vigente = false
    }
  }, [fecha, fechaDestino, onConsultarTurnos, turnos])

  useEffect(() => {
    let vigente = true
    setCargandoPendientes(true)
    setErrorPendientes('')
    void onConsultarPendientes()
      .then((respuesta) => {
        if (vigente) setColaPendientes(respuesta.filter((item) => item.estado === 'PENDIENTE'))
      })
      .catch(() => {
        if (vigente) {
          setColaPendientes([])
          setErrorPendientes('No se pudo cargar la cola de pacientes pendientes.')
        }
      })
      .finally(() => {
        if (vigente) setCargandoPendientes(false)
      })
    return () => {
      vigente = false
    }
  }, [onConsultarPendientes])

  const turnoSeleccionado = turnosDestino.find((item) => item.codigo === turno)
  const camasDisponibles = turnoSeleccionado?.camas.filter((item) => !item.programacion || item.programacion.id === programacion?.id) ?? []

  useEffect(() => {
    if (cargandoDisponibilidad || turnosDestino.length === 0) return
    const turnoVigente = turnosDestino.find(
      (item) => item.codigo === turno && duracionAProgramar <= minutosDelTurno(item),
    )
    const disponiblesVigentes = turnoVigente?.camas.filter(
      (item) => !item.programacion || item.programacion.id === programacion?.id,
    ) ?? []
    if (turnoVigente && disponiblesVigentes.some((item) => item.numero === cama)) return
    const siguienteTurno = turnosDestino.find((item) =>
      duracionAProgramar <= minutosDelTurno(item) &&
      item.camas.some((camaTurno) => !camaTurno.programacion || camaTurno.programacion.id === programacion?.id),
    )
    const siguienteCama = siguienteTurno?.camas.find(
      (item) => !item.programacion || item.programacion.id === programacion?.id,
    )
    setTurno(siguienteTurno?.codigo ?? '')
    setCama(siguienteCama?.numero ?? 0)
  }, [cama, cargandoDisponibilidad, duracionAProgramar, programacion?.id, turno, turnosDestino])

  function cambiarTurno(codigo: string) {
    setTurno(codigo)
    const siguiente = turnosDestino.find((item) => item.codigo === codigo)?.camas.find((item) => !item.programacion || item.programacion.id === programacion?.id)
    setCama(siguiente?.numero ?? 0)
  }

  function cambiarFechaDestino(valor: string) {
    const siguiente = normalizarFechaHabil(valor)
    setFechaDestino(siguiente)
  }

  function cambiarSolicitudReemplazo(valor: string) {
    setSolicitudId(valor)
    const siguiente = colaPendientes.find((item) => item.id === valor)
    setCrearRecordatorio(Boolean(siguiente?.telefono ?? programacion?.solicitud.telefono))
  }

  async function guardar() {
    if (!programacion || !motivo.trim()) return
    try {
      if (accion === 'CANCELAR') {
        await onCancelar(programacion.id, motivo.trim(), reprogramar)
      } else {
        await onAjustar(programacion.id, {
          cama,
          crearRecordatorio,
          fecha: fechaDestino,
          motivo: motivo.trim(),
          solicitudId: solicitudId || undefined,
          turno,
        })
      }
      onCerrar()
    } catch {
      // El aviso global conserva el detalle del backend.
    }
  }

  async function confirmar() {
    if (!programacion) return
    try {
      await onConfirmar(programacion.id)
      onCerrar()
    } catch {
      // El aviso global conserva el detalle del backend.
    }
  }

  async function completar() {
    if (!programacion) return
    try {
      await onCompletar(programacion.id)
      onCerrar()
    } catch {
      // El aviso global conserva el detalle del backend.
    }
  }

  return (
    <div aria-labelledby='titulo-ajustar-clinica' aria-modal='true' className='fixed inset-0 z-[150] overflow-y-auto bg-[#071b43]/50 p-3 backdrop-blur-[2px] sm:p-5' role='dialog'>
      <section className='mx-auto my-2 w-full max-w-[920px] rounded-[22px] bg-white shadow-[0_24px_70px_rgba(7,27,67,0.3)]'>
        <header className='flex items-start justify-between gap-4 border-b border-[#e2ebf0] px-5 py-4 sm:px-6'>
          <div><h2 className='text-[18px] font-black text-[#0a2b70]' id='titulo-ajustar-clinica'>Ajustar agenda</h2><p className='mt-0.5 text-[9px] font-medium text-[#71839a]'>Revisa la fecha, libera un cupo o reasígnalo sin perder trazabilidad.</p></div>
          <button aria-label='Cerrar modal' className='grid h-8 w-8 cursor-pointer place-items-center rounded-lg text-[#71829a] hover:bg-[#f1f5f7]' onClick={onCerrar} type='button'><IconoMedico className='h-4 w-4' nombre='x' /></button>
        </header>

        <div className='border-b border-[#e2ebf0] bg-[#f8fbfc] px-5 py-3 sm:px-6'>
          <div className='flex flex-wrap items-center justify-center gap-2'>
            <button aria-label='Día anterior' className='grid h-9 w-9 cursor-pointer place-items-center rounded-xl border border-[#d5e1e9] bg-white text-[#476181] hover:border-[#0aaab3] disabled:cursor-not-allowed disabled:opacity-40' disabled={fecha <= fechaHoy()} onClick={() => onCambiarFecha(sumarDias(fecha, -1))} type='button'><IconoMedico className='h-4 w-4 rotate-180' nombre='arrowRight' /></button>
            <input className='h-9 rounded-xl border border-[#d5e1e9] bg-white px-3 text-[10px] font-extrabold text-[#173777] outline-none focus:border-[#0aaab3]' min={fechaHoy()} onChange={(evento) => onCambiarFecha(evento.target.value)} type='date' value={fecha} />
            <button aria-label='Día siguiente' className='grid h-9 w-9 cursor-pointer place-items-center rounded-xl border border-[#d5e1e9] bg-white text-[#476181] hover:border-[#0aaab3]' onClick={() => onCambiarFecha(sumarDias(fecha, 1))} type='button'><IconoMedico className='h-4 w-4' nombre='arrowRight' /></button>
            <button className='h-9 cursor-pointer rounded-xl border border-[#9fd9dc] bg-white px-3 text-[9px] font-black text-[#079da8] hover:bg-[#eefafa]' onClick={() => onCambiarFecha(fechaHoy())} type='button'>Hoy</button>
          </div>
        </div>

        <div className='grid min-h-[420px] lg:grid-cols-[310px_1fr]'>
          <aside className='border-b border-[#e2ebf0] p-4 lg:border-b-0 lg:border-r'>
            <h3 className='text-[11px] font-black text-[#173777]'>Programados en la fecha</h3>
            <div className='mt-3 max-h-[345px] space-y-2 overflow-y-auto pr-1'>
              {programaciones.length > 0 ? programaciones.map((item) => (
                <button className={`w-full cursor-pointer rounded-xl border p-3 text-left transition ${item.id === programacionId ? 'border-[#0aaab3] bg-[#eefafa]' : 'border-[#e1eaf0] hover:border-[#9fd7da]'}`} key={item.id} onClick={() => setProgramacionId(item.id)} type='button'>
                  <span className='flex items-center justify-between gap-2'><strong className='truncate text-[10px] font-extrabold text-[#153675]'>{nombreBreveClinicaDia(item.solicitud.nombreCompleto)}</strong><span className='shrink-0 rounded-lg bg-white px-2 py-1 text-[8px] font-black text-[#16889a]'>C{item.cama}</span></span>
                  <span className='mt-1 block text-[8.5px] font-medium text-[#71839a]'>{item.horaInicio}–{item.horaFin} · {item.estado.toLowerCase()}</span>
                </button>
              )) : <p className='rounded-xl border border-dashed border-[#d7e3ea] px-3 py-7 text-center text-[9px] font-semibold text-[#8494a7]'>No hay pacientes programados para esta fecha.</p>}
            </div>
          </aside>

          <div className='p-4 sm:p-5'>
            {programacion ? (
              <>
                <div className='flex flex-wrap items-center justify-between gap-3'>
                  <div><span className='text-[8px] font-black uppercase tracking-[0.1em] text-[#079da8]'>Paciente seleccionado</span><strong className='mt-1 block text-[13px] font-black text-[#143574]'>{nombreBreveClinicaDia(programacion.solicitud.nombreCompleto)}</strong></div>
                  <select className='h-9 cursor-pointer rounded-xl border border-[#d5e1e9] bg-white px-3 text-[9px] font-extrabold text-[#29496f] disabled:cursor-not-allowed disabled:bg-[#f3f6f8] disabled:text-[#8493a5]' disabled={!esEditable} onChange={(evento) => setAccion(evento.target.value as 'AJUSTAR' | 'CANCELAR')} value={accion}><option value='AJUSTAR'>{esEditable ? 'Cambiar asignación' : 'Atención completada'}</option>{esEditable && <option value='CANCELAR'>Cancelar y liberar</option>}</select>
                </div>

                {!esEditable ? (
                  <aside className='mt-5 flex items-start gap-3 rounded-2xl border border-[#bfe4cf] bg-[#effaf4] p-4 text-[#267558]'><span className='grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white'><IconoMedico className='h-5 w-5' nombre='check' /></span><span><strong className='block text-[11px] font-black'>Atención completada</strong><span className='mt-1 block text-[9px] font-medium leading-4'>Este registro se conserva como evidencia y ya no admite ajustes ni cancelaciones.</span></span></aside>
                ) : accion === 'AJUSTAR' ? (
                  <div className='mt-4 grid gap-4 sm:grid-cols-2'>
                    <label className='text-[9px] font-extrabold text-[#28476f]'>Nueva fecha<input className={`${claseCampo} mt-1.5`} min={fechaHoy()} onChange={(evento) => cambiarFechaDestino(evento.target.value)} type='date' value={fechaDestino} /></label>
                    <label className='text-[9px] font-extrabold text-[#28476f]'>Horario<select className={`${claseCampo} mt-1.5 cursor-pointer`} disabled={cargandoDisponibilidad || turnosDestino.length === 0} onChange={(evento) => cambiarTurno(evento.target.value)} value={turno}>{turnosDestino.map((item) => <option disabled={duracionAProgramar > minutosDelTurno(item)} key={item.codigo} value={item.codigo}>{item.horaInicio}–{item.horaFin} · {item.disponibles} libres{duracionAProgramar > minutosDelTurno(item) ? ' · duración no compatible' : ''}</option>)}</select></label>
                    <label className='text-[9px] font-extrabold text-[#28476f] sm:col-span-2'>Cama<select className={`${claseCampo} mt-1.5 cursor-pointer`} disabled={cargandoDisponibilidad || camasDisponibles.length === 0} onChange={(evento) => setCama(Number(evento.target.value))} value={camasDisponibles.some((item) => item.numero === cama) ? cama : ''}><option value=''>{cargandoDisponibilidad ? 'Consultando disponibilidad...' : 'Selecciona una cama disponible'}</option>{camasDisponibles.map((item) => <option key={item.numero} value={item.numero}>Cama {item.numero}</option>)}</select></label>
                    {errorDisponibilidad && <p className='text-[8.5px] font-bold text-[#bd4350] sm:col-span-2'>{errorDisponibilidad}</p>}
                    <label className='text-[9px] font-extrabold text-[#28476f] sm:col-span-2'>Reasignar este cupo a un paciente en espera (opcional)<select className={`${claseCampo} mt-1.5 cursor-pointer`} disabled={cargandoPendientes} onChange={(evento) => cambiarSolicitudReemplazo(evento.target.value)} value={solicitudId}><option value=''>{cargandoPendientes ? 'Cargando pacientes pendientes...' : `Mantener a ${nombreBreveClinicaDia(programacion.solicitud.nombreCompleto)}`}</option>{colaPendientes.map((item) => <option key={item.id} value={item.id}>{nombreBreveClinicaDia(item.nombreCompleto)} · {item.prioridad}</option>)}</select></label>
                    {errorPendientes && <p className='text-[8.5px] font-bold text-[#bd4350] sm:col-span-2'>{errorPendientes}</p>}
                    <label className={`flex cursor-pointer items-center gap-2 rounded-xl border border-[#dfe8ee] p-3 text-[9px] font-extrabold text-[#29496f] sm:col-span-2 ${!telefonoRecordatorio ? 'cursor-not-allowed opacity-55' : ''}`}><input checked={crearRecordatorio} className='h-4 w-4 accent-[#10a54d]' disabled={!telefonoRecordatorio} onChange={(evento) => setCrearRecordatorio(evento.target.checked)} type='checkbox' /><IconoMedico className='h-4 w-4 text-[#13a04d]' nombre='whatsapp' />{telefonoRecordatorio ? `Preparar recordatorio para ${telefonoRecordatorio}` : 'Sin teléfono para recordatorio'}</label>
                  </div>
                ) : (
                  <label className='mt-4 flex cursor-pointer items-start gap-3 rounded-xl border border-[#f0d6ab] bg-[#fff9ef] p-3'><input checked={reprogramar} className='mt-0.5 h-4 w-4 accent-[#e48b1c]' onChange={(evento) => setReprogramar(evento.target.checked)} type='checkbox' /><span><strong className='block text-[10px] font-extrabold text-[#9b631b]'>Regresar la solicitud a pendientes</strong><span className='mt-0.5 block text-[8.5px] font-medium leading-4 text-[#8b7452]'>Permite reprogramar al paciente más adelante y libera esta cama.</span></span></label>
                )}

                {esEditable && <label className='mt-4 block text-[9px] font-extrabold text-[#28476f]'>Motivo del ajuste<textarea className='mt-1.5 min-h-20 w-full resize-y rounded-xl border border-[#d5e1e9] px-3 py-2.5 text-[10px] font-medium text-[#29496f] outline-none focus:border-[#0aaab3]' maxLength={250} onChange={(evento) => setMotivo(evento.target.value)} value={motivo} /></label>}

                {esEditable && <aside className='mt-4 flex gap-2 rounded-xl border border-[#cfe6f4] bg-[#f1f9fd] p-3 text-[8.5px] font-medium leading-4 text-[#496b8f]'><IconoMedico className='mt-0.5 h-4 w-4 shrink-0 text-[#2086ca]' nombre='info' /><span>{accion === 'CANCELAR' ? `Se liberará la cama ${programacion.cama} del turno ${programacion.turnoEtiqueta}.` : solicitudId ? 'El reemplazo se realizará de forma atómica y el paciente actual volverá a la cola según la regla del servidor.' : `La atención quedará el ${fechaDestino} en la cama ${cama} del horario seleccionado.`}</span></aside>}
              </>
            ) : <div className='grid min-h-[320px] place-items-center text-center'><div><IconoMedico className='mx-auto h-9 w-9 text-[#9bafc1]' nombre='calendar' /><strong className='mt-2 block text-[11px] text-[#526b8a]'>Selecciona una programación para editarla.</strong></div></div>}
          </div>
        </div>

        <footer className='flex flex-col-reverse gap-2 border-t border-[#e2ebf0] px-5 py-4 sm:flex-row sm:justify-end sm:px-6'>
          <button className='h-10 cursor-pointer rounded-xl border border-[#d5e1e9] px-4 text-[10px] font-extrabold text-[#5b708d] hover:bg-[#f7fafb]' onClick={onCerrar} type='button'>Cerrar</button>
          {programacion?.estado === 'PROGRAMADA' && <button className='flex h-10 cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#0aaab3] px-4 text-[10px] font-extrabold text-[#079da8] hover:bg-[#eefafa] disabled:cursor-wait disabled:opacity-60' disabled={procesando} onClick={() => void confirmar()} type='button'><IconoMedico className='h-4 w-4' nombre='check' />Confirmar horario</button>}
          {programacion?.estado === 'CONFIRMADA' && <button className='flex h-10 cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#31a56b] px-4 text-[10px] font-extrabold text-[#218a5d] hover:bg-[#effaf4] disabled:cursor-wait disabled:opacity-60' disabled={procesando} onClick={() => void completar()} type='button'><IconoMedico className='h-4 w-4' nombre='check' />Completar atención</button>}
          {esEditable && <button className={`flex h-10 cursor-pointer items-center justify-center gap-2 rounded-xl px-5 text-[10px] font-extrabold text-white disabled:cursor-wait disabled:opacity-60 ${accion === 'CANCELAR' ? 'bg-[#d94a56]' : 'bg-gradient-to-r from-[#08afb5] to-[#008e9f]'}`} disabled={procesando || !programacion || !motivo.trim() || (accion === 'AJUSTAR' && (cargandoDisponibilidad || !turnoSeleccionado || duracionAProgramar > minutosDelTurno(turnoSeleccionado) || !camasDisponibles.some((item) => item.numero === cama)))} onClick={() => void guardar()} type='button'><IconoMedico className='h-4 w-4' nombre={accion === 'CANCELAR' ? 'trash' : 'save'} />{procesando ? 'Guardando...' : accion === 'CANCELAR' ? 'Cancelar programación' : 'Guardar ajustes'}</button>}
        </footer>
      </section>
    </div>
  )
}
