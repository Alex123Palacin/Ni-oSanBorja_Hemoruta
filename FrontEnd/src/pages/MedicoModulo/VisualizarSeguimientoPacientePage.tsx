import { useEffect, useMemo, useState } from 'react'

import fondoPaciente from '../../assets/FondoNiño5.png'
import {
  obtenerFichaPacienteMedicoApi,
  obtenerSeguimientoPacienteMedicoApi,
  type FichaPacienteMedicoApi,
  type RegistroSeguimientoMedicoApi,
} from '../../api/medico/MedicoApi'
import HeaderDoctorMedicoComp from '../../components/HeaderDoctorMedicoComp'
import MenuMedicoComp from '../../components/MenuMedicoComp'
import PanelLateralSeguimientoComp from '../../components/PanelLateralSeguimientoComp'
import PerfilSeguimientoPacienteComp from '../../components/PerfilSeguimientoPacienteComp'
import RegistrosSeguimientoComp from '../../components/RegistrosSeguimientoComp'
import useRedirrecion from '../../hooks/Redirrecion'
import useRegistrosSeguimiento from '../../hooks/useRegistrosSeguimiento'
import type {
  DocumentoSeguimientoPaciente,
  FiltroDetalleSeguimiento,
  OpcionFiltroDetalle,
  PerfilSeguimientoPaciente,
  RegistroSeguimientoPaciente,
  ResumenPanelSeguimiento,
} from '../../types/SeguimientoPaciente'

const DOCTORA = {
  especialidad: 'Hematología Pediátrica',
  nombre: 'Dra. Valeria Ruiz',
}

const FILTROS: OpcionFiltroDetalle[] = [
  { etiqueta: 'Todos', valor: 'todos' },
  { etiqueta: 'Medicación', valor: 'medicacion' },
  { etiqueta: 'Síntomas', valor: 'sintomas' },
  { etiqueta: 'Tratamiento', valor: 'tratamiento' },
  { etiqueta: 'Documento', valor: 'documento' },
]

const CLAVE_PACIENTE_SELECCIONADO = 'hemoruta.medico.pacienteId'
const TAMANO_PAGINA_REGISTROS = 5

function crearRegistrosVacios(): Record<FiltroDetalleSeguimiento, RegistroSeguimientoPaciente[]> {
  return {
    documento: [],
    medicacion: [],
    sintomas: [],
    todos: [],
    tratamiento: [],
  }
}

function crearTotalesVacios(): Record<FiltroDetalleSeguimiento, number> {
  return { documento: 0, medicacion: 0, sintomas: 0, todos: 0, tratamiento: 0 }
}

function adaptarEstadoRegistro(estado: string): RegistroSeguimientoPaciente['estado'] {
  const estados: Record<string, RegistroSeguimientoPaciente['estado']> = {
    ALERTA: 'Alerta',
    CERRADO: 'Cerrado',
    CUMPLIDO: 'Cumplido',
    EN_SEGUIMIENTO: 'En seguimiento',
    PENDIENTE: 'En seguimiento',
    RECIBIDO: 'En seguimiento',
    REGISTRADO: 'Registrado',
    REVISADO: 'Revisado',
  }

  return estados[estado.toUpperCase()] ?? 'En seguimiento'
}

function adaptarOrigenRegistro(
  origen: RegistroSeguimientoMedicoApi['origen'],
): RegistroSeguimientoPaciente['origen'] {
  if (origen === 'MEDICO') return 'Médico'
  if (origen === 'WHATSAPP') return 'WhatsApp'
  return 'App móvil'
}

function adaptarTipoRegistro(
  tipo: RegistroSeguimientoMedicoApi['tipo'],
): RegistroSeguimientoPaciente['tipo'] {
  if (tipo === 'DOCUMENTO') return 'documento'
  if (tipo === 'MEDICACION') return 'medicacion'
  if (tipo === 'TRATAMIENTO' || String(tipo) === 'CONSULTA') return 'tratamiento'
  return 'sintomas'
}

function adaptarRegistroApi(registro: RegistroSeguimientoMedicoApi): RegistroSeguimientoPaciente {
  const fechaRegistro = new Date(registro.ocurridoEn)
  const fechaValida = !Number.isNaN(fechaRegistro.getTime())

  return {
    estado: adaptarEstadoRegistro(registro.estado),
    fecha: fechaValida
      ? new Intl.DateTimeFormat('es-PE', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        }).format(fechaRegistro)
      : 'Fecha no disponible',
    hora: fechaValida
      ? new Intl.DateTimeFormat('es-PE', {
          hour: '2-digit',
          hour12: true,
          minute: '2-digit',
        }).format(fechaRegistro)
      : '',
    id: registro.id,
    origen: adaptarOrigenRegistro(registro.origen),
    resumen: registro.resumen,
    tipo: adaptarTipoRegistro(registro.tipo),
  }
}

function calcularEdad(fechaNacimiento: string | null) {
  if (!fechaNacimiento) return null
  const nacimiento = new Date(`${fechaNacimiento}T00:00:00`)
  if (Number.isNaN(nacimiento.getTime())) return null

  const hoy = new Date()
  let edad = hoy.getFullYear() - nacimiento.getFullYear()
  const aunNoCumple =
    hoy.getMonth() < nacimiento.getMonth() ||
    (hoy.getMonth() === nacimiento.getMonth() && hoy.getDate() < nacimiento.getDate())
  if (aunNoCumple) edad -= 1
  return Math.max(0, edad)
}

function formatearFechaHora(fechaIso: string | null, mensajeVacio: string) {
  if (!fechaIso) return { fecha: mensajeVacio, hora: '' }
  const fecha = new Date(fechaIso)
  if (Number.isNaN(fecha.getTime())) return { fecha: 'Fecha no disponible', hora: '' }
  return {
    fecha: new Intl.DateTimeFormat('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(fecha),
    hora: new Intl.DateTimeFormat('es-PE', {
      hour: '2-digit',
      hour12: true,
      minute: '2-digit',
    }).format(fecha),
  }
}

function adaptarPerfil(ficha: FichaPacienteMedicoApi): PerfilSeguimientoPaciente {
  const edad = calcularEdad(ficha.datosGenerales.fechaNacimiento)

  const proximaCita = formatearFechaHora(ficha.proximaCitaEn, 'Sin cita programada')
  const responsable = ficha.responsables[0]
  const semaforo = ficha.semaforo.codigo
    .toLocaleLowerCase('es')
    .replace(/^./, (letra) => letra.toLocaleUpperCase('es'))

  return {
    adultoResponsable: responsable?.nombre || 'Sin responsable registrado',
    diagnostico: ficha.diagnosticoPrincipal?.nombre || 'Sin diagnóstico registrado',
    edad,
    estado: ficha.cuentaMovil.estado === 'ACTIVA' ? 'Activo' : ficha.cuentaMovil.estado,
    fechaProximaCita: proximaCita.fecha,
    historiaClinica: ficha.historiaClinica,
    horaProximaCita: proximaCita.hora,
    imagen: fondoPaciente,
    nombre: ficha.nombre,
    parentescoResponsable: responsable?.parentesco || '',
    semaforo,
    semaforoDescripcion: ficha.semaforo.descripcion,
    ultimaSincronizacion: 'sin sincronización registrada',
  }
}

function documentosDesdeRegistros(
  registros: RegistroSeguimientoPaciente[],
): DocumentoSeguimientoPaciente[] {
  return registros.flatMap((registro) => {
    if (registro.tipo !== 'documento' || registro.origen === 'Médico') return []
    return [
      {
        fecha: registro.fecha,
        id: registro.id,
        nombre: registro.resumen,
        origen: registro.origen,
      },
    ]
  })
}

function porcentajeCumplimiento(registros: RegistroSeguimientoPaciente[]) {
  if (registros.length === 0) return 0
  const cumplidos = registros.filter((registro) =>
    ['Cumplido', 'Registrado', 'Revisado'].includes(registro.estado),
  ).length
  return Math.round((cumplidos / registros.length) * 100)
}

function crearResumenSeguimiento(
  registros: RegistroSeguimientoPaciente[],
  perfil: PerfilSeguimientoPaciente | null,
): ResumenPanelSeguimiento {
  const medicamentos = registros.filter((registro) => registro.tipo === 'medicacion')
  const sintomas = registros.filter((registro) => registro.tipo === 'sintomas')
  const tratamientos = registros.filter((registro) => registro.tipo === 'tratamiento')
  const documentos = documentosDesdeRegistros(registros)
  const dosisOmitida = medicamentos.find((registro) => registro.estado === 'Alerta')
  const medicamentoReciente = medicamentos[0]
  const sintomaReciente = sintomas[0]

  return {
    adherenciaGeneral: porcentajeCumplimiento(registros),
    adherenciaMedicacion: porcentajeCumplimiento(medicamentos),
    documentos,
    documentosRecientes: documentos.slice(0, 2),
    dosisOmitida: {
      fecha: dosisOmitida?.fecha || '',
      hora: dosisOmitida?.hora || '',
      medicamento: dosisOmitida?.resumen || 'Sin dosis omitidas registradas',
    },
    indicacionesTratamiento: tratamientos.map((registro) => registro.resumen),
    medicamentoReciente: {
      fecha: medicamentoReciente?.fecha || '',
      hora: medicamentoReciente?.hora || '',
      nombre: medicamentoReciente?.resumen || 'Sin medicación registrada',
    },
    resumenDocumental: {
      alertas: documentos.filter((documento) => {
        const registro = registros.find((item) => item.id === documento.id)
        return registro?.estado === 'Alerta'
      }).length,
      enSeguimiento: documentos.filter((documento) => {
        const registro = registros.find((item) => item.id === documento.id)
        return registro?.estado === 'En seguimiento'
      }).length,
      revisados: documentos.filter((documento) => {
        const registro = registros.find((item) => item.id === documento.id)
        return registro?.estado === 'Revisado'
      }).length,
      total: documentos.length,
    },
    semaforo: perfil?.semaforo || 'Sin datos',
    semaforoDescripcion: perfil?.semaforoDescripcion || 'Sin evaluación vigente',
    sintomaReciente: {
      conAlerta: sintomas.filter((registro) => registro.estado === 'Alerta').length,
      descripcion: sintomaReciente?.resumen || 'Sin síntomas registrados',
      fecha: sintomaReciente?.fecha || '',
      hora: sintomaReciente?.hora || '',
      sinSintomas: sintomas.filter((registro) =>
        registro.resumen.toLocaleLowerCase('es').includes('sin síntoma'),
      ).length,
      totalReportes: sintomas.length,
    },
  }
}

function VisualizarSeguimientoPacientePage() {
  const redirigir = useRedirrecion()
  const [pacienteId] = useState<string | null>(() => {
    try {
      return window.sessionStorage.getItem(CLAVE_PACIENTE_SELECCIONADO)
    } catch {
      return null
    }
  })
  const [perfil, setPerfil] = useState<PerfilSeguimientoPaciente | null>(null)
  const [registrosResumen, setRegistrosResumen] = useState<RegistroSeguimientoPaciente[]>([])
  const [registrosPorFiltro, setRegistrosPorFiltro] = useState(crearRegistrosVacios)
  const [totalRegistros, setTotalRegistros] = useState(crearTotalesVacios)
  const [avisoPerfil, setAvisoPerfil] = useState<string | null>(
    pacienteId ? null : 'Selecciona un paciente en el listado para cargar su seguimiento.',
  )
  const [avisoApi, setAvisoApi] = useState<string | null>(null)
  const [cargandoPerfil, setCargandoPerfil] = useState(Boolean(pacienteId))
  const [cargandoResumen, setCargandoResumen] = useState(Boolean(pacienteId))
  const [cargandoRegistros, setCargandoRegistros] = useState(false)
  const [paginaActual, setPaginaActual] = useState(1)
  const [paginasTotales, setPaginasTotales] = useState(1)
  const [tamanoPagina, setTamanoPagina] = useState(TAMANO_PAGINA_REGISTROS)
  const resumen = useMemo(
    () => crearResumenSeguimiento(registrosResumen, perfil),
    [perfil, registrosResumen],
  )
  const {
    busqueda,
    cambiarFiltro: cambiarFiltroBase,
    filtroActivo,
    limpiarFiltros: limpiarFiltrosBase,
    registrosVisibles,
    setBusqueda: setBusquedaBase,
    totalVisible,
  } = useRegistrosSeguimiento({ registrosPorFiltro, totalRegistros })

  function cambiarBusqueda(valor: string) {
    setPaginaActual(1)
    setPaginasTotales(1)
    setBusquedaBase(valor)
  }

  function cambiarFiltro(filtro: FiltroDetalleSeguimiento) {
    setPaginaActual(1)
    setPaginasTotales(1)
    cambiarFiltroBase(filtro)
  }

  function limpiarFiltros() {
    setPaginaActual(1)
    setPaginasTotales(1)
    limpiarFiltrosBase()
  }

  useEffect(() => {
    if (!pacienteId) return
    let vigente = true

    setCargandoPerfil(true)
    obtenerFichaPacienteMedicoApi(pacienteId)
      .then((ficha) => {
        if (!vigente) return
        const perfilRecibido = adaptarPerfil(ficha)
        setPerfil(perfilRecibido)
        setAvisoPerfil(null)
      })
      .catch(() => {
        if (!vigente) return
        setPerfil(null)
        setAvisoPerfil('No se pudo cargar la ficha del paciente.')
      })
      .finally(() => {
        if (vigente) setCargandoPerfil(false)
      })

    setCargandoResumen(true)
    obtenerSeguimientoPacienteMedicoApi(pacienteId, {
      pagina: 1,
      tamanoPagina: 100,
      tipo: 'todos',
    })
      .then((respuesta) => {
        if (!vigente) return
        setRegistrosResumen(respuesta.resultados.map(adaptarRegistroApi))
      })
      .catch(() => {
        if (!vigente) return
        setRegistrosResumen([])
      })
      .finally(() => {
        if (vigente) setCargandoResumen(false)
      })

    return () => {
      vigente = false
    }
  }, [pacienteId])

  useEffect(() => {
    if (!pacienteId) return

    let vigente = true
    setCargandoRegistros(true)
    setAvisoApi(null)
    setRegistrosPorFiltro((actuales) => ({ ...actuales, [filtroActivo]: [] }))
    setTotalRegistros((actuales) => ({ ...actuales, [filtroActivo]: 0 }))

    const temporizador = window.setTimeout(() => {
      obtenerSeguimientoPacienteMedicoApi(pacienteId, {
        busqueda: busqueda.trim() || undefined,
        pagina: paginaActual,
        tamanoPagina: TAMANO_PAGINA_REGISTROS,
        tipo: filtroActivo,
      })
        .then((respuesta) => {
          if (!vigente) return
          setRegistrosPorFiltro((actuales) => ({
            ...actuales,
            [filtroActivo]: respuesta.resultados.map(adaptarRegistroApi),
          }))
          setTotalRegistros((actuales) => ({
            ...actuales,
            [filtroActivo]: respuesta.paginacion.total,
          }))
          setPaginaActual(respuesta.paginacion.pagina)
          setPaginasTotales(Math.max(1, respuesta.paginacion.paginasTotales))
          setTamanoPagina(respuesta.paginacion.tamanoPagina)
          setAvisoApi(null)
        })
        .catch(() => {
          if (!vigente) return
          setRegistrosPorFiltro((actuales) => ({ ...actuales, [filtroActivo]: [] }))
          setTotalRegistros((actuales) => ({ ...actuales, [filtroActivo]: 0 }))
          setPaginaActual(1)
          setPaginasTotales(1)
          setTamanoPagina(TAMANO_PAGINA_REGISTROS)
          setAvisoApi('No se pudieron cargar los registros de seguimiento. Intenta nuevamente.')
        })
        .finally(() => {
          if (vigente) setCargandoRegistros(false)
        })
    }, 250)

    return () => {
      vigente = false
      window.clearTimeout(temporizador)
    }
  }, [busqueda, filtroActivo, pacienteId, paginaActual])

  const hayInformacionPanel =
    filtroActivo === 'todos'
      ? registrosResumen.length > 0
      : registrosResumen.some((registro) => registro.tipo === filtroActivo)

  return (
    <div className='flex min-h-dvh bg-[#fbfdff]'>
      <MenuMedicoComp />

      <div className='min-w-0 flex-1'>
        <HeaderDoctorMedicoComp
          especialidad={DOCTORA.especialidad}
          nombre={DOCTORA.nombre}
          notificaciones={5}
          variante='detalleSeguimiento'
        />

        <main className='min-h-[calc(100dvh-52px)] px-[clamp(16px,2vw,26px)] pb-2 pt-[18px]'>
          <div className='mx-auto w-full max-w-[1260px]'>
            <header>
              <h1 className='text-[clamp(25px,2.1vw,28px)] font-extrabold leading-[34px] tracking-[-0.035em] text-[#0a2b79]'>
                Seguimiento del paciente
              </h1>
              <p className='mt-0.5 text-[10px] font-medium leading-[14px] text-[#50658a]'>
                Información consolidada desde WhatsApp y la app móvil para seguimiento clínico.
              </p>
            </header>

            <div className='mt-4 grid items-start gap-3.5 xl:grid-cols-[minmax(0,1fr)_280px]'>
              <div className='min-w-0'>
                {perfil ? <PerfilSeguimientoPacienteComp perfil={perfil} /> : null}
                {!perfil ? (
                  <div
                    aria-live='polite'
                    className='grid min-h-[142px] place-items-center rounded-xl border border-[#dce5ee] bg-white px-6 text-center text-[10px] font-medium text-[#607596] shadow-[0_2px_9px_rgba(18,52,91,0.055)]'
                  >
                    {cargandoPerfil ? 'Cargando ficha del paciente…' : avisoPerfil}
                  </div>
                ) : null}

                <div className='mt-4'>
                  {cargandoRegistros || avisoApi ? (
                    <p aria-live='polite' className='mb-1.5 text-[10px] font-medium text-[#607596]'>
                      {cargandoRegistros ? 'Cargando registros…' : avisoApi}
                    </p>
                  ) : null}
                  <RegistrosSeguimientoComp
                    busqueda={busqueda}
                    filtroActivo={filtroActivo}
                    filtros={FILTROS}
                    onCambiarBusqueda={cambiarBusqueda}
                    onCambiarFiltro={cambiarFiltro}
                    onCambiarPagina={setPaginaActual}
                    onLimpiarFiltros={limpiarFiltros}
                    onVerRegistro={(registro) => {
                      if (registro.tipo === 'documento') redirigir('/doctor/ficha?panel=documentos')
                      else if (registro.tipo === 'sintomas') redirigir('/doctor/ficha?panel=sintomas')
                      else redirigir('/doctor/historial')
                    }}
                    paginaActual={paginaActual}
                    paginasTotales={paginasTotales}
                    registros={registrosVisibles}
                    tamanoPagina={tamanoPagina}
                    totalRegistros={totalVisible}
                  />
                </div>
              </div>

              <div className='min-w-0 xl:-mt-9 xl:sticky xl:top-16'>
                {!pacienteId || cargandoResumen || !hayInformacionPanel ? (
                  <div className='grid min-h-52 place-items-center rounded-xl border border-[#dce5ee] bg-white px-6 text-center text-[10px] font-medium text-[#607596] shadow-[0_2px_9px_rgba(18,52,91,0.055)]'>
                    {!pacienteId
                      ? 'Selecciona un paciente para consultar su resumen.'
                      : cargandoResumen
                        ? 'Cargando resumen del seguimiento…'
                        : 'Aún no hay información registrada para este filtro.'}
                  </div>
                ) : (
                  <PanelLateralSeguimientoComp
                    filtroActivo={filtroActivo}
                    onRegistrarAccion={() => redirigir('/doctor/consulta')}
                    onVerDocumento={() => redirigir('/doctor/ficha?panel=documentos')}
                    onVerDocumentos={() => redirigir('/doctor/ficha?panel=documentos')}
                    onVerFicha={() => redirigir('/doctor/ficha')}
                    onVerHistorial={() => redirigir('/doctor/historial')}
                    resumen={resumen}
                  />
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default VisualizarSeguimientoPacientePage
