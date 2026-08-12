import { useEffect, useMemo, useState } from 'react'

import {
  listarSeguimientoPacientesMedicoApi,
  obtenerSeguimientoPacienteMedicoApi,
  type PacienteMedicoListaApi,
  type RegistroSeguimientoMedicoApi,
} from '../../api/medico/MedicoApi'
import CartillaInformacionComp, {
  type CartillaInformacionCompProps,
} from '../../components/CartillaInformacionComp'
import HeaderDoctorMedicoComp from '../../components/HeaderDoctorMedicoComp'
import MenuMedicoComp from '../../components/MenuMedicoComp'
import EstadoVacioPanelComp from '../../components/medicoMcomp/EstadoVacioPanelComp'
import FiltrosSeguimientoListaComp from '../../components/medicoMcomp/FiltrosSeguimientoListaComp'
import PanelPacienteComp from '../../components/medicoMcomp/PanelPacienteComp'
import TablaSeguimientoPacientesComp from '../../components/medicoMcomp/TablaSeguimientoPacientesComp'
import useRedirrecion from '../../hooks/Redirrecion'
import useSeguimientoPacientesLista from '../../hooks/useSeguimientoPacientesLista'
import type {
  FiltroSeguimiento,
  IdCartilla,
  PacienteSeguimiento,
  SemaforoPaciente,
  TipoRegistro,
} from '../../types/SeguimientoPacientesLista'

interface DatoCartilla extends Omit<CartillaInformacionCompProps, 'onAccion'> {
  id: IdCartilla
}

const DOCTORA = {
  especialidad: 'Hematología Pediátrica',
  nombre: 'Dra. Valeria Ruiz',
}

const TAMANO_PAGINA = 8
const TAMANO_CARGA_FILTROS = 100

const CARTILLAS: DatoCartilla[] = [
  {
    accion: 'Ver todos',
    descripcion: 'con seguimiento activo',
    icono: 'users',
    id: 'pacientes',
    titulo: 'Pacientes',
    tono: 'azul',
    valor: 0,
  },
  {
    accion: 'Ver alertas',
    descripcion: 'en esta página',
    icono: 'alertTriangle',
    id: 'alertas',
    titulo: 'Alertas',
    tono: 'naranja',
    valor: 0,
  },
  {
    accion: 'Ver documentos',
    descripcion: 'como registro reciente',
    icono: 'file',
    id: 'documentos',
    titulo: 'Documentos',
    tono: 'morado',
    valor: 0,
  },
  {
    accion: 'Ver síntomas',
    descripcion: 'como registro reciente',
    icono: 'smile',
    id: 'sintomas',
    titulo: 'Síntomas',
    tono: 'turquesa',
    valor: 0,
  },
]

const FILTROS: { etiqueta: string; valor: Exclude<FiltroSeguimiento, 'alertas'> }[] = [
  { etiqueta: 'Todos', valor: 'todos' },
  { etiqueta: 'Medicación', valor: 'medicacion' },
  { etiqueta: 'Síntomas', valor: 'sintomas' },
  { etiqueta: 'Tratamiento', valor: 'tratamiento' },
  { etiqueta: 'Documento', valor: 'documento' },
]

const ETIQUETAS_REGISTRO: Record<TipoRegistro, string> = {
  documento: 'Documento',
  medicacion: 'Medicación',
  sintomas: 'Síntomas',
  tratamiento: 'Tratamiento',
}

const COLORES_AVATAR = ['bg-[#dff5ef]', 'bg-[#fff0dd]', 'bg-[#dff4f7]', 'bg-[#ffe7df]']
const CLAVE_PACIENTE_SELECCIONADO = 'hemoruta.medico.pacienteId'

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

function adaptarTipoRegistro(tipo: RegistroSeguimientoMedicoApi['tipo']): TipoRegistro {
  if (tipo === 'DOCUMENTO') return 'documento'
  if (tipo === 'MEDICACION') return 'medicacion'
  if (tipo === 'TRATAMIENTO' || String(tipo) === 'CONSULTA') return 'tratamiento'
  return 'sintomas'
}

function obtenerSemaforo(estado: string): {
  descripcion: string
  semaforo: SemaforoPaciente
} {
  const estadoNormalizado = estado.toUpperCase()
  if (estadoNormalizado === 'ALERTA') {
    return { descripcion: 'El último registro requiere revisión', semaforo: 'Rojo' }
  }
  if (['EN_SEGUIMIENTO', 'PENDIENTE', 'RECIBIDO'].includes(estadoNormalizado)) {
    return { descripcion: 'Último registro en seguimiento', semaforo: 'Amarillo' }
  }
  return { descripcion: 'Último registro revisado', semaforo: 'Verde' }
}

function inicialesPaciente(nombre: string) {
  return nombre
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte[0]?.toUpperCase())
    .join('')
}

async function adaptarPacienteApi(
  paciente: PacienteMedicoListaApi,
  indice: number,
): Promise<PacienteSeguimiento | null> {
  const seguimiento = await obtenerSeguimientoPacienteMedicoApi(paciente.id, {
    pagina: 1,
    tamanoPagina: 20,
    tipo: 'todos',
  })
  const ultimoRegistroPaciente = seguimiento.resultados.find(
    (registro) => registro.origen !== 'MEDICO',
  )
  if (!ultimoRegistroPaciente) return null

  const proximaCita = formatearFechaHora(paciente.proximaCitaEn, 'Sin cita programada')
  const ultimoRegistro = formatearFechaHora(ultimoRegistroPaciente.ocurridoEn, 'Sin fecha')
  const semaforo = obtenerSemaforo(ultimoRegistroPaciente.estado)

  return {
    avatar: inicialesPaciente(paciente.nombre),
    colorAvatar: COLORES_AVATAR[indice % COLORES_AVATAR.length],
    descripcionSemaforo: semaforo.descripcion,
    dni: paciente.dni || 'Por completar',
    edad: paciente.edad,
    estado: ultimoRegistroPaciente.estado.toUpperCase() === 'ALERTA' ? 'Alerta' : 'En seguimiento',
    fechaProximaCita: proximaCita.fecha,
    fechaUltimoRegistro: ultimoRegistro.fecha,
    horaProximaCita: proximaCita.hora,
    horaUltimoRegistro: ultimoRegistro.hora,
    id: paciente.id,
    nombre: paciente.nombre,
    origen: ultimoRegistroPaciente.origen === 'WHATSAPP' ? 'WhatsApp' : 'App móvil',
    resumen: ultimoRegistroPaciente.resumen,
    semaforo: semaforo.semaforo,
    tipoUltimoRegistro: adaptarTipoRegistro(ultimoRegistroPaciente.tipo),
  }
}

function SeguimientoPacientesListaPage() {
  const redirigir = useRedirrecion()
  const [pacientes, setPacientes] = useState<PacienteSeguimiento[]>([])
  const [totalPacientes, setTotalPacientes] = useState(0)
  const [pagina, setPagina] = useState(1)
  const [avisoApi, setAvisoApi] = useState<string | null>(null)
  const [cargandoApi, setCargandoApi] = useState(true)
  const [errorApi, setErrorApi] = useState(false)
  const {
    busqueda,
    filtroActivo,
    hayFiltrosActivos,
    limpiarFiltros,
    manejarAccionCartilla,
    pacienteSeleccionado,
    pacienteSeleccionadoId,
    pacientesFiltrados,
    setBusqueda,
    setFiltroActivo,
    setPacienteSeleccionadoId,
  } = useSeguimientoPacientesLista(pacientes)

  const valoresCartillas = useMemo<Record<IdCartilla, number>>(
    () => ({
      alertas: pacientes.filter((paciente) => paciente.estado === 'Alerta').length,
      documentos: pacientes.filter((paciente) => paciente.tipoUltimoRegistro === 'documento').length,
      pacientes: totalPacientes,
      sintomas: pacientes.filter((paciente) => paciente.tipoUltimoRegistro === 'sintomas').length,
    }),
    [pacientes, totalPacientes],
  )

  const totalPacientesTabla = pacientesFiltrados.length
  const paginasTotales = Math.max(1, Math.ceil(totalPacientesTabla / TAMANO_PAGINA))
  const pacientesPagina = useMemo(
    () => pacientesFiltrados.slice((pagina - 1) * TAMANO_PAGINA, pagina * TAMANO_PAGINA),
    [pacientesFiltrados, pagina],
  )

  useEffect(() => {
    if (pagina > paginasTotales) setPagina(paginasTotales)
  }, [pagina, paginasTotales])

  useEffect(() => {
    let vigente = true
    setCargandoApi(true)
    setErrorApi(false)
    setAvisoApi(null)
    setPacientes([])
    setTotalPacientes(0)

    listarSeguimientoPacientesMedicoApi({ pagina: 1, tamanoPagina: TAMANO_CARGA_FILTROS })
      .then(async (respuesta) => {
        const resultados = await Promise.allSettled(
          respuesta.resultados.map((paciente, indice) => adaptarPacienteApi(paciente, indice)),
        )
        if (!vigente) return

        const pacientesRecibidos = resultados.flatMap((resultado) =>
          resultado.status === 'fulfilled' && resultado.value ? [resultado.value] : [],
        )
        const detallesNoDisponibles = resultados.length - pacientesRecibidos.length
        const avisos: string[] = []
        if (respuesta.paginacion.paginasTotales > 1) {
          avisos.push(
            `La tabla permite buscar y filtrar entre ${pacientesRecibidos.length} pacientes cargados de ${respuesta.paginacion.total} en total.`,
          )
        }
        if (detallesNoDisponibles > 0) {
          avisos.push('No se pudieron cargar los datos recientes de algunos pacientes.')
        }
        setPacientes(pacientesRecibidos)
        setTotalPacientes(respuesta.paginacion.total)
        setAvisoApi(avisos.length > 0 ? avisos.join(' ') : null)
      })
      .catch(() => {
        if (!vigente) return
        setPacientes([])
        setErrorApi(true)
        setAvisoApi('No se pudo cargar el seguimiento de pacientes. Intenta nuevamente.')
      })
      .finally(() => {
        if (vigente) setCargandoApi(false)
      })

    return () => {
      vigente = false
    }
  }, [])

  function cambiarPagina(nuevaPagina: number) {
    const paginaValida = Math.min(Math.max(1, nuevaPagina), paginasTotales)
    if (cargandoApi || paginaValida === pagina) return
    setPagina(paginaValida)
  }

  function cambiarBusqueda(valor: string) {
    setBusqueda(valor)
    setPagina(1)
  }

  function cambiarFiltro(filtro: FiltroSeguimiento) {
    setFiltroActivo(filtro)
    setPagina(1)
  }

  function limpiarFiltrosYReiniciarPagina() {
    limpiarFiltros()
    setPagina(1)
  }

  function manejarCartillaYReiniciarPagina(id: IdCartilla) {
    manejarAccionCartilla(id)
    setPagina(1)
  }

  function seleccionarPaciente(pacienteId: string) {
    setPacienteSeleccionadoId(pacienteId)
    try {
      window.sessionStorage.setItem(CLAVE_PACIENTE_SELECCIONADO, pacienteId)
    } catch {
      // La selección continúa aunque el navegador no permita usar sessionStorage.
    }
  }

  return (
    <div className='flex min-h-dvh bg-[#fbfdff]'>
      <MenuMedicoComp />

      <div className='min-w-0 flex-1'>
        <HeaderDoctorMedicoComp
          especialidad={DOCTORA.especialidad}
          nombre={DOCTORA.nombre}
          notificaciones={5}
          variante='seguimiento'
        />

        <div className='grid min-h-[calc(100dvh-48px)] xl:grid-cols-[minmax(0,1fr)_clamp(286px,22vw,304px)]'>
          <main className='min-w-0 px-[clamp(16px,2vw,26px)] pb-2 pt-4'>
            <div className='w-full max-w-[1120px]'>
              <header>
                <h1 className='text-[clamp(25px,2.1vw,28px)] font-extrabold leading-[34px] tracking-[-0.035em] text-[#0a2b79]'>
                  Seguimiento del paciente
                </h1>
                <p className='mt-0.5 text-[10px] font-medium leading-[14px] text-[#50658a]'>
                  Información consolidada desde WhatsApp y la app móvil para seguimiento clínico.
                </p>
              </header>

              <section aria-label='Resumen del seguimiento' className='mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4'>
                {CARTILLAS.map(({ id, ...cartilla }) => (
                  <CartillaInformacionComp
                    {...cartilla}
                    key={id}
                    onAccion={() => manejarCartillaYReiniciarPagina(id)}
                    valor={valoresCartillas[id]}
                  />
                ))}
              </section>

              {cargandoApi || avisoApi ? (
                <p aria-live='polite' className='mt-2 text-[10px] font-medium text-[#607596]'>
                  {cargandoApi ? 'Cargando pacientes en seguimiento…' : avisoApi}
                </p>
              ) : null}

              <FiltrosSeguimientoListaComp
                busqueda={busqueda}
                filtroActivo={filtroActivo}
                filtros={FILTROS}
                hayFiltrosActivos={hayFiltrosActivos}
                onCambiarBusqueda={cambiarBusqueda}
                onCambiarFiltro={cambiarFiltro}
                onLimpiarFiltros={limpiarFiltrosYReiniciarPagina}
              />

              <TablaSeguimientoPacientesComp
                etiquetasRegistro={ETIQUETAS_REGISTRO}
                cargando={cargandoApi}
                errorCarga={errorApi}
                onCambiarPagina={cambiarPagina}
                onSeleccionarPaciente={seleccionarPaciente}
                pagina={pagina}
                pacienteSeleccionadoId={pacienteSeleccionadoId}
                pacientes={pacientesPagina}
                paginasTotales={paginasTotales}
                tamanoPagina={TAMANO_PAGINA}
                totalPacientes={totalPacientesTabla}
              />
            </div>
          </main>

          <aside className='border-t border-[#dbe5ee] bg-white px-2.5 pb-2 pt-3 xl:sticky xl:top-12 xl:h-[calc(100dvh-48px)] xl:border-l xl:border-t-0'>
            <div aria-live='polite' className='h-full overflow-y-auto rounded-xl border border-[#dce5ee] bg-[#fcfdff] shadow-[0_2px_8px_rgba(18,52,91,0.04)]'>
              {pacienteSeleccionado ? (
                <PanelPacienteComp
                  etiquetasRegistro={ETIQUETAS_REGISTRO}
                  onVerSeguimiento={() => redirigir('/doctor/visualizar')}
                  paciente={pacienteSeleccionado}
                />
              ) : (
                <EstadoVacioPanelComp />
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}

export default SeguimientoPacientesListaPage
