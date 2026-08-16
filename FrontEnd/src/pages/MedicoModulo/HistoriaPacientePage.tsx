import { useEffect, useState } from 'react'

import {
  listarDocumentosPacienteMedicoApi,
  listarSintomasPacienteMedicoApi,
  obtenerArchivoDocumentoMedicoApi,
  obtenerFichaPacienteMedicoApi,
  obtenerHistoriaPacienteMedicoApi,
  type DocumentoPacienteMedicoApi,
  type FichaPacienteMedicoApi,
  type ReporteSintomasPacienteMedicoApi,
} from '../../api/medico/MedicoApi'
import fondoPaciente from '../../assets/FondoNiño5.png'
import HeaderDoctorMedicoComp from '../../components/HeaderDoctorMedicoComp'
import IconoMedico, { type NombreIconoMedico } from '../../components/IconoMedico'
import MenuMedicoComp from '../../components/MenuMedicoComp'
import ResultadosDocPaciComp from '../../components/ResultadosDocPaciComp'
import DocumentosPacienteModalComp, {
  type VistaPreviaDocumentoPaciente,
} from '../../components/medicoMcomp/DocumentosPacienteModalComp'
import type { DocumentoFichaPaciente } from '../../types/FichaPaciente'
import type {
  DocumentoHistorialPaciente,
  EpisodioHistorialPaciente,
  FiltroHistorial,
  ReporteSintomasHistorialPaciente,
} from '../../types/HistoriaPaciente'

const CLAVE_PACIENTE_SELECCIONADO = 'hemoruta.medico.pacienteId'
const DOCTORA = { especialidad: 'Hematología Pediátrica', nombre: 'Dra. Valeria Ruiz' }

interface PacienteHistorialCabecera {
  diagnostico: string
  edad: number | null
  historiaClinica: string
  imagen: string
  nombre: string
}

interface OpcionFiltro {
  icono: NombreIconoMedico
  texto: string
  valor: FiltroHistorial
}

const FILTROS: OpcionFiltro[] = [
  { icono: 'list', texto: 'Todo', valor: 'todo' },
  { icono: 'stethoscope', texto: 'Consultas', valor: 'consultas' },
  { icono: 'activity', texto: 'Tratamientos', valor: 'tratamientos' },
  { icono: 'pill', texto: 'Medicación', valor: 'medicacion' },
  { icono: 'smile', texto: 'Síntomas', valor: 'sintomas' },
  { icono: 'file', texto: 'Documentos', valor: 'documentos' },
]

const ETIQUETAS_ESTADO: Record<string, string> = {
  ANULADA: 'Anulada',
  BORRADOR: 'Borrador',
  COMPLETADA: 'Completado',
}

const ETIQUETAS_ORIGEN_DOCUMENTO: Record<string, string> = {
  APP: 'Subido desde la app',
  MEDICO: 'Subido por el equipo médico',
  SISTEMA: 'Sistema hospitalario',
}

function esRegistro(valor: unknown): valor is Record<string, unknown> {
  return typeof valor === 'object' && valor !== null
}

function textoSeguro(valor: unknown, respaldo = '') {
  return typeof valor === 'string' && valor.trim() ? valor : respaldo
}

function calcularEdad(fechaIso: string | null) {
  if (!fechaIso) return null
  const nacimiento = new Date(`${fechaIso}T00:00:00`)
  if (Number.isNaN(nacimiento.getTime())) return null

  const hoy = new Date()
  let edad = hoy.getFullYear() - nacimiento.getFullYear()
  const aunNoCumple =
    hoy.getMonth() < nacimiento.getMonth() ||
    (hoy.getMonth() === nacimiento.getMonth() && hoy.getDate() < nacimiento.getDate())
  if (aunNoCumple) edad -= 1
  return edad
}

function separarFechaHora(fechaIso: string) {
  const fecha = new Date(fechaIso)
  if (Number.isNaN(fecha.getTime())) return { fecha: 'Sin fecha', fechaHoraIso: '', hora: '' }

  return {
    fecha: new Intl.DateTimeFormat('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(fecha),
    fechaHoraIso: fecha.toISOString(),
    hora: new Intl.DateTimeFormat('es-PE', {
      hour: '2-digit',
      hour12: true,
      minute: '2-digit',
    }).format(fecha),
  }
}

function formatoDocumento(tipoMime: string) {
  if (tipoMime.includes('pdf')) return 'PDF'
  const extension = tipoMime.split('/').at(-1)?.toUpperCase()
  return extension || 'ARCHIVO'
}

function mapearPaciente(ficha: FichaPacienteMedicoApi): PacienteHistorialCabecera {
  return {
    diagnostico: ficha.diagnosticoPrincipal?.nombre || 'Sin diagnóstico registrado',
    edad: calcularEdad(ficha.datosGenerales.fechaNacimiento),
    historiaClinica: ficha.historiaClinica || 'Sin código clínico',
    imagen: fondoPaciente,
    nombre: ficha.nombre || 'Paciente sin nombre registrado',
  }
}

function lineaDesdeItem(valor: unknown) {
  if (!esRegistro(valor)) return ''
  const etiqueta = textoSeguro(valor.etiqueta)
  const detalle = [textoSeguro(valor.descripcion), textoSeguro(valor.valor), textoSeguro(valor.unidad)]
    .filter(Boolean)
    .join(' ')
  return etiqueta && detalle ? `${etiqueta}: ${detalle}` : etiqueta || detalle
}

function mapearDetalle(
  valor: unknown,
  fechaConsulta: ReturnType<typeof separarFechaHora>,
  indice: number,
) {
  if (!esRegistro(valor)) return null
  const tipoApi = textoSeguro(valor.tipo).toUpperCase()
  if (tipoApi !== 'TRATAMIENTO' && tipoApi !== 'MEDICACION') return null

  const tipo = tipoApi === 'TRATAMIENTO' ? 'tratamiento' : 'medicacion'
  const lineas = Array.isArray(valor.items)
    ? valor.items.map(lineaDesdeItem).filter((linea) => linea.length > 0)
    : []
  return {
    descripcion: textoSeguro(
      valor.contenido,
      tipo === 'tratamiento' ? 'Indicaciones del tratamiento registrado.' : 'Medicación registrada.',
    ),
    fecha: fechaConsulta.fecha,
    fechaHoraIso: fechaConsulta.fechaHoraIso,
    hora: fechaConsulta.hora,
    id: textoSeguro(valor.id, `${tipo}-${indice}`),
    lineas,
    tipo,
    titulo: textoSeguro(valor.titulo, tipo === 'tratamiento' ? 'Tratamiento' : 'Medicación'),
  } satisfies EpisodioHistorialPaciente['detalles'][number]
}

function mapearEpisodio(valor: Record<string, unknown>, indice: number): EpisodioHistorialPaciente {
  const fechaConsulta = separarFechaHora(textoSeguro(valor.iniciadaEn))
  const medico = esRegistro(valor.medico) ? valor.medico : {}
  const detalles = Array.isArray(valor.secciones)
    ? valor.secciones
        .map((seccion, indiceSeccion) => mapearDetalle(seccion, fechaConsulta, indiceSeccion))
        .filter((detalle): detalle is NonNullable<typeof detalle> => detalle !== null)
    : []
  const estadoApi = textoSeguro(valor.estado)

  return {
    descripcion: textoSeguro(valor.resumen, 'Consulta clínica registrada.'),
    detalles,
    especialidad: textoSeguro(medico.especialidad, 'Especialidad no registrada'),
    estado: ETIQUETAS_ESTADO[estadoApi] ?? textoSeguro(estadoApi, 'Sin estado'),
    fecha: fechaConsulta.fecha,
    fechaHoraIso: fechaConsulta.fechaHoraIso,
    hora: fechaConsulta.hora,
    id: textoSeguro(valor.id, `consulta-${indice}`),
    medico: textoSeguro(medico.nombre, 'Profesional no registrado'),
    titulo: textoSeguro(valor.titulo, 'Consulta clínica'),
  }
}

function mapearDocumento(documento: DocumentoPacienteMedicoApi): DocumentoHistorialPaciente {
  const fecha = separarFechaHora(documento.fechaDocumento || documento.creadoEn)
  return {
    archivoDisponible: documento.archivoDisponible,
    descripcion: documento.descripcion,
    estado: documento.estado,
    ...fecha,
    formato: formatoDocumento(documento.tipoMime),
    id: documento.id,
    nombre: documento.nombreOriginal || documento.nombre,
    origen: ETIQUETAS_ORIGEN_DOCUMENTO[documento.origen] ?? documento.origen,
    tipoMime: documento.tipoMime,
  }
}

function mapearReporteSintomas(
  reporte: ReporteSintomasPacienteMedicoApi,
): ReporteSintomasHistorialPaciente {
  return {
    descripcion: reporte.descripcion,
    duracion: reporte.duracionTexto,
    estado: reporte.estado,
    evolucion: reporte.evolucionTexto,
    ...separarFechaHora(reporte.observadoEn),
    id: reporte.id,
    intensidad: reporte.intensidad,
    origen: reporte.origenTexto,
    reportadoPor: reporte.reportadoPor.nombre,
    sintomas: reporte.sintomas,
  }
}

function aDocumentoFicha(documento: DocumentoHistorialPaciente): DocumentoFichaPaciente {
  return {
    archivoDisponible: documento.archivoDisponible,
    estado: documento.estado,
    fecha: documento.fecha,
    formato: documento.formato,
    id: documento.id,
    nombre: documento.nombre,
    tipoMime: documento.tipoMime,
  }
}

function obtenerPacienteSeleccionado() {
  try {
    return window.sessionStorage.getItem(CLAVE_PACIENTE_SELECCIONADO)
  } catch {
    return null
  }
}

function HistoriaPacientePage() {
  const [filtroActivo, setFiltroActivo] = useState<FiltroHistorial>('todo')
  const [pacienteId] = useState(obtenerPacienteSeleccionado)
  const [paciente, setPaciente] = useState<PacienteHistorialCabecera | null>(null)
  const [episodios, setEpisodios] = useState<EpisodioHistorialPaciente[]>([])
  const [documentos, setDocumentos] = useState<DocumentoHistorialPaciente[]>([])
  const [reportesSintomas, setReportesSintomas] = useState<ReporteSintomasHistorialPaciente[]>([])
  const [cargando, setCargando] = useState(Boolean(pacienteId))
  const [avisoCarga, setAvisoCarga] = useState(
    pacienteId ? '' : 'Selecciona un paciente del listado para consultar su historial.',
  )
  const [documentoProcesandoId, setDocumentoProcesandoId] = useState('')
  const [modalDocumentosAbierto, setModalDocumentosAbierto] = useState(false)
  const [vistaPreviaDocumento, setVistaPreviaDocumento] = useState<VistaPreviaDocumentoPaciente | null>(null)
  const [errorDocumento, setErrorDocumento] = useState('')

  useEffect(() => {
    if (!pacienteId) return undefined
    let paginaActiva = true

    Promise.allSettled([
      obtenerFichaPacienteMedicoApi(pacienteId),
      obtenerHistoriaPacienteMedicoApi(pacienteId, { tamanoPagina: 100 }),
      listarDocumentosPacienteMedicoApi(pacienteId),
      listarSintomasPacienteMedicoApi(pacienteId),
    ]).then(([resultadoFicha, resultadoConsultas, resultadoDocumentos, resultadoSintomas]) => {
      if (!paginaActiva) return
      const errores: string[] = []

      if (resultadoFicha.status === 'fulfilled') setPaciente(mapearPaciente(resultadoFicha.value))
      else errores.push('la ficha')
      if (resultadoConsultas.status === 'fulfilled') {
        setEpisodios(resultadoConsultas.value.resultados.map(mapearEpisodio))
      } else errores.push('las consultas')
      if (resultadoDocumentos.status === 'fulfilled') {
        setDocumentos(resultadoDocumentos.value.resultados.map(mapearDocumento))
      } else errores.push('los documentos')
      if (resultadoSintomas.status === 'fulfilled') {
        setReportesSintomas(resultadoSintomas.value.resultados.map(mapearReporteSintomas))
      } else errores.push('los síntomas')

      setAvisoCarga(errores.length ? `No se pudo actualizar ${errores.join(', ')}.` : '')
      setCargando(false)
    })

    return () => {
      paginaActiva = false
    }
  }, [pacienteId])

  async function abrirDocumento(documento: DocumentoHistorialPaciente, descargar: boolean) {
    if (!documento.archivoDisponible || documentoProcesandoId) return
    setDocumentoProcesandoId(documento.id)
    setErrorDocumento('')
    try {
      const archivo = await obtenerArchivoDocumentoMedicoApi(documento.id, descargar)
      const url = URL.createObjectURL(archivo)
      if (descargar) {
        const enlace = document.createElement('a')
        enlace.href = url
        enlace.download = documento.nombre
        document.body.appendChild(enlace)
        enlace.click()
        enlace.remove()
        window.setTimeout(() => URL.revokeObjectURL(url), 60_000)
      } else {
        setVistaPreviaDocumento((actual) => {
          if (actual) URL.revokeObjectURL(actual.url)
          return { nombre: documento.nombre, tipoMime: archivo.type || documento.tipoMime, url }
        })
        setModalDocumentosAbierto(true)
      }
    } catch {
      setErrorDocumento('No se pudo abrir el documento solicitado.')
      setModalDocumentosAbierto(true)
    } finally {
      setDocumentoProcesandoId('')
    }
  }

  function cerrarDocumentos() {
    if (vistaPreviaDocumento) URL.revokeObjectURL(vistaPreviaDocumento.url)
    setVistaPreviaDocumento(null)
    setModalDocumentosAbierto(false)
    setErrorDocumento('')
  }

  return (
    <div className='flex min-h-dvh bg-[#fbfdff] font-sans'>
      <MenuMedicoComp />
      <div className='min-w-0 flex-1'>
        <HeaderDoctorMedicoComp
          especialidad={DOCTORA.especialidad}
          nombre={DOCTORA.nombre}
          variante='amplia'
        />
        <main className='min-h-[calc(100dvh-54px)] px-4 py-3 sm:px-6 xl:px-8'>
          <div className='mx-auto w-full max-w-[1220px]'>
            <header className='px-1'>
              <h1 className='text-[clamp(28px,2.35vw,31px)] font-extrabold leading-[1.08] tracking-[-0.035em] text-[#0a2b79]'>Historial clínico</h1>
              <p className='mt-1 text-[clamp(10px,.9vw,12px)] font-medium leading-4 text-[#50658a]'>Registro cronológico de consultas, tratamientos, medicación, síntomas y documentos.</p>
            </header>

            {avisoCarga && <p aria-live='polite' className='mt-2 rounded-lg border border-[#f5d698] bg-[#fff9e9] px-3 py-2 text-[10px] font-semibold text-[#8b6212]' role='status'>{avisoCarga}</p>}

            {paciente ? (
              <section className='mt-2 grid min-h-[84px] items-center gap-3 rounded-xl border border-[#dce5ee] bg-white px-4 py-2 shadow-[0_3px_10px_rgba(18,52,91,0.06)] sm:grid-cols-[68px_minmax(250px,1fr)] lg:grid-cols-[68px_minmax(300px,330px)_minmax(0,1fr)]'>
                <div className='relative mx-auto h-[66px] w-[66px] overflow-hidden rounded-full border-4 border-[#e1f4f5] bg-[#e6f7f5] sm:mx-0'><img alt={`Foto de ${paciente.nombre}`} className='absolute left-1/2 top-[-18%] h-[185%] w-[185%] max-w-none -translate-x-1/2 object-cover' draggable={false} src={paciente.imagen} /></div>
                <div className='min-w-0 text-center sm:text-left'>
                  <h2 className='truncate text-[clamp(17px,1.5vw,20px)] font-extrabold leading-6 tracking-[-0.025em] text-[#092a76]'>{paciente.nombre}</h2>
                  <div className='mt-1.5 flex flex-wrap items-center justify-center gap-x-6 gap-y-1 text-[10px] font-semibold text-[#536a91] sm:justify-start'><span className='flex items-center gap-2'><IconoMedico className='h-4 w-4 text-[#31559f]' nombre='user' />{paciente.edad === null ? 'Edad no registrada' : `${paciente.edad} años`}</span><span className='flex items-center gap-2 border-l border-[#dfe7ef] pl-5'><IconoMedico className='h-4 w-4 text-[#31559f]' nombre='calendar' />{paciente.historiaClinica}</span></div>
                </div>
                <div className='border-t border-[#e3eaf1] pt-3 text-center sm:col-span-2 lg:col-span-1 lg:border-l lg:border-t-0 lg:py-1 lg:pl-6 lg:text-left'><p className='text-[9px] font-semibold text-[#53698e]'>Diagnóstico principal</p><p className='mt-1.5 text-[11px] font-extrabold text-[#153579]'>{paciente.diagnostico}</p></div>
              </section>
            ) : cargando ? (
              <section aria-live='polite' className='mt-2 grid min-h-[84px] place-items-center rounded-xl border border-[#dce5ee] bg-white px-4 text-[11px] font-semibold text-[#607596]' role='status'>Cargando la ficha del paciente…</section>
            ) : null}

            <nav aria-label='Filtrar historial clínico' className='mb-3 mt-2.5 overflow-x-auto'>
              <div className='flex min-w-max items-center gap-3'>{FILTROS.map((filtro) => {
                const activo = filtroActivo === filtro.valor
                return <button aria-pressed={activo} className={`flex h-[34px] min-w-[96px] shrink-0 items-center justify-center gap-2.5 rounded-full border px-5 text-[10px] font-bold transition ${activo ? 'border-[#08a7b8] bg-gradient-to-r from-[#08aabc] to-[#078da9] text-white' : 'border-[#dbe5ee] bg-white text-[#28477f] hover:border-[#8dd5dc] hover:bg-[#f3fbfc]'}`} key={filtro.valor} onClick={() => setFiltroActivo(filtro.valor)} type='button'><IconoMedico className='h-[18px] w-[18px]' nombre={filtro.icono} />{filtro.texto}</button>
              })}</div>
            </nav>

            {cargando ? (
              <div aria-live='polite' className='grid min-h-52 place-items-center rounded-xl border border-[#dce5ee] bg-white px-4 text-[11px] font-semibold text-[#607596]' role='status'>Cargando eventos clínicos…</div>
            ) : pacienteId ? (
              <ResultadosDocPaciComp documentos={documentos} episodios={episodios} filtro={filtroActivo} onDescargarDocumento={(documento) => void abrirDocumento(documento, true)} onVerDocumento={(documento) => void abrirDocumento(documento, false)} procesandoDocumentoId={documentoProcesandoId} reportesSintomas={reportesSintomas} />
            ) : (
              <div className='grid min-h-52 place-items-center rounded-xl border border-dashed border-[#bfd5e0] bg-white px-6 text-center'><div><IconoMedico className='mx-auto h-10 w-10 text-[#08aabb]' nombre='users' /><p className='mt-3 text-[12px] font-extrabold text-[#173478]'>Selecciona un paciente</p><p className='mt-1 text-[10px] text-[#637795]'>Vuelve al listado de pacientes y abre su ficha para consultar el historial.</p></div></div>
            )}
          </div>
        </main>
      </div>

      {modalDocumentosAbierto && <DocumentosPacienteModalComp documentos={documentos.map(aDocumentoFicha)} error={errorDocumento} nombrePaciente={paciente?.nombre || 'paciente'} onCerrar={cerrarDocumentos} onCerrarVistaPrevia={() => { if (vistaPreviaDocumento) URL.revokeObjectURL(vistaPreviaDocumento.url); setVistaPreviaDocumento(null) }} onDescargar={(documento) => { const original = documentos.find((item) => item.id === documento.id); if (original) void abrirDocumento(original, true) }} onVer={(documento) => { const original = documentos.find((item) => item.id === documento.id); if (original) void abrirDocumento(original, false) }} procesandoId={documentoProcesandoId} vistaPrevia={vistaPreviaDocumento} />}
    </div>
  )
}

export default HistoriaPacientePage
