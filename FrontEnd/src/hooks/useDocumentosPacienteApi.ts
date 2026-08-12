import { useEffect, useState } from 'react'

import {
  listarDocumentosPacienteApi,
  obtenerArchivoDocumentoPacienteApi,
  subirDocumentoPacienteApi,
  type CrearDocumentoPacienteApi,
  type DocumentoPacienteApi,
} from '../api/paciente/PacienteApi'
import { obtenerMensajeErrorApi } from '../api/compartido/ClienteApi'

function useDocumentosPacienteApi() {
  const [cargando, setCargando] = useState(true)
  const [documentos, setDocumentos] = useState<DocumentoPacienteApi[]>([])
  const [errorCarga, setErrorCarga] = useState('')
  const [errorGuardado, setErrorGuardado] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [mensaje, setMensaje] = useState('')
  const [procesandoArchivoId, setProcesandoArchivoId] = useState<string | null>(null)

  useEffect(() => {
    let componenteActivo = true

    async function cargarDocumentos() {
      try {
        const respuesta = await listarDocumentosPacienteApi(1, 20)
        if (!componenteActivo) return

        setDocumentos(respuesta.resultados)
        setErrorCarga('')
      } catch (errorSolicitud) {
        if (!componenteActivo) return
        setErrorCarga(obtenerMensajeErrorApi(errorSolicitud))
      } finally {
        if (componenteActivo) setCargando(false)
      }
    }

    void cargarDocumentos()

    return () => {
      componenteActivo = false
    }
  }, [])

  async function guardarDocumento(datos: CrearDocumentoPacienteApi) {
    setGuardando(true)
    setErrorGuardado('')
    setMensaje('')

    try {
      const documento = await subirDocumentoPacienteApi(datos)
      setDocumentos((actuales) => [
        documento,
        ...actuales.filter((actual) => actual.id !== documento.id),
      ])
      setMensaje('Documento guardado. El equipo médico podrá revisarlo desde la ficha del paciente.')
      return documento
    } catch (errorSolicitud) {
      setErrorGuardado(obtenerMensajeErrorApi(errorSolicitud))
      return null
    } finally {
      setGuardando(false)
    }
  }

  async function obtenerArchivo(documento: DocumentoPacienteApi, descargar: boolean) {
    setProcesandoArchivoId(documento.id)
    setErrorGuardado('')

    try {
      const archivo = await obtenerArchivoDocumentoPacienteApi(documento.id, descargar)
      const urlTemporal = URL.createObjectURL(archivo)
      const enlace = window.document.createElement('a')
      enlace.href = urlTemporal
      enlace.rel = 'noopener noreferrer'

      if (descargar) {
        enlace.download = documento.nombreOriginal || documento.nombre || 'documento'
      } else {
        enlace.target = '_blank'
      }

      window.document.body.append(enlace)
      enlace.click()
      enlace.remove()
      window.setTimeout(() => URL.revokeObjectURL(urlTemporal), 60_000)
    } catch (errorSolicitud) {
      setErrorGuardado(obtenerMensajeErrorApi(errorSolicitud))
    } finally {
      setProcesandoArchivoId(null)
    }
  }

  return {
    cargando,
    documentos,
    errorCarga,
    errorGuardado,
    guardando,
    guardarDocumento,
    mensaje,
    procesandoArchivoId,
    verDocumento: (documento: DocumentoPacienteApi) => obtenerArchivo(documento, false),
    descargarDocumento: (documento: DocumentoPacienteApi) => obtenerArchivo(documento, true),
  }
}

export default useDocumentosPacienteApi
