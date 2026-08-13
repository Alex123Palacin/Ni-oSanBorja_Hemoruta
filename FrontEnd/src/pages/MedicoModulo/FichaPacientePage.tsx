import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

import useAuth from '../../auth/useAuth'
import {
  listarAgendaPacienteMedicoApi,
  listarDocumentosPacienteMedicoApi,
  listarSintomasPacienteMedicoApi,
  obtenerArchivoDocumentoMedicoApi,
  obtenerFichaPacienteMedicoApi,
  type CitaPacienteMedicoApi,
  type DocumentoPacienteMedicoApi,
  type FichaPacienteMedicoApi,
  type ReporteSintomasPacienteMedicoApi,
} from '../../api/medico/MedicoApi'
import fondoPaciente from '../../assets/FondoNiño5.png'
import DatosDocPacientComp from '../../components/DatosDocPacientComp'
import HeaderDoctorMedicoComp from '../../components/HeaderDoctorMedicoComp'
import IconoMedico from '../../components/IconoMedico'
import MenuMedicoComp from '../../components/MenuMedicoComp'
import PerfilDocPacientComp from '../../components/PerfilDocPacientComp'
import AgendaPacienteModalComp from '../../components/medicoMcomp/AgendaPacienteModalComp'
import DocumentosPacienteModalComp, {
  type VistaPreviaDocumentoPaciente,
} from '../../components/medicoMcomp/DocumentosPacienteModalComp'
import HistorialSintomasPacienteModalComp from '../../components/medicoMcomp/HistorialSintomasPacienteModalComp'
import TarjetaDocumentosComp from '../../components/medicoMcomp/TarjetaDocumentosComp'
import TarjetaProximaCitaComp, {
  type ProximaCitaFichaPaciente,
} from '../../components/medicoMcomp/TarjetaProximaCitaComp'
import TarjetaSemaforoComp from '../../components/medicoMcomp/TarjetaSemaforoComp'
import type { SemaforoFichaPaciente } from '../../components/medicoMcomp/TarjetaSemaforoComp'
import useRedirrecion from '../../hooks/Redirrecion'
import type {
  DocumentoFichaPaciente,
  PerfilFichaPaciente,
  SeccionDatosFichaPaciente,
} from '../../types/FichaPaciente'

const DOCTORA = {
  especialidad: 'Hematología Pediátrica',
  nombre: 'Dra. Valeria Ruiz',
}

const CLAVE_PACIENTE_SELECCIONADO = 'hemoruta.medico.pacienteId'
const SIN_REGISTRO = 'No registrado'

const PERFIL_PACIENTE: PerfilFichaPaciente = {
  adultoResponsable: SIN_REGISTRO,
  cuentaMovil: 'Sin cuenta vinculada',
  diagnosticoPrincipal: 'Sin diagnóstico registrado',
  edad: null,
  especialidadMedica: 'Hematología Pediátrica',
  estadoCuenta: 'Sin datos',
  historiaClinica: SIN_REGISTRO,
  imagen: fondoPaciente,
  medicoTratante: SIN_REGISTRO,
  nombre: 'Paciente no seleccionado',
  parentescoResponsable: 'Sin responsable',
  tipoSangre: SIN_REGISTRO,
}

const PROXIMA_CITA = {
  fecha: 'Sin cita declarada',
  hora: 'Por definir',
  motivo: 'Aún no se registró una próxima cita.',
  servicio: 'Pendiente de programación',
} satisfies ProximaCitaFichaPaciente

const PROXIMA_CITA_SIN_DATOS = {
  fecha: 'Sin cita declarada',
  hora: 'Por definir',
  motivo: 'Aún no se registró una próxima cita.',
  servicio: 'Pendiente de programación',
} satisfies ProximaCitaFichaPaciente

const SECCIONES_DATOS: SeccionDatosFichaPaciente[] = [
  {
    icono: 'calendar',
    items: [
      { etiqueta: 'Fecha de nacimiento', valor: '16/03/2017' },
      { etiqueta: 'Sexo', valor: 'Masculino' },
      { etiqueta: 'Lugar de nacimiento', valor: 'Lima, Perú' },
      { etiqueta: 'Nacionalidad', valor: 'Peruana' },
      { etiqueta: 'Idioma', valor: 'Español' },
    ],
    titulo: 'Datos generales',
  },
  {
    distribucion: 'contacto',
    icono: 'users',
    items: [
      {
        detalles: [
          { icono: 'phone', texto: '987 654 321' },
          { icono: 'mail', texto: 'maria.flores@email.com', tono: 'azul' },
        ],
        etiqueta: 'Madre',
        valor: 'María Flores López',
      },
      {
        detalles: [
          { icono: 'phone', texto: '912 345 678' },
          { icono: 'mail', texto: 'carlos.flores@gmail.com', tono: 'azul' },
        ],
        etiqueta: 'Padre',
        valor: 'Carlos Flores Paredes',
      },
    ],
    titulo: 'Contacto familiar',
  },
  {
    icono: 'smartphone',
    items: [
      { etiqueta: 'Estado', tono: 'exito', valor: 'Activa' },
      { etiqueta: 'Usuario', valor: 'mateo.flores' },
      { etiqueta: 'Dispositivo', valor: 'iPhone 12' },
      { etiqueta: 'Último acceso', valor: '19/05/2025 08:45 a. m.' },
    ],
    titulo: 'Cuenta móvil',
  },
  {
    icono: 'clipboard',
    items: [
      { etiqueta: 'Diagnóstico principal', valor: 'Leucemia linfoblástica aguda (LLA)' },
      { etiqueta: 'Fecha de diagnóstico', valor: '15/05/2025' },
      { etiqueta: 'Riesgo', tono: 'alerta', valor: 'Intermedio' },
      { etiqueta: 'Estado actual', valor: 'En tratamiento' },
    ],
    titulo: 'Resumen clínico',
  },
]

const SEMAFORO: SemaforoFichaPaciente = {
  codigo: 'SIN_DATOS',
  descripcion: 'Sin evaluación de seguimiento vigente.',
  titulo: 'Sin datos',
}

const ETIQUETAS_SEXO: Record<string, string> = {
  F: 'Femenino',
  M: 'Masculino',
  N: 'No especificado',
  O: 'Otro',
}

const ETIQUETAS_CUENTA: Record<string, string> = {
  ACTIVA: 'Activa',
  NO_HABILITADA: 'Sin cuenta',
  PENDIENTE: 'Pendiente',
  SUSPENDIDA: 'Suspendida',
}

const ETIQUETAS_SEMAFORO: Record<string, string> = {
  AMARILLO: 'Atención',
  ROJO: 'Alerta',
  SIN_DATOS: 'Sin datos',
  VERDE: 'Estable',
}

function formatearFecha(fechaIso: string, incluirHora = false) {
  const fecha = new Date(fechaIso.length === 10 ? `${fechaIso}T00:00:00` : fechaIso)
  if (Number.isNaN(fecha.getTime())) return ''

  return new Intl.DateTimeFormat('es-PE', {
    day: '2-digit',
    hour: incluirHora ? '2-digit' : undefined,
    hour12: incluirHora ? true : undefined,
    minute: incluirHora ? '2-digit' : undefined,
    month: '2-digit',
    year: 'numeric',
  }).format(fecha)
}

function formatearHora(fechaIso: string) {
  const fecha = new Date(fechaIso)
  if (Number.isNaN(fecha.getTime())) return ''
  return new Intl.DateTimeFormat('es-PE', { hour: '2-digit', hour12: true, minute: '2-digit' }).format(fecha)
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

function obtenerDato(
  datos: FichaPacienteMedicoApi['datosGenerales'],
  clave: string,
  respaldo: string,
) {
  const valor = datos[clave]
  return typeof valor === 'string' && valor.trim() ? valor : respaldo
}

function etiquetaParentesco(parentesco: string) {
  const normalizado = parentesco.trim().toLowerCase()
  return normalizado ? normalizado[0].toUpperCase() + normalizado.slice(1) : 'Responsable'
}

function mapearPerfilPaciente(
  ficha: FichaPacienteMedicoApi,
  medicoTratante: string,
  especialidadMedica: string,
): PerfilFichaPaciente {
  const responsable = ficha.responsables[0]
  const fechaNacimiento = ficha.datosGenerales.fechaNacimiento
  const estadoCuenta = ETIQUETAS_CUENTA[ficha.cuentaMovil.estado] ?? ficha.cuentaMovil.estado

  return {
    ...PERFIL_PACIENTE,
    adultoResponsable: responsable?.nombre || SIN_REGISTRO,
    cuentaMovil:
      ficha.cuentaMovil.estado === 'ACTIVA' ? 'Cuenta móvil habilitada' : 'Cuenta móvil no habilitada',
    diagnosticoPrincipal: ficha.diagnosticoPrincipal?.nombre || 'Sin diagnóstico registrado',
    edad: calcularEdad(fechaNacimiento),
    especialidadMedica,
    estadoCuenta,
    historiaClinica: ficha.historiaClinica || SIN_REGISTRO,
    medicoTratante,
    nombre: ficha.nombre || SIN_REGISTRO,
    parentescoResponsable: responsable
      ? etiquetaParentesco(responsable.parentesco)
      : 'Sin responsable',
    tipoSangre: obtenerDato(ficha.datosGenerales, 'grupoSanguineo', SIN_REGISTRO),
  }
}

function mapearProximaCita(ficha: FichaPacienteMedicoApi): ProximaCitaFichaPaciente {
  if (!ficha.proximaCitaEn) return PROXIMA_CITA_SIN_DATOS

  return {
    motivo: 'Cita registrada',
    servicio: 'Consulta programada',
    fecha: formatearFecha(ficha.proximaCitaEn) || PROXIMA_CITA.fecha,
    hora: formatearHora(ficha.proximaCitaEn) || PROXIMA_CITA.hora,
  }
}

function mapearDocumentos(ficha: FichaPacienteMedicoApi): DocumentoFichaPaciente[] {
  if (ficha.documentosRecientes.length === 0) return []

  return ficha.documentosRecientes.map((documento) => ({
    archivoDisponible: documento.archivoDisponible,
    estado: documento.estado,
    fecha: formatearFecha(documento.creadoEn),
    formato: documento.tipoMime.includes('pdf')
      ? 'PDF'
      : documento.tipoMime.split('/').at(-1)?.toUpperCase() || 'ARCHIVO',
    id: documento.id,
    nombre: documento.nombreOriginal || documento.nombre,
    tipoMime: documento.tipoMime,
  }))
}

function mapearDocumentoCompleto(documento: DocumentoPacienteMedicoApi): DocumentoFichaPaciente {
  return {
    archivoDisponible: documento.archivoDisponible,
    estado: documento.estado,
    fecha: formatearFecha(documento.fechaDocumento || documento.creadoEn),
    formato: documento.tipoMime.includes('pdf')
      ? 'PDF'
      : documento.tipoMime.split('/').at(-1)?.toUpperCase() || 'ARCHIVO',
    id: documento.id,
    nombre: documento.nombreOriginal || documento.nombre,
    tipoMime: documento.tipoMime,
  }
}

function mapearSeccionesDatos(ficha: FichaPacienteMedicoApi): SeccionDatosFichaPaciente[] {
  const datos = ficha.datosGenerales
  const contactos = ficha.responsables.length
    ? ficha.responsables.map((responsable) => ({
        detalles: responsable.telefono
          ? [{ icono: 'phone' as const, texto: responsable.telefono }]
          : [],
        etiqueta: etiquetaParentesco(responsable.parentesco),
        valor: responsable.nombre,
      }))
    : [{ etiqueta: 'Responsable', valor: SIN_REGISTRO }]
  const estadoCuenta = ETIQUETAS_CUENTA[ficha.cuentaMovil.estado] ?? ficha.cuentaMovil.estado

  return [
    {
      ...SECCIONES_DATOS[0],
      items: [
        {
          etiqueta: 'Fecha de nacimiento',
          valor:
            formatearFecha(obtenerDato(datos, 'fechaNacimiento', '')) ||
            SIN_REGISTRO,
        },
        {
          etiqueta: 'Sexo',
          valor:
            ETIQUETAS_SEXO[obtenerDato(datos, 'sexo', '')] ||
            SIN_REGISTRO,
        },
        {
          etiqueta: 'Lugar de nacimiento',
          valor: obtenerDato(datos, 'lugarNacimiento', SIN_REGISTRO),
        },
        {
          etiqueta: 'Nacionalidad',
          valor: obtenerDato(datos, 'nacionalidad', SIN_REGISTRO),
        },
        {
          etiqueta: 'Idioma',
          valor: obtenerDato(datos, 'idiomaPreferido', SIN_REGISTRO),
        },
      ],
    },
    { ...SECCIONES_DATOS[1], items: contactos },
    {
      ...SECCIONES_DATOS[2],
      items: [
        {
          etiqueta: 'Estado',
          tono: ficha.cuentaMovil.estado === 'ACTIVA' ? 'exito' : 'normal',
          valor: estadoCuenta,
        },
        { etiqueta: 'Usuario', valor: 'Cuenta vinculada' },
        { etiqueta: 'Dispositivo', valor: SIN_REGISTRO },
        {
          etiqueta: 'Último acceso',
          valor: ficha.cuentaMovil.ultimoAccesoEn
            ? formatearFecha(ficha.cuentaMovil.ultimoAccesoEn, true)
            : 'Sin accesos registrados',
        },
      ],
    },
    {
      ...SECCIONES_DATOS[3],
      items: [
        {
          etiqueta: 'Diagnóstico principal',
          valor: ficha.diagnosticoPrincipal?.nombre || 'Sin diagnóstico registrado',
        },
        { etiqueta: 'Fecha de diagnóstico', valor: SIN_REGISTRO },
        { etiqueta: 'Riesgo', valor: SIN_REGISTRO },
        { etiqueta: 'Estado actual', valor: 'Pendiente de evaluación' },
      ],
    },
  ]
}

function mapearSemaforo(ficha: FichaPacienteMedicoApi): SemaforoFichaPaciente {
  return {
    codigo: ficha.semaforo.codigo,
    descripcion: ficha.semaforo.descripcion || 'Sin evaluación de seguimiento vigente.',
    titulo: ETIQUETAS_SEMAFORO[ficha.semaforo.codigo] ?? ficha.semaforo.codigo,
  }
}

function FichaPacientePage() {
  const { usuario } = useAuth()
  const redirigir = useRedirrecion()
  const [parametrosBusqueda] = useSearchParams()
  const panelInicialAtendido = useRef(false)
  const [perfilPaciente, setPerfilPaciente] = useState(PERFIL_PACIENTE)
  const [proximaCita, setProximaCita] = useState<ProximaCitaFichaPaciente>(PROXIMA_CITA)
  const [documentos, setDocumentos] = useState<DocumentoFichaPaciente[]>([])
  const [seccionesDatos, setSeccionesDatos] = useState<SeccionDatosFichaPaciente[]>([])
  const [semaforo, setSemaforo] = useState<SemaforoFichaPaciente>(SEMAFORO)
  const [avisoCarga, setAvisoCarga] = useState('')
  const [documentoProcesandoId, setDocumentoProcesandoId] = useState('')
  const [agendaAbierta, setAgendaAbierta] = useState(false)
  const [agenda, setAgenda] = useState<CitaPacienteMedicoApi[]>([])
  const [agendaProcesando, setAgendaProcesando] = useState(false)
  const [agendaError, setAgendaError] = useState('')
  const [documentosAbiertos, setDocumentosAbiertos] = useState(false)
  const [todosLosDocumentos, setTodosLosDocumentos] = useState<DocumentoFichaPaciente[]>([])
  const [documentosProcesando, setDocumentosProcesando] = useState(false)
  const [documentosError, setDocumentosError] = useState('')
  const [vistaPreviaDocumento, setVistaPreviaDocumento] = useState<VistaPreviaDocumentoPaciente | null>(null)
  const [sintomasAbiertos, setSintomasAbiertos] = useState(false)
  const [historialSintomas, setHistorialSintomas] = useState<ReporteSintomasPacienteMedicoApi[]>([])
  const [sintomasProcesando, setSintomasProcesando] = useState(false)
  const [sintomasError, setSintomasError] = useState('')

  useEffect(() => {
    const pacienteId = window.sessionStorage.getItem(CLAVE_PACIENTE_SELECCIONADO)
    if (!pacienteId) {
      setAvisoCarga('Selecciona un paciente del listado para consultar su información actualizada.')
      return undefined
    }

    let paginaActiva = true
    obtenerFichaPacienteMedicoApi(pacienteId)
      .then((ficha) => {
        if (!paginaActiva) return
        const nombreMedico =
          usuario?.nombreCompleto ||
          [usuario?.nombre, usuario?.apellidos].filter(Boolean).join(' ') ||
          DOCTORA.nombre
        setPerfilPaciente(
          mapearPerfilPaciente(
            ficha,
            nombreMedico,
            usuario?.especialidad || DOCTORA.especialidad,
          ),
        )
        setProximaCita(mapearProximaCita(ficha))
        setDocumentos(mapearDocumentos(ficha))
        setSeccionesDatos(mapearSeccionesDatos(ficha))
        setSemaforo(mapearSemaforo(ficha))
        setAvisoCarga('')
      })
      .catch(() => {
        if (paginaActiva) {
          setAvisoCarga('No se pudo actualizar la ficha del paciente seleccionado.')
        }
      })

    return () => {
      paginaActiva = false
    }
  }, [usuario])

  async function abrirArchivoDocumento(documento: DocumentoFichaPaciente, descargar: boolean) {
    if (!documento.id || !documento.archivoDisponible || documentoProcesandoId) return

    setDocumentoProcesandoId(documento.id)
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
      } else {
        setDocumentosAbiertos(true)
        setVistaPreviaDocumento((actual) => {
          if (actual) URL.revokeObjectURL(actual.url)
          return {
            nombre: documento.nombre,
            tipoMime: archivo.type || documento.tipoMime || 'application/pdf',
            url,
          }
        })
        return
      }
      window.setTimeout(() => URL.revokeObjectURL(url), 60_000)
    } catch {
      setAvisoCarga('No se pudo abrir el documento. Verifica que el archivo siga disponible.')
    } finally {
      setDocumentoProcesandoId('')
    }
  }

  async function abrirAgenda() {
    setAgendaAbierta(true)
    const pacienteId = window.sessionStorage.getItem(CLAVE_PACIENTE_SELECCIONADO)
    if (!pacienteId) {
      setAgendaError('Selecciona un paciente para consultar su agenda.')
      return
    }
    setAgendaProcesando(true)
    setAgendaError('')
    try {
      const respuesta = await listarAgendaPacienteMedicoApi(pacienteId)
      setAgenda(respuesta.resultados)
    } catch {
      setAgendaError('No se pudo cargar la agenda del paciente.')
    } finally {
      setAgendaProcesando(false)
    }
  }

  async function abrirTodosLosDocumentos() {
    setDocumentosAbiertos(true)
    setVistaPreviaDocumento(null)
    const pacienteId = window.sessionStorage.getItem(CLAVE_PACIENTE_SELECCIONADO)
    if (!pacienteId) {
      setDocumentosError('Selecciona un paciente para consultar sus documentos.')
      return
    }
    setDocumentosProcesando(true)
    setDocumentosError('')
    try {
      const respuesta = await listarDocumentosPacienteMedicoApi(pacienteId)
      setTodosLosDocumentos(respuesta.resultados.map(mapearDocumentoCompleto))
    } catch {
      setDocumentosError('No se pudieron cargar los documentos del paciente.')
    } finally {
      setDocumentosProcesando(false)
    }
  }

  async function abrirHistorialSintomas() {
    setSintomasAbiertos(true)
    const pacienteId = window.sessionStorage.getItem(CLAVE_PACIENTE_SELECCIONADO)
    if (!pacienteId) {
      setSintomasError('Selecciona un paciente para consultar sus síntomas.')
      return
    }
    setSintomasProcesando(true)
    setSintomasError('')
    try {
      const respuesta = await listarSintomasPacienteMedicoApi(pacienteId)
      setHistorialSintomas(respuesta.resultados)
    } catch {
      setSintomasError('No se pudo cargar el historial de síntomas del paciente.')
    } finally {
      setSintomasProcesando(false)
    }
  }

  function cerrarDocumentos() {
    if (vistaPreviaDocumento) URL.revokeObjectURL(vistaPreviaDocumento.url)
    setVistaPreviaDocumento(null)
    setDocumentosAbiertos(false)
  }

  useEffect(() => {
    if (panelInicialAtendido.current) return
    panelInicialAtendido.current = true

    const panel = parametrosBusqueda.get('panel')
    if (panel === 'agenda') void abrirAgenda()
    if (panel === 'documentos') void abrirTodosLosDocumentos()
    if (panel === 'sintomas') void abrirHistorialSintomas()
  }, [parametrosBusqueda])

  return (
    <div className='flex min-h-dvh bg-[#fbfdff] font-sans'>
      <MenuMedicoComp />

      <div className='min-w-0 flex-1'>
        <HeaderDoctorMedicoComp
          especialidad={DOCTORA.especialidad}
          nombre={DOCTORA.nombre}
          variante='amplia'
        />

        <main className='min-h-[calc(100dvh-54px)] px-4 pb-2.5 pt-6 sm:px-6 xl:px-8'>
          <div className='mx-auto w-full max-w-[1220px]'>
            <header className='flex flex-col gap-3 px-1 sm:flex-row sm:items-start sm:justify-between'>
              <div>
                <h1 className='text-[clamp(28px,2.45vw,32px)] font-extrabold leading-[1.08] tracking-[-0.035em] text-[#0a2b79]'>
                  Ficha del paciente
                </h1>
                <p className='mt-1 text-[clamp(10px,.9vw,12px)] font-medium leading-5 text-[#50658a]'>
                  Vista resumida de la información clínica, familiar y de seguimiento del paciente.
                </p>
              </div>
              <div className='flex flex-wrap gap-2.5'>
                <button
                  className='flex h-10 cursor-pointer items-center gap-2 rounded-lg border border-[#d6e1ec] bg-white px-4 text-[10px] font-bold text-[#37517f] transition hover:bg-[#f6fafc] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#08aabb]'
                  onClick={() => redirigir('/doctor/pacientes')}
                  type='button'
                >
                  <IconoMedico className='h-4 w-4' nombre='arrowLeft' />
                  Volver al listado
                </button>
                <button
                  className='flex h-10 cursor-not-allowed items-center gap-2 rounded-lg bg-gradient-to-r from-[#08aabc] to-[#078da9] px-5 text-[11px] font-bold text-white opacity-55 shadow-[0_4px_10px_rgba(5,111,124,0.16)]'
                  disabled
                  title='La edición de la ficha todavía no está habilitada'
                  type='button'
                >
                  <IconoMedico className='h-[18px] w-[18px]' nombre='edit' />
                  Editar ficha
                </button>
              </div>
            </header>

            {avisoCarga && (
              <p
                aria-live='polite'
                className='mt-2 px-1 text-[10px] font-medium text-[#6d7f9d]'
                role='status'
              >
                {avisoCarga}
              </p>
            )}

            <div className='mt-4'>
              <PerfilDocPacientComp
                onHistorial={() => redirigir('/doctor/historial')}
                perfil={perfilPaciente}
              />
            </div>

            <section
              aria-label='Resumen del estado del paciente'
              className='mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-[.84fr_1fr_1.12fr] xl:gap-6'
            >
              <TarjetaSemaforoComp
                onVerDetalles={() => void abrirHistorialSintomas()}
                semaforo={semaforo}
              />
              <TarjetaProximaCitaComp onVerAgenda={() => void abrirAgenda()} proximaCita={proximaCita} />
              <TarjetaDocumentosComp
                documentos={documentos}
                onDescargar={(documento) => void abrirArchivoDocumento(documento, true)}
                onVer={(documento) => void abrirArchivoDocumento(documento, false)}
                onVerTodos={() => void abrirTodosLosDocumentos()}
                procesandoId={documentoProcesandoId}
              />
            </section>

            <div className='mt-3'>
              <DatosDocPacientComp secciones={seccionesDatos} />
            </div>

            <div className='mt-[18px] flex items-center justify-center gap-7 lg:-translate-x-[clamp(88px,7vw,102px)]'>
              <span aria-hidden='true' className='hidden h-11 w-px bg-[#d7e1ec] sm:block' />
              <button
                className='flex h-[60px] w-[332px] max-w-full cursor-pointer items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-[#08aabc] to-[#078da9] px-6 text-[20px] font-medium text-white shadow-[0_6px_14px_rgba(5,111,124,0.2)] transition hover:-translate-y-0.5 hover:brightness-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#08aabb] active:translate-y-0'
                onClick={() => redirigir('/doctor/consulta')}
                type='button'
              >
                <IconoMedico className='h-7 w-7' nombre='microphone' strokeWidth={1.9} />
                Nueva consulta por voz
              </button>
              <span aria-hidden='true' className='hidden h-11 w-px bg-[#d7e1ec] sm:block' />
            </div>
          </div>
        </main>
      </div>

      {agendaAbierta && (
        <AgendaPacienteModalComp
          citas={agenda}
          error={agendaError}
          nombrePaciente={perfilPaciente.nombre}
          onCerrar={() => setAgendaAbierta(false)}
          procesando={agendaProcesando}
        />
      )}
      {documentosAbiertos && (
        <DocumentosPacienteModalComp
          documentos={todosLosDocumentos.length ? todosLosDocumentos : documentos}
          error={documentosError}
          nombrePaciente={perfilPaciente.nombre}
          onCerrar={cerrarDocumentos}
          onCerrarVistaPrevia={() => {
            if (vistaPreviaDocumento) URL.revokeObjectURL(vistaPreviaDocumento.url)
            setVistaPreviaDocumento(null)
          }}
          onDescargar={(documento) => void abrirArchivoDocumento(documento, true)}
          onVer={(documento) => void abrirArchivoDocumento(documento, false)}
          procesando={documentosProcesando}
          procesandoId={documentoProcesandoId}
          vistaPrevia={vistaPreviaDocumento}
        />
      )}
      {sintomasAbiertos && (
        <HistorialSintomasPacienteModalComp
          error={sintomasError}
          nombrePaciente={perfilPaciente.nombre}
          onCerrar={() => setSintomasAbiertos(false)}
          procesando={sintomasProcesando}
          reportes={historialSintomas}
        />
      )}
    </div>
  )
}

export default FichaPacientePage
