import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import {
  crearSesionConsultaVozApi,
  publicarConsultaVozApi,
  transcribirRespuestaConsultaVozApi,
  type SeccionesConsultaVozApi,
  type SesionConsultaVozApi,
} from '../api/medico/ConsultaVozApi'
import {
  obtenerFichaPacienteMedicoApi,
  type FichaPacienteMedicoApi,
} from '../api/medico/MedicoApi'
import { obtenerMensajeErrorApi } from '../api/compartido/ClienteApi'

const CLAVE_PACIENTE_SELECCIONADO = 'hemoruta.medico.pacienteId'

export const SECCIONES_CONSULTA_VACIAS: SeccionesConsultaVozApi = {
  evolucionClinica: '',
  indicacionesCasa: '',
  medicacionIndicada: [],
  motivoConsulta: '',
  proximoControl: { detalle: '', fecha: '', hora: '' },
  tratamientoIndicado: '',
}

interface RespuestaVoz {
  audio?: Blob | null
  texto?: string
}

function useConsultaVoz() {
  const navigate = useNavigate()
  const inicioSolicitadoRef = useRef(false)
  const paginaActivaRef = useRef(false)
  const [fichaPaciente, setFichaPaciente] = useState<FichaPacienteMedicoApi | null>(null)
  const [sesion, setSesion] = useState<SesionConsultaVozApi | null>(null)
  const [secciones, setSecciones] = useState<SeccionesConsultaVozApi>(SECCIONES_CONSULTA_VACIAS)
  const [cargando, setCargando] = useState(true)
  const [procesandoRespuesta, setProcesandoRespuesta] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [editando, setEditando] = useState(false)
  const [mensajeAccion, setMensajeAccion] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    paginaActivaRef.current = true
    if (inicioSolicitadoRef.current) {
      return () => {
        paginaActivaRef.current = false
        window.speechSynthesis?.cancel()
      }
    }
    inicioSolicitadoRef.current = true

    const pacienteId = window.sessionStorage.getItem(CLAVE_PACIENTE_SELECCIONADO)
    if (!pacienteId) {
      setError('Selecciona un paciente antes de iniciar una consulta por voz.')
      setCargando(false)
      return
    }

    Promise.all([
      obtenerFichaPacienteMedicoApi(pacienteId),
      crearSesionConsultaVozApi(pacienteId),
    ])
      .then(([ficha, sesionCreada]) => {
        if (!paginaActivaRef.current) return
        setFichaPaciente(ficha)
        setSesion(sesionCreada)
        setSecciones(sesionCreada.secciones)
      })
      .catch((problema: unknown) => {
        if (paginaActivaRef.current) setError(obtenerMensajeErrorApi(problema))
      })
      .finally(() => {
        if (paginaActivaRef.current) setCargando(false)
      })

    return () => {
      paginaActivaRef.current = false
      window.speechSynthesis?.cancel()
    }
  }, [])

  async function enviarRespuesta({ audio, texto }: RespuestaVoz) {
    if (!sesion) throw new Error('La sesión de consulta todavía no está disponible.')
    if (procesandoRespuesta) throw new Error('La respuesta anterior todavía se está procesando.')
    if ((!audio || audio.size === 0) && !texto?.trim()) {
      const problema = new Error('No se detectó una respuesta. Vuelve a intentarlo.')
      setError(problema.message)
      throw problema
    }

    setProcesandoRespuesta(true)
    setError('')
    setMensajeAccion('Analizando la respuesta y actualizando el resumen...')
    try {
      const actualizada = await transcribirRespuestaConsultaVozApi(sesion.id, { audio, texto })
      setSesion(actualizada)
      setSecciones(actualizada.secciones)
      setMensajeAccion(
        actualizada.iaDisponible
          ? actualizada.mensajeIa || 'Respuesta incorporada al resumen.'
          : actualizada.mensajeIa || 'Puedes completar el resumen manualmente.',
      )
      return actualizada
    } catch (problema) {
      setError(obtenerMensajeErrorApi(problema))
      throw problema
    } finally {
      setProcesandoRespuesta(false)
    }
  }

  function registrarError(mensaje: string) {
    setError(mensaje)
  }

  function prepararEdicion() {
    setEditando(true)
    setError('')
    setMensajeAccion('Ahora puedes corregir cada campo antes de guardar la consulta.')
  }

  async function prepararGuardado() {
    if (!sesion || guardando) return
    setGuardando(true)
    setError('')
    setMensajeAccion('Guardando la consulta y sus indicaciones...')
    try {
      const publicada = await publicarConsultaVozApi(sesion.id, secciones)
      setSesion(publicada)
      setMensajeAccion('Consulta guardada correctamente.')
      navigate('/doctor/ficha')
    } catch (problema) {
      setError(obtenerMensajeErrorApi(problema))
    } finally {
      setGuardando(false)
    }
  }

  function volverFichaPaciente() {
    window.speechSynthesis?.cancel()
    navigate('/doctor/ficha')
  }

  return {
    cargando,
    editando,
    enviarRespuesta,
    error,
    fichaPaciente,
    guardando,
    mensajeAccion,
    prepararEdicion,
    prepararGuardado,
    procesandoRespuesta,
    registrarError,
    secciones,
    sesion,
    setSecciones,
    volverFichaPaciente,
  }
}

export default useConsultaVoz
