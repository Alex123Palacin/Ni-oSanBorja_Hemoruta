import { useState } from 'react'

import type {
  CrearDocumentoPacienteApi,
  DocumentoPacienteApi,
  TipoDocumentoPacienteApi,
} from '../../api/paciente/PacienteApi'
import FondoNino from '../../assets/FondoNiño5.png'
import AdaptadoMobil from '../../components/pacienteMcomp/AdaptadoMobil'
import CargaDocumentosPacienteComp, {
  type BorradorDocumentoPaciente,
  type OpcionTipoDocumentoPaciente,
} from '../../components/pacienteMcomp/CargaDocumentosPacienteComp'
import DocumentosRecientesPacienteComp, {
  type DocumentoRecientePaciente,
} from '../../components/pacienteMcomp/DocumentosRecientesPacienteComp'
import MenuPaciente from '../../components/pacienteMcomp/MenuPaciente'
import NotaDocumentosPacienteComp from '../../components/pacienteMcomp/NotaDocumentosPacienteComp'
import PerfilPacienteNiñoComp, {
  type DatosPerfilPacienteNino,
} from '../../components/pacienteMcomp/PerfilPacienteNiñoComp'
import useDatosInicioPacienteApi from '../../hooks/useDatosInicioPacienteApi'
import { formatearEdadPaciente } from '../../utils/paciente'
import useDocumentosPacienteApi from '../../hooks/useDocumentosPacienteApi'

const OPCIONES_TIPO: readonly OpcionTipoDocumentoPaciente[] = [
  { etiqueta: 'Hemograma', tipo: 'LABORATORIO', valor: 'hemograma' },
  { etiqueta: 'Perfil hepático', tipo: 'LABORATORIO', valor: 'perfil-hepatico' },
  { etiqueta: 'Informe médico', tipo: 'INFORME_MEDICO', valor: 'informe-medico' },
  { etiqueta: 'Otro', tipo: 'OTRO', valor: 'otro' },
]

const BORRADOR_INICIAL: BorradorDocumentoPaciente = {
  archivo: null,
  descripcion: '',
  fechaDocumento: '',
  opcionTipo: 'hemograma',
}

const FORMATOS_FECHA = new Intl.DateTimeFormat('es-PE', {
  day: '2-digit',
  month: '2-digit',
  timeZone: 'America/Lima',
  year: 'numeric',
})

function capitalizarEstado(estado: string) {
  const normalizado = estado.replaceAll('_', ' ').trim().toLocaleLowerCase('es-PE')
  return normalizado
    ? `${normalizado.charAt(0).toLocaleUpperCase('es-PE')}${normalizado.slice(1)}`
    : 'Pendiente'
}

function obtenerFechaDocumento(documento: DocumentoPacienteApi) {
  const fechaIso = documento.fechaDocumento || documento.creadoEn.slice(0, 10)
  const fecha = new Date(`${fechaIso.slice(0, 10)}T12:00:00`)

  return {
    fecha: Number.isNaN(fecha.getTime()) ? fechaIso : FORMATOS_FECHA.format(fecha),
    fechaIso,
  }
}

function obtenerOrigenDocumento(origen?: DocumentoPacienteApi['origen']) {
  const origenes: Record<NonNullable<DocumentoPacienteApi['origen']>, string> = {
    APP: 'Subido desde App',
    MEDICO: 'Compartido por el doctor',
    SISTEMA: 'Registro del hospital',
  }

  return origen ? origenes[origen] : 'Documento clínico'
}

function crearDocumentoMostrado(documento: DocumentoPacienteApi): DocumentoRecientePaciente {
  const { fecha, fechaIso } = obtenerFechaDocumento(documento)
  const nombre = documento.nombreOriginal || documento.nombre

  return {
    archivoDisponible: documento.archivoDisponible,
    estado: documento.estado,
    fecha,
    fechaIso,
    id: documento.id,
    nombre,
    origen: obtenerOrigenDocumento(documento.origen),
    tono:
      documento.tipoMime.toLocaleLowerCase().startsWith('image/') || /\.(png|jpe?g)$/i.test(nombre)
        ? 'imagen'
        : 'pdf',
  }
}

function validarArchivo(archivo: File) {
  const extensionValida = /\.(pdf|png|jpe?g)$/i.test(archivo.name)
  if (!extensionValida) return 'El archivo debe ser PDF, PNG o JPG.'
  if (archivo.size > 15 * 1024 * 1024) return 'El archivo no puede superar 15 MB.'
  return ''
}

function DocumentosPage() {
  const [borrador, setBorrador] = useState<BorradorDocumentoPaciente>(BORRADOR_INICIAL)
  const [errorFormulario, setErrorFormulario] = useState('')
  const { datos: datosInicio, error: errorPerfil } = useDatosInicioPacienteApi()
  const {
    cargando,
    descargarDocumento,
    documentos,
    errorCarga,
    errorGuardado,
    guardando,
    guardarDocumento,
    mensaje,
    procesandoArchivoId,
    verDocumento,
  } = useDocumentosPacienteApi()

  const paciente: DatosPerfilPacienteNino | null = datosInicio
    ? {
        edad: formatearEdadPaciente(datosInicio.paciente.edad),
        estado: capitalizarEstado(datosInicio.paciente.estado),
        historiaClinica: datosInicio.paciente.historiaClinica,
        imagen: FondoNino,
        nombre: datosInicio.paciente.nombre,
      }
    : null

  const documentosMostrados = documentos.map(crearDocumentoMostrado)

  function cambiarBorrador(cambio: Partial<BorradorDocumentoPaciente>) {
    setBorrador((actual) => ({ ...actual, ...cambio }))
    setErrorFormulario('')
  }

  async function guardar() {
    if (!borrador.archivo) {
      setErrorFormulario('Selecciona un PDF o una imagen antes de guardar.')
      return
    }

    const errorArchivo = validarArchivo(borrador.archivo)
    if (errorArchivo) {
      setErrorFormulario(errorArchivo)
      return
    }

    const opcion = OPCIONES_TIPO.find((tipo) => tipo.valor === borrador.opcionTipo)
    const datos: CrearDocumentoPacienteApi = {
      archivo: borrador.archivo,
      descripcion: borrador.descripcion,
      fechaDocumento: borrador.fechaDocumento,
      tipo: (opcion?.tipo ?? 'OTRO') as TipoDocumentoPacienteApi,
      titulo: borrador.archivo.name,
    }
    const guardado = await guardarDocumento(datos)

    if (guardado) {
      setBorrador(BORRADOR_INICIAL)
      setErrorFormulario('')
    }
  }

  function obtenerDocumentoApi(documento: DocumentoRecientePaciente) {
    return documentos.find((documentoApi) => documentoApi.id === documento.id)
  }

  function abrirDocumento(documento: DocumentoRecientePaciente) {
    const documentoApi = obtenerDocumentoApi(documento)
    if (documentoApi) void verDocumento(documentoApi)
  }

  function descargar(documento: DocumentoRecientePaciente) {
    const documentoApi = obtenerDocumentoApi(documento)
    if (documentoApi) void descargarDocumento(documentoApi)
  }

  return (
    <AdaptadoMobil estilos='bg-[#f8fbfd] text-[#082767]'>
      <div className='flex h-full min-h-0 w-full flex-col overflow-hidden bg-[#f8fbfd]'>
        <main className='min-h-0 flex-1 overflow-y-auto px-2.5 pb-2 pt-2'>
          {paciente ? (
            <PerfilPacienteNiñoComp paciente={paciente} />
          ) : (
            <div className='h-[98px] animate-pulse rounded-xl border border-[#e1e9ef] bg-white' />
          )}

          {(errorPerfil || errorCarga) && (
            <p
              className='mt-1.5 rounded-md bg-[#fff8e8] px-2 py-1 text-center text-[6.7px] font-semibold text-[#9a6a17]'
              role='status'
              title={[errorPerfil, errorCarga].filter(Boolean).join(' ')}
            >
              No se pudo actualizar toda la información. Verifica la conexión con el hospital.
            </p>
          )}

          <header className='mt-2.5'>
            <h1 className='text-[14px] font-extrabold tracking-[-0.025em] text-[#0a2b70]'>Exámenes y documentos</h1>
            <p className='mt-0.5 text-[7px] font-medium leading-[11px] text-[#627592]'>
              Escanea o sube resultados para que el doctor los vea en la ficha del paciente.
            </p>
          </header>

          <div className='mt-2'>
            <CargaDocumentosPacienteComp
              borrador={borrador}
              error={errorFormulario || errorGuardado}
              guardando={guardando}
              onCambiar={cambiarBorrador}
              onGuardar={guardar}
              opcionesTipo={OPCIONES_TIPO}
            />
          </div>

          {mensaje && (
            <p className='mt-1.5 rounded-[8px] border border-[#bce8cb] bg-[#effbf3] px-2 py-1.5 text-center text-[7px] font-semibold text-[#218744]' role='status'>
              {mensaje}
            </p>
          )}

          <div className='mt-2.5'>
            <DocumentosRecientesPacienteComp
              cargando={cargando}
              documentos={documentosMostrados}
              onDescargar={descargar}
              onVer={abrirDocumento}
              procesandoId={procesandoArchivoId}
            />
          </div>

          <div className='mt-2'>
            <NotaDocumentosPacienteComp
              descripcion='No es necesario escribir los valores del examen. Solo sube el archivo.'
              titulo='Tu archivo se comparte de forma segura con el equipo médico.'
            />
          </div>
        </main>

        <MenuPaciente />
      </div>
    </AdaptadoMobil>
  )
}

export default DocumentosPage
