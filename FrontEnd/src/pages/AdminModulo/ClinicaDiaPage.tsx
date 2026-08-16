import { useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react'

import type {
  EstadoSolicitudClinicaDiaApi,
  FiltrosClinicaDiaApi,
  PrioridadClinicaDiaApi,
  ProgramacionClinicaDiaApi,
  SolicitudClinicaDiaApi,
} from '../../api/admin/ClinicaDiaAdminApi'
import HeaderAdminComp from '../../components/HeaderAdminComp'
import IconoMedico from '../../components/IconoMedico'
import AgendaClinicaDiaComp from '../../components/adminMcomp/AgendaClinicaDiaComp'
import {
  ModalAjustarClinicaDiaComp,
  ModalProgramarClinicaDiaComp,
} from '../../components/adminMcomp/ModalesClinicaDiaComp'
import OcupacionClinicaDiaComp from '../../components/adminMcomp/OcupacionClinicaDiaComp'
import PendientesClinicaDiaComp from '../../components/adminMcomp/PendientesClinicaDiaComp'
import ResumenClinicaDiaComp from '../../components/adminMcomp/ResumenClinicaDiaComp'
import useClinicaDia from '../../hooks/useClinicaDia'

function fechaIsoLocal(fecha: Date) {
  return `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}-${String(fecha.getDate()).padStart(2, '0')}`
}

function normalizarFechaHabil(valor: string) {
  const fecha = valor ? new Date(`${valor}T12:00:00`) : new Date()
  while (fecha.getDay() === 0 || fecha.getDay() === 6) fecha.setDate(fecha.getDate() + 1)
  return fechaIsoLocal(fecha)
}

function fechaLocalActual() {
  const fecha = new Date()
  return normalizarFechaHabil(fechaIsoLocal(fecha))
}

function fechaLegible(fecha: string) {
  return new Intl.DateTimeFormat('es-PE', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(`${fecha}T12:00:00`))
}

interface ConfirmacionClinicaDiaProps {
  descripcion: string
  onCancelar: () => void
  onConfirmar: () => Promise<void>
  procesando: boolean
  textoConfirmar: string
  titulo: string
}

function ConfirmacionClinicaDia({
  descripcion,
  onCancelar,
  onConfirmar,
  procesando,
  textoConfirmar,
  titulo,
}: ConfirmacionClinicaDiaProps) {
  return (
    <div aria-labelledby='titulo-confirmacion-clinica' aria-modal='true' className='fixed inset-0 z-[155] grid place-items-center bg-[#071b43]/50 p-4 backdrop-blur-[2px]' role='dialog'>
      <section className='w-full max-w-[440px] rounded-[22px] bg-white p-6 shadow-[0_24px_70px_rgba(7,27,67,0.3)]'>
        <span className='grid h-12 w-12 place-items-center rounded-2xl bg-[#e9f9f9] text-[#079da8]'><IconoMedico className='h-6 w-6' nombre='sparkles' /></span>
        <h2 className='mt-4 text-[18px] font-black text-[#0a2b70]' id='titulo-confirmacion-clinica'>{titulo}</h2>
        <p className='mt-2 text-[10px] font-medium leading-5 text-[#627795]'>{descripcion}</p>
        <div className='mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end'>
          <button className='h-10 cursor-pointer rounded-xl border border-[#d5e1e9] px-5 text-[10px] font-extrabold text-[#586e8b] hover:bg-[#f7fafb]' onClick={onCancelar} type='button'>Cancelar</button>
          <button className='flex h-10 cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#08afb5] to-[#008e9f] px-5 text-[10px] font-extrabold text-white hover:brightness-105 disabled:cursor-wait disabled:opacity-60' disabled={procesando} onClick={() => void onConfirmar()} type='button'><IconoMedico className='h-4 w-4' nombre='check' />{procesando ? 'Procesando...' : textoConfirmar}</button>
        </div>
      </section>
    </div>
  )
}

function ClinicaDiaPage() {
  const [fecha, setFecha] = useState(fechaLocalActual)
  const [busqueda, setBusqueda] = useState('')
  const [busquedaAplicada, setBusquedaAplicada] = useState('')
  const [prioridad, setPrioridad] = useState<PrioridadClinicaDiaApi | ''>('')
  const [procedencia, setProcedencia] = useState('')
  const [estado, setEstado] = useState<EstadoSolicitudClinicaDiaApi | ''>('')
  const [solicitudSeleccionada, setSolicitudSeleccionada] = useState<SolicitudClinicaDiaApi | null>(null)
  const [programacionSeleccionada, setProgramacionSeleccionada] = useState<ProgramacionClinicaDiaApi | null>(null)
  const [ajustando, setAjustando] = useState(false)
  const [confirmacion, setConfirmacion] = useState<'AGENDA' | 'GENERAR' | null>(null)
  const [menuExportacion, setMenuExportacion] = useState(false)
  const inputArchivo = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const temporizador = window.setTimeout(() => setBusquedaAplicada(busqueda.trim()), 350)
    return () => window.clearTimeout(temporizador)
  }, [busqueda])

  const filtros = useMemo<FiltrosClinicaDiaApi>(
    () => ({
      busqueda: busquedaAplicada || undefined,
      estado: estado || undefined,
      fecha,
      prioridad: prioridad || undefined,
      procedencia: procedencia || undefined,
    }),
    [busquedaAplicada, estado, fecha, prioridad, procedencia],
  )
  const clinica = useClinicaDia(filtros)
  const procesando = Boolean(clinica.accionActiva)

  async function importarArchivo(evento: ChangeEvent<HTMLInputElement>) {
    const archivo = evento.target.files?.[0]
    evento.target.value = ''
    if (!archivo) return
    try {
      await clinica.importar(archivo)
    } catch {
      // El aviso global conserva el detalle del backend.
    }
  }

  async function ejecutarConfirmacion() {
    try {
      if (confirmacion === 'GENERAR') await clinica.generarAgenda()
      if (confirmacion === 'AGENDA') await clinica.confirmarAgenda()
      setConfirmacion(null)
    } catch {
      setConfirmacion(null)
    }
  }

  function abrirAjuste(programacion?: ProgramacionClinicaDiaApi) {
    setProgramacionSeleccionada(programacion ?? null)
    setAjustando(true)
  }

  return (
    <div className='min-h-dvh bg-[#f7fafc] text-[#0b2b70]'>
      <HeaderAdminComp />
      <main className='mx-auto w-full max-w-[1460px] px-4 pb-24 pt-4 sm:px-5 lg:px-6'>
        <header className='flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between'>
          <div>
            <h1 className='text-[clamp(26px,2.5vw,35px)] font-black tracking-[-0.04em] text-[#08286f]'>Programación de Clínica de Día</h1>
            <p className='mt-1 max-w-[760px] text-[clamp(9px,.9vw,12px)] font-medium leading-5 text-[#5e7392]'>Organiza automáticamente la agenda de quimioterapia ambulatoria y reduce tiempos de espera para las familias.</p>
          </div>
          <div className='flex flex-wrap items-center gap-2'>
            <label className='flex h-10 items-center gap-2 rounded-xl border border-[#d5e1e9] bg-white px-3 text-[9px] font-extrabold text-[#4b6382]'><IconoMedico className='h-4 w-4 text-[#169da9]' nombre='calendar' /><span className='hidden sm:inline'>Fecha</span><input className='bg-transparent text-[9px] font-extrabold text-[#173777] outline-none' min={fechaLocalActual()} onChange={(evento) => setFecha(normalizarFechaHabil(evento.target.value))} type='date' value={fecha} /></label>
            <button className='flex h-10 cursor-pointer items-center gap-2 rounded-xl border border-[#0aaab3] bg-white px-4 text-[10px] font-extrabold text-[#079da8] transition hover:bg-[#eefafa] disabled:cursor-wait disabled:opacity-60' disabled={procesando} onClick={() => setConfirmacion('GENERAR')} type='button'><IconoMedico className='h-4 w-4' nombre='sparkles' />Generar agenda automática</button>
            <button className='flex h-10 cursor-pointer items-center gap-2 rounded-xl bg-gradient-to-r from-[#08afb5] to-[#008e9f] px-4 text-[10px] font-extrabold text-white shadow-[0_8px_18px_rgba(0,151,162,0.2)] transition hover:brightness-105 disabled:cursor-wait disabled:opacity-60' disabled={procesando} onClick={() => inputArchivo.current?.click()} type='button'><IconoMedico className='h-4 w-4' nombre='upload' />{clinica.accionActiva === 'importar' ? 'Importando...' : 'Importar Excel'}</button>
            <input accept='.xlsx' className='hidden' onChange={(evento) => void importarArchivo(evento)} ref={inputArchivo} type='file' />
          </div>
        </header>

        <div className='mt-3 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[#d9e9f0] bg-white px-3 py-2'>
          <p className='flex items-center gap-2 text-[9px] font-semibold text-[#607590]'><IconoMedico className='h-4 w-4 text-[#2085ca]' nombre='info' />Agenda del <strong className='text-[#173777]'>{fechaLegible(fecha)}</strong>. Importa el Excel institucional o descarga la plantilla validada.</p>
          <button className='flex cursor-pointer items-center gap-1.5 text-[9px] font-black text-[#1378c1] hover:underline disabled:cursor-wait disabled:opacity-60' disabled={procesando} onClick={() => void clinica.descargarPlantilla()} type='button'><IconoMedico className='h-3.5 w-3.5' nombre='download' />Descargar plantilla Excel</button>
        </div>

        {(clinica.mensaje || clinica.error) && (
          <aside className={`mt-3 flex items-start justify-between gap-3 rounded-xl border px-4 py-3 ${clinica.error ? 'border-[#efc4c9] bg-[#fff3f4] text-[#b83f4b]' : 'border-[#bde5cd] bg-[#eefaf2] text-[#188a4e]'}`} role={clinica.error ? 'alert' : 'status'}>
            <span className='flex items-start gap-2 text-[9.5px] font-bold leading-4'><IconoMedico className='mt-0.5 h-4 w-4 shrink-0' nombre={clinica.error ? 'alertTriangle' : 'check'} />{clinica.error || clinica.mensaje}</span>
            <button aria-label='Cerrar aviso' className='grid h-6 w-6 shrink-0 cursor-pointer place-items-center rounded-md hover:bg-white/60' onClick={clinica.limpiarAvisos} type='button'><IconoMedico className='h-3.5 w-3.5' nombre='x' /></button>
          </aside>
        )}

        {clinica.resultadoImportacion && (
          <section className='mt-3 rounded-2xl border border-[#cde5f2] bg-[#f3faff] p-4'>
            <div className='flex flex-wrap items-start justify-between gap-3'>
              <div><strong className='text-[11px] font-black text-[#16457b]'>Resultado de la importación</strong><p className='mt-1 text-[9px] font-medium text-[#627995]'>Lote {clinica.resultadoImportacion.loteId}</p></div>
              <div className='flex flex-wrap gap-2 text-[8.5px] font-extrabold'><span className='rounded-full bg-white px-2.5 py-1 text-[#168a5b]'>{clinica.resultadoImportacion.importadas} importadas</span><span className='rounded-full bg-white px-2.5 py-1 text-[#2479c5]'>{clinica.resultadoImportacion.vinculadas} vinculadas</span><span className='rounded-full bg-white px-2.5 py-1 text-[#aa7626]'>{clinica.resultadoImportacion.duplicadas} duplicadas</span><span className='rounded-full bg-white px-2.5 py-1 text-[#c84450]'>{clinica.resultadoImportacion.rechazadas} rechazadas</span></div>
            </div>
            {clinica.resultadoImportacion.errores.length > 0 && <details className='mt-3 rounded-xl bg-white p-3 text-[9px] text-[#687b94]'><summary className='cursor-pointer font-extrabold text-[#b4424d]'>Ver errores de filas ({clinica.resultadoImportacion.errores.length})</summary><ul className='mt-2 max-h-28 space-y-1 overflow-y-auto'>{clinica.resultadoImportacion.errores.map((item, indice) => <li key={`${item.fila}-${item.campo}-${indice}`}>Fila {item.fila} · {item.campo}: {item.mensaje}</li>)}</ul></details>}
          </section>
        )}

        {clinica.datos ? (
          <>
            <div className='mt-3'><ResumenClinicaDiaComp resumen={clinica.datos.resumen} /></div>
            <div className='mt-3 grid items-start gap-3 xl:grid-cols-[minmax(0,1.48fr)_minmax(350px,0.92fr)]'>
              <div className='space-y-3'>
                <PendientesClinicaDiaComp busqueda={busqueda} cargando={clinica.cargando} estado={estado} onCambiarBusqueda={setBusqueda} onCambiarEstado={setEstado} onCambiarPrioridad={setPrioridad} onCambiarProcedencia={setProcedencia} onProgramar={setSolicitudSeleccionada} pendientes={clinica.datos.pendientes} prioridad={prioridad} procedencia={procedencia} procedencias={clinica.datos.procedencias} />
                <OcupacionClinicaDiaComp onSeleccionarProgramacion={abrirAjuste} turnos={clinica.datos.turnos} />
              </div>
              <AgendaClinicaDiaComp accionActiva={clinica.accionActiva} onActualizarRecordatorio={clinica.actualizarRecordatorio} onAjustar={abrirAjuste} recordatorios={clinica.datos.recordatorios} turnos={clinica.datos.turnos} />
            </div>

            <footer className='mt-4 flex flex-col gap-3 rounded-2xl border border-[#dce7ee] bg-white p-3 shadow-[0_8px_22px_rgba(18,55,89,0.05)] sm:flex-row sm:items-center sm:justify-between'>
              <p className='px-1 text-[9px] font-medium text-[#6e8098]'><strong className='text-[#173777]'>{clinica.datos.resumen.camasOcupadas}</strong> cupos ocupados · <strong className='text-[#16865c]'>{clinica.datos.resumen.camasDisponibles}</strong> disponibles · {clinica.datos.resumen.ocupacionPorcentaje}% de ocupación</p>
              <div className='flex flex-col gap-2 sm:flex-row'>
                <button className='flex h-10 cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#9fcfd5] px-4 text-[10px] font-extrabold text-[#168d9b] hover:bg-[#f0fafa]' onClick={() => abrirAjuste()} type='button'><IconoMedico className='h-4 w-4' nombre='edit' />Ajustar agenda</button>
                <button className='flex h-10 cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#08afb5] to-[#008e9f] px-4 text-[10px] font-extrabold text-white hover:brightness-105 disabled:cursor-wait disabled:opacity-60' disabled={procesando} onClick={() => setConfirmacion('AGENDA')} type='button'><IconoMedico className='h-4 w-4' nombre='check' />Confirmar programación</button>
                <div className='relative'>
                  <button className='flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#2e79c8] px-4 text-[10px] font-extrabold text-[#256fb8] hover:bg-[#f1f7fd] disabled:cursor-wait disabled:opacity-60' disabled={procesando} onClick={() => setMenuExportacion((visible) => !visible)} type='button'><IconoMedico className='h-4 w-4' nombre='download' />Exportar agenda<IconoMedico className='h-3 w-3' nombre='chevronDown' /></button>
                  {menuExportacion && <div className='absolute bottom-12 right-0 z-20 w-40 rounded-xl border border-[#d7e3ea] bg-white p-1.5 shadow-[0_12px_30px_rgba(20,55,85,0.15)]'><button className='w-full cursor-pointer rounded-lg px-3 py-2 text-left text-[9px] font-extrabold text-[#3b587d] hover:bg-[#f2f8fb]' onClick={() => { setMenuExportacion(false); void clinica.exportar('xlsx') }} type='button'>Archivo Excel (.xlsx)</button><button className='w-full cursor-pointer rounded-lg px-3 py-2 text-left text-[9px] font-extrabold text-[#3b587d] hover:bg-[#f2f8fb]' onClick={() => { setMenuExportacion(false); void clinica.exportar('csv') }} type='button'>Archivo CSV (.csv)</button></div>}
                </div>
              </div>
            </footer>
          </>
        ) : (
          <section className='mt-4 grid min-h-[380px] place-items-center rounded-2xl border border-[#dce7ee] bg-white p-6 text-center'>
            <div>{clinica.cargando ? <span className='mx-auto block h-9 w-9 animate-spin rounded-full border-3 border-[#cae8ea] border-t-[#08aab3]' /> : <IconoMedico className='mx-auto h-10 w-10 text-[#9db0c2]' nombre='calendar' />}<strong className='mt-3 block text-[12px] text-[#526b89]'>{clinica.cargando ? 'Cargando programación...' : 'No fue posible cargar la programación.'}</strong>{!clinica.cargando && <button className='mt-3 cursor-pointer text-[10px] font-black text-[#079da8] hover:underline' onClick={() => void clinica.recargar()} type='button'>Reintentar</button>}</div>
          </section>
        )}
      </main>

      {solicitudSeleccionada && clinica.datos && <ModalProgramarClinicaDiaComp fecha={fecha} onAsignar={clinica.programar} onCerrar={() => setSolicitudSeleccionada(null)} procesando={procesando} solicitud={solicitudSeleccionada} turnos={clinica.datos.turnos} />}
      {ajustando && clinica.datos && <ModalAjustarClinicaDiaComp fecha={fecha} onAjustar={clinica.ajustar} onCambiarFecha={(valor) => setFecha(normalizarFechaHabil(valor))} onCancelar={clinica.cancelar} onCerrar={() => setAjustando(false)} onCompletar={clinica.completar} onConfirmar={clinica.confirmar} onConsultarPendientes={clinica.consultarPendientes} onConsultarTurnos={clinica.consultarTurnos} procesando={procesando} programacionInicial={programacionSeleccionada} turnos={clinica.datos.turnos} />}
      {confirmacion && <ConfirmacionClinicaDia descripcion={confirmacion === 'GENERAR' ? `El sistema distribuirá las solicitudes pendientes del ${fechaLegible(fecha)} respetando prioridad, turnos y camas disponibles.` : `Se confirmarán de forma transaccional todos los horarios programados del ${fechaLegible(fecha)}. Los cupos ya confirmados conservarán su estado.`} onCancelar={() => setConfirmacion(null)} onConfirmar={ejecutarConfirmacion} procesando={procesando} textoConfirmar={confirmacion === 'GENERAR' ? 'Generar agenda' : 'Confirmar programación'} titulo={confirmacion === 'GENERAR' ? 'Generar agenda automática' : 'Confirmar agenda del día'} />}
    </div>
  )
}

export default ClinicaDiaPage
