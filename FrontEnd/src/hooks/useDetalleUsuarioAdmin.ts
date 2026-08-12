import { useCallback, useEffect, useState } from 'react'

import {
  obtenerDetalleAdministrativoUsuarioApi,
  type DetalleAdministrativoUsuarioApi,
} from '../api/admin/AdminApi'
import { obtenerMensajeErrorApi } from '../api/compartido/ClienteApi'

function useDetalleUsuarioAdmin(usuarioId: string | undefined) {
  const [detalle, setDetalle] = useState<DetalleAdministrativoUsuarioApi | null>(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [version, setVersion] = useState(0)

  const recargar = useCallback(() => setVersion((actual) => actual + 1), [])

  useEffect(() => {
    let vigente = true
    if (!usuarioId) {
      setCargando(false)
      setError('No se indicó qué usuario se desea consultar.')
      return
    }

    setCargando(true)
    setError('')
    void obtenerDetalleAdministrativoUsuarioApi(usuarioId)
      .then((respuesta) => {
        if (vigente) setDetalle(respuesta)
      })
      .catch((motivo: unknown) => {
        if (!vigente) return
        setDetalle(null)
        setError(obtenerMensajeErrorApi(motivo))
      })
      .finally(() => {
        if (vigente) setCargando(false)
      })

    return () => {
      vigente = false
    }
  }, [usuarioId, version])

  return { cargando, detalle, error, recargar }
}

export default useDetalleUsuarioAdmin
