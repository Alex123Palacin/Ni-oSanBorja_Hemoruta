import type { ProblemaApi } from './TiposApi'

const CLAVE_TOKEN = 'hemoruta.token'
const CLAVE_BLOQUEO_TOKEN_PERSISTENTE = 'hemoruta.token.persistente-bloqueado'
const URL_API_POR_DEFECTO = 'http://127.0.0.1:8000/api/v1'
export const EVENTO_SESION_INVALIDA_API = 'hemoruta:sesion-invalida'

type ValorConsultaApi = boolean | number | string | null | undefined

interface OpcionesSolicitudApi extends Omit<RequestInit, 'body'> {
  autenticado?: boolean
  cuerpo?: unknown
  consulta?: Record<string, ValorConsultaApi>
}

export class ErrorApi extends Error {
  codigo?: string
  erroresCampos?: Record<string, string[]>
  estado: number
  traceId?: string

  constructor(mensaje: string, estado: number, problema?: ProblemaApi) {
    super(mensaje)
    this.name = 'ErrorApi'
    this.codigo = problema?.codigo
    this.erroresCampos = problema?.erroresCampos
    this.estado = estado
    this.traceId = problema?.traceId
  }
}

function obtenerUrlBaseApi() {
  const configurada = import.meta.env.VITE_API_URL?.trim()
  return (configurada || URL_API_POR_DEFECTO).replace(/\/$/, '')
}

function obtenerEsquemaTokenApi() {
  return import.meta.env.VITE_API_TOKEN_SCHEME?.trim() || 'Bearer'
}

function construirUrlApi(ruta: string, consulta?: Record<string, ValorConsultaApi>) {
  const rutaNormalizada = ruta.startsWith('/') ? ruta : `/${ruta}`
  const url = new URL(`${obtenerUrlBaseApi()}${rutaNormalizada}`)

  Object.entries(consulta ?? {}).forEach(([clave, valor]) => {
    if (valor !== undefined && valor !== null && valor !== '') {
      url.searchParams.set(clave, String(valor))
    }
  })

  return url.toString()
}

function esObjeto(valor: unknown): valor is Record<string, unknown> {
  return typeof valor === 'object' && valor !== null
}

function obtenerErroresCamposApi(valor: Record<string, unknown>) {
  if (esObjeto(valor.erroresCampos)) {
    return valor.erroresCampos as Record<string, string[]>
  }

  const errores = Object.entries(valor).reduce<Record<string, string[]>>(
    (acumulado, [campo, detalle]) => {
      if (Array.isArray(detalle) && detalle.every((mensaje) => typeof mensaje === 'string')) {
        acumulado[campo] = detalle
      }
      return acumulado
    },
    {},
  )

  return Object.keys(errores).length > 0 ? errores : undefined
}

function normalizarProblemaApi(valor: unknown): ProblemaApi {
  if (!esObjeto(valor)) return {}

  const erroresCampos = obtenerErroresCamposApi(valor)
  const primerErrorCampo = erroresCampos ? Object.values(erroresCampos)[0]?.[0] : undefined

  const mensaje =
    typeof valor.mensaje === 'string'
      ? valor.mensaje
      : typeof valor.detail === 'string'
        ? valor.detail
        : typeof valor.detalle === 'string'
          ? valor.detalle
          : primerErrorCampo

  return {
    codigo: typeof valor.codigo === 'string' ? valor.codigo : undefined,
    detalle: typeof valor.detalle === 'string' ? valor.detalle : undefined,
    erroresCampos,
    mensaje,
    traceId: typeof valor.traceId === 'string' ? valor.traceId : undefined,
  }
}

async function leerRespuestaApi(respuesta: Response): Promise<unknown> {
  if (respuesta.status === 204) return undefined

  const contenido = await respuesta.text()
  if (!contenido) return undefined

  const tipoContenido = respuesta.headers.get('content-type') ?? ''
  if (!tipoContenido.includes('application/json')) return contenido

  try {
    return JSON.parse(contenido) as unknown
  } catch {
    return contenido
  }
}

export function obtenerTokenApi() {
  try {
    const tokenPestana = window.sessionStorage.getItem(CLAVE_TOKEN)
    if (tokenPestana) return tokenPestana
    if (window.sessionStorage.getItem(CLAVE_BLOQUEO_TOKEN_PERSISTENTE)) return null
    return window.localStorage.getItem(CLAVE_TOKEN)
  } catch {
    return null
  }
}

export function esTokenPersistenteApi() {
  try {
    return (
      !window.sessionStorage.getItem(CLAVE_TOKEN) &&
      !window.sessionStorage.getItem(CLAVE_BLOQUEO_TOKEN_PERSISTENTE) &&
      Boolean(window.localStorage.getItem(CLAVE_TOKEN))
    )
  } catch {
    return false
  }
}

export function guardarTokenApi(token: string, persistir = false) {
  if (persistir) {
    window.sessionStorage.removeItem(CLAVE_TOKEN)
    window.sessionStorage.removeItem(CLAVE_BLOQUEO_TOKEN_PERSISTENTE)
    window.localStorage.setItem(CLAVE_TOKEN, token)
    return
  }

  window.sessionStorage.setItem(CLAVE_TOKEN, token)
  window.sessionStorage.setItem(CLAVE_BLOQUEO_TOKEN_PERSISTENTE, '1')
}

export function eliminarTokenApi() {
  try {
    const esSesionDePestana = Boolean(
      window.sessionStorage.getItem(CLAVE_TOKEN) ||
      window.sessionStorage.getItem(CLAVE_BLOQUEO_TOKEN_PERSISTENTE),
    )
    if (esSesionDePestana) {
      window.sessionStorage.removeItem(CLAVE_TOKEN)
      return false
    }

    window.localStorage.removeItem(CLAVE_TOKEN)
    return true
  } catch {
    // El navegador puede bloquear el almacenamiento; la sesión en memoria se limpia igualmente.
    return false
  }
}

export function obtenerMensajeErrorApi(error: unknown) {
  if (error instanceof ErrorApi) return error.message
  if (error instanceof Error) return error.message
  return 'Ocurrió un error inesperado. Inténtalo nuevamente.'
}

export async function solicitarApi<T>(
  ruta: string,
  {
    autenticado = true,
    cuerpo,
    consulta,
    headers: headersIniciales,
    ...opciones
  }: OpcionesSolicitudApi = {},
): Promise<T> {
  const headers = new Headers(headersIniciales)
  const token = autenticado ? obtenerTokenApi() : null

  headers.set('Accept', 'application/json')
  if (token) headers.set('Authorization', `${obtenerEsquemaTokenApi()} ${token}`)

  const esFormData = cuerpo instanceof FormData
  if (cuerpo !== undefined && !esFormData) headers.set('Content-Type', 'application/json')

  try {
    const respuesta = await fetch(construirUrlApi(ruta, consulta), {
      ...opciones,
      body:
        cuerpo === undefined
          ? undefined
          : esFormData
            ? cuerpo
            : JSON.stringify(cuerpo),
      credentials: 'omit',
      headers,
    })
    const datos = await leerRespuestaApi(respuesta)

    if (!respuesta.ok) {
      const problema = normalizarProblemaApi(datos)
      const mensaje =
        problema.mensaje ||
        problema.detalle ||
        (respuesta.status === 401
          ? 'La sesión no es válida o ha expirado.'
          : 'No fue posible completar la solicitud.')

      if (respuesta.status === 401 && autenticado) {
        const persistente = eliminarTokenApi()
        window.dispatchEvent(
          new CustomEvent(EVENTO_SESION_INVALIDA_API, { detail: { persistente } }),
        )
      }
      throw new ErrorApi(mensaje, respuesta.status, problema)
    }

    return datos as T
  } catch (error) {
    if (error instanceof ErrorApi || (error instanceof DOMException && error.name === 'AbortError')) {
      throw error
    }

    throw new ErrorApi(
      'No se pudo conectar con el servidor. Verifica que el backend esté disponible.',
      0,
      { codigo: 'ERROR_RED' },
    )
  }
}

export async function solicitarArchivoApi(
  ruta: string,
  {
    autenticado = true,
    consulta,
    headers: headersIniciales,
    ...opciones
  }: Omit<OpcionesSolicitudApi, 'cuerpo'> = {},
): Promise<Blob> {
  const headers = new Headers(headersIniciales)
  const token = autenticado ? obtenerTokenApi() : null

  headers.set('Accept', 'application/octet-stream, application/pdf, image/*')
  if (token) headers.set('Authorization', `${obtenerEsquemaTokenApi()} ${token}`)

  try {
    const respuesta = await fetch(construirUrlApi(ruta, consulta), {
      ...opciones,
      credentials: 'omit',
      headers,
    })

    if (!respuesta.ok) {
      const datos = await leerRespuestaApi(respuesta)
      const problema = normalizarProblemaApi(datos)
      const mensaje =
        problema.mensaje ||
        problema.detalle ||
        (respuesta.status === 401
          ? 'La sesi\u00f3n no es v\u00e1lida o ha expirado.'
          : 'No fue posible obtener el archivo solicitado.')

      if (respuesta.status === 401 && autenticado) {
        const persistente = eliminarTokenApi()
        window.dispatchEvent(
          new CustomEvent(EVENTO_SESION_INVALIDA_API, { detail: { persistente } }),
        )
      }
      throw new ErrorApi(mensaje, respuesta.status, problema)
    }

    return respuesta.blob()
  } catch (error) {
    if (error instanceof ErrorApi || (error instanceof DOMException && error.name === 'AbortError')) {
      throw error
    }

    throw new ErrorApi(
      'No se pudo conectar con el servidor. Verifica que el backend est\u00e9 disponible.',
      0,
      { codigo: 'ERROR_RED' },
    )
  }
}
