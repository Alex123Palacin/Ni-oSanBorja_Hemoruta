import { useCallback, useEffect, useRef, useState } from 'react'

import {
  actualizarRecordatorioClinicaDiaApi,
  ajustarProgramacionClinicaDiaApi,
  cancelarProgramacionClinicaDiaApi,
  confirmarAgendaClinicaDiaApi,
  confirmarProgramacionClinicaDiaApi,
  completarProgramacionClinicaDiaApi,
  descargarPlantillaClinicaDiaApi,
  exportarAgendaClinicaDiaApi,
  generarAgendaClinicaDiaApi,
  importarSolicitudesClinicaDiaApi,
  obtenerTableroClinicaDiaApi,
  programarSolicitudClinicaDiaApi,
  type AjustarProgramacionClinicaDiaApi,
  type EstadoRecordatorioClinicaDiaApi,
  type FiltrosClinicaDiaApi,
  type ProgramarClinicaDiaApi,
  type ResultadoImportacionClinicaDiaApi,
  type TableroClinicaDiaApi,
} from '../api/admin/ClinicaDiaAdminApi'
import { obtenerMensajeErrorApi } from '../api/compartido/ClienteApi'

function descargarBlob(archivo: Blob, nombre: string) {
  const url = URL.createObjectURL(archivo)
  const enlace = document.createElement('a')
  enlace.href = url
  enlace.download = nombre
  enlace.click()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}

function useClinicaDia(filtros: FiltrosClinicaDiaApi) {
  const [datos, setDatos] = useState<TableroClinicaDiaApi | null>(null)
  const [cargando, setCargando] = useState(true)
  const [accionActiva, setAccionActiva] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [resultadoImportacion, setResultadoImportacion] =
    useState<ResultadoImportacionClinicaDiaApi | null>(null)
  const solicitudActual = useRef(0)

  const cargar = useCallback(async () => {
    const idSolicitud = solicitudActual.current + 1
    solicitudActual.current = idSolicitud
    setCargando(true)
    setDatos(null)
    setError('')
    try {
      const respuesta = await obtenerTableroClinicaDiaApi(filtros)
      if (solicitudActual.current === idSolicitud) setDatos(respuesta)
    } catch (errorSolicitud) {
      if (solicitudActual.current === idSolicitud) {
        setError(obtenerMensajeErrorApi(errorSolicitud))
      }
    } finally {
      if (solicitudActual.current === idSolicitud) setCargando(false)
    }
  }, [filtros])

  useEffect(() => {
    void cargar()
  }, [cargar])

  const ejecutar = useCallback(
    async <T,>(clave: string, tarea: () => Promise<T>) => {
      if (accionActiva) throw new Error('Ya hay una operación en curso.')
      setAccionActiva(clave)
      setError('')
      setMensaje('')
      try {
        const resultado = await tarea()
        await cargar()
        return resultado
      } catch (errorAccion) {
        const detalle = obtenerMensajeErrorApi(errorAccion)
        setError(detalle)
        throw errorAccion
      } finally {
        setAccionActiva(null)
      }
    },
    [accionActiva, cargar],
  )

  const importar = useCallback(
    async (archivo: File) => {
      const resultado = await ejecutar('importar', () => importarSolicitudesClinicaDiaApi(archivo))
      setResultadoImportacion(resultado)
      setMensaje(resultado.detalle)
    },
    [ejecutar],
  )

  const generarAgenda = useCallback(async () => {
    const resultado = await ejecutar('generar', () =>
      generarAgendaClinicaDiaApi(filtros.fecha),
    )
    setMensaje(resultado)
  }, [ejecutar, filtros.fecha])

  const programar = useCallback(
    async (valores: ProgramarClinicaDiaApi) => {
      const resultado = await ejecutar('programar', () =>
        programarSolicitudClinicaDiaApi(valores),
      )
      setMensaje(resultado)
    },
    [ejecutar],
  )

  const ajustar = useCallback(
    async (programacionId: string, valores: AjustarProgramacionClinicaDiaApi) => {
      const resultado = await ejecutar(`ajustar-${programacionId}`, () =>
        ajustarProgramacionClinicaDiaApi(programacionId, valores),
      )
      setMensaje(resultado)
    },
    [ejecutar],
  )

  const cancelar = useCallback(
    async (programacionId: string, motivo: string, reprogramar: boolean) => {
      const resultado = await ejecutar(`cancelar-${programacionId}`, () =>
        cancelarProgramacionClinicaDiaApi(programacionId, motivo, reprogramar),
      )
      setMensaje(resultado)
    },
    [ejecutar],
  )

  const confirmar = useCallback(
    async (programacionId: string) => {
      const resultado = await ejecutar(`confirmar-${programacionId}`, () =>
        confirmarProgramacionClinicaDiaApi(programacionId),
      )
      setMensaje(resultado)
    },
    [ejecutar],
  )

  const completar = useCallback(
    async (programacionId: string) => {
      const resultado = await ejecutar(`completar-${programacionId}`, () =>
        completarProgramacionClinicaDiaApi(programacionId),
      )
      setMensaje(resultado)
    },
    [ejecutar],
  )

  const confirmarAgenda = useCallback(async () => {
    const resultado = await ejecutar('confirmar-agenda', () =>
      confirmarAgendaClinicaDiaApi(filtros.fecha),
    )
    setMensaje(resultado.mensaje)
  }, [ejecutar, filtros.fecha])

  const actualizarRecordatorio = useCallback(
    async (
      programacionId: string,
      estado: EstadoRecordatorioClinicaDiaApi,
      observacion?: string,
    ) => {
      const resultado = await ejecutar(`recordatorio-${programacionId}`, () =>
        actualizarRecordatorioClinicaDiaApi(programacionId, estado, observacion),
      )
      setMensaje(resultado)
    },
    [ejecutar],
  )

  const descargarPlantilla = useCallback(async () => {
    setAccionActiva('plantilla')
    setError('')
    try {
      const archivo = await descargarPlantillaClinicaDiaApi()
      descargarBlob(archivo, 'plantilla_clinica_dia.xlsx')
    } catch (errorDescarga) {
      setError(obtenerMensajeErrorApi(errorDescarga))
    } finally {
      setAccionActiva(null)
    }
  }, [])

  const consultarTurnos = useCallback(async (fecha: string) => {
    const respuesta = await obtenerTableroClinicaDiaApi({ fecha })
    return respuesta.turnos
  }, [])

  const consultarPendientes = useCallback(async () => {
    const respuesta = await obtenerTableroClinicaDiaApi({
      estado: 'PENDIENTE',
      fecha: filtros.fecha,
    })
    return respuesta.pendientes
  }, [filtros.fecha])

  const exportar = useCallback(
    async (formato: 'csv' | 'xlsx') => {
      setAccionActiva('exportar')
      setError('')
      try {
        const archivo = await exportarAgendaClinicaDiaApi(formato, filtros.fecha)
        descargarBlob(archivo, `agenda_clinica_dia_${filtros.fecha}.${formato}`)
      } catch (errorDescarga) {
        setError(obtenerMensajeErrorApi(errorDescarga))
      } finally {
        setAccionActiva(null)
      }
    },
    [filtros.fecha],
  )

  return {
    accionActiva,
    actualizarRecordatorio,
    ajustar,
    cancelar,
    cargando,
    confirmar,
    confirmarAgenda,
    completar,
    consultarPendientes,
    consultarTurnos,
    datos,
    descargarPlantilla,
    error,
    exportar,
    generarAgenda,
    importar,
    limpiarAvisos: () => {
      setError('')
      setMensaje('')
      setResultadoImportacion(null)
    },
    mensaje,
    programar,
    recargar: cargar,
    resultadoImportacion,
  }
}

export default useClinicaDia
