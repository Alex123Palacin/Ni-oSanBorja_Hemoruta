import { useEffect, useId, useMemo, useRef, useState } from 'react'

import type {
  IntervencionConsultaVozApi,
  SesionConsultaVozApi,
} from '../api/medico/ConsultaVozApi'
import IconoMedico from './IconoMedico'

type EstadoEntrevista =
  | 'completada'
  | 'detenida'
  | 'escuchando'
  | 'inactiva'
  | 'preguntando'
  | 'procesando'

export interface ContenidoGrabacionVoz {
  detener: string
  estadoCompletada: string
  estadoDetenida: string
  estadoEscuchando: string
  estadoInactiva: string
  estadoPreguntando: string
  estadoProcesando: string
  iniciar: string
  subtitulo: string
  titulo: string
}

interface ResultadoReconocimientoVoz {
  isFinal: boolean
  readonly length: number
  [indice: number]: { transcript: string }
}

interface EventoReconocimientoVoz {
  resultIndex: number
  results: {
    readonly length: number
    [indice: number]: ResultadoReconocimientoVoz
  }
}

interface ReconocedorVoz {
  continuous: boolean
  interimResults: boolean
  lang: string
  onend: (() => void) | null
  onerror: (() => void) | null
  onresult: ((evento: EventoReconocimientoVoz) => void) | null
  abort: () => void
  start: () => void
  stop: () => void
}

type ConstructorReconocedorVoz = new () => ReconocedorVoz

interface GrabacionVozCompProps {
  contenido: ContenidoGrabacionVoz
  deshabilitado?: boolean
  intervenciones?: readonly IntervencionConsultaVozApi[]
  onEnviarRespuesta: (respuesta: {
    audio: Blob | null
    texto: string
  }) => Promise<SesionConsultaVozApi>
  onError?: (mensaje: string) => void
  preguntaActual?: string
  procesando?: boolean
}

const ALTURAS_ONDA = [14, 24, 34, 20, 42, 26, 18, 38, 50, 27, 17, 33, 45, 22, 15, 29, 40, 19, 31, 15, 23, 36]
const PAUSA_PARA_ENVIAR_MS = 1_650
const DURACION_MAXIMA_TURNO_MS = 90_000
const UMBRAL_VOZ = 0.028

function formatearDuracion(segundosTotales: number) {
  const horas = Math.floor(segundosTotales / 3600)
  const minutos = Math.floor((segundosTotales % 3600) / 60)
  const segundos = segundosTotales % 60
  return [horas, minutos, segundos].map((valor) => String(valor).padStart(2, '0')).join(':')
}

function obtenerConstructorReconocimiento() {
  const navegador = window as typeof window & {
    SpeechRecognition?: ConstructorReconocedorVoz
    webkitSpeechRecognition?: ConstructorReconocedorVoz
  }
  return navegador.SpeechRecognition ?? navegador.webkitSpeechRecognition
}

function obtenerConstructorContextoAudio() {
  const navegador = window as typeof window & {
    webkitAudioContext?: typeof AudioContext
  }
  return window.AudioContext ?? navegador.webkitAudioContext
}

function obtenerTipoAudioCompatible() {
  const candidatos = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus', 'audio/mp4']
  return candidatos.find((tipo) => MediaRecorder.isTypeSupported(tipo)) ?? ''
}

function seleccionarVozEspanol() {
  const voces = window.speechSynthesis?.getVoices() ?? []
  return (
    voces.find((voz) => voz.lang.toLowerCase() === 'es-pe') ??
    voces.find((voz) => voz.lang.toLowerCase().startsWith('es')) ??
    null
  )
}

function GrabacionVozComp({
  contenido,
  deshabilitado = false,
  intervenciones = [],
  onEnviarRespuesta,
  onError,
  preguntaActual = '',
  procesando = false,
}: GrabacionVozCompProps) {
  const [estado, setEstado] = useState<EstadoEntrevista>('inactiva')
  const [duracionSegundos, setDuracionSegundos] = useState(0)
  const [textoReconocido, setTextoReconocido] = useState('')
  const [nivelVoz, setNivelVoz] = useState(0)
  const estadoRef = useRef<EstadoEntrevista>('inactiva')
  const entrevistaActivaRef = useRef(false)
  const cicloEntrevistaRef = useRef(0)
  const preparandoAudioRef = useRef(false)
  const enviandoRef = useRef(false)
  const enviarAlDetenerRef = useRef(false)
  const flujoAudioRef = useRef<MediaStream | null>(null)
  const grabadorRef = useRef<MediaRecorder | null>(null)
  const reconocedorRef = useRef<ReconocedorVoz | null>(null)
  const contextoAudioRef = useRef<AudioContext | null>(null)
  const analizadorRef = useRef<AnalyserNode | null>(null)
  const fragmentosRef = useRef<Blob[]>([])
  const textoConfirmadoRef = useRef('')
  const textoActualRef = useRef('')
  const vozDetectadaRef = useRef(false)
  const silencioTemporizadorRef = useRef<number | null>(null)
  const turnoTemporizadorRef = useRef<number | null>(null)
  const animacionAudioRef = useRef<number | null>(null)
  const inicioEntrevistaRef = useRef(0)
  const enviarRespuestaRef = useRef(onEnviarRespuesta)
  const errorRef = useRef(onError)
  const tituloId = useId()

  useEffect(() => {
    enviarRespuestaRef.current = onEnviarRespuesta
    errorRef.current = onError
  }, [onEnviarRespuesta, onError])

  function cambiarEstado(siguiente: EstadoEntrevista) {
    estadoRef.current = siguiente
    setEstado(siguiente)
  }

  function limpiarTemporizadoresTurno() {
    if (silencioTemporizadorRef.current !== null) {
      window.clearTimeout(silencioTemporizadorRef.current)
      silencioTemporizadorRef.current = null
    }
    if (turnoTemporizadorRef.current !== null) {
      window.clearTimeout(turnoTemporizadorRef.current)
      turnoTemporizadorRef.current = null
    }
    if (animacionAudioRef.current !== null) {
      window.cancelAnimationFrame(animacionAudioRef.current)
      animacionAudioRef.current = null
    }
  }

  function detenerReconocimiento() {
    const reconocedor = reconocedorRef.current
    reconocedorRef.current = null
    if (!reconocedor) return
    reconocedor.onend = null
    reconocedor.onresult = null
    reconocedor.onerror = null
    try {
      reconocedor.stop()
    } catch {
      reconocedor.abort()
    }
  }

  function liberarRecursos({ cancelarLocucion = true } = {}) {
    limpiarTemporizadoresTurno()
    detenerReconocimiento()
    const grabador = grabadorRef.current
    if (grabador && grabador.state !== 'inactive') {
      enviarAlDetenerRef.current = false
      try {
        grabador.stop()
      } catch {
        // El navegador puede haber detenido ya el grabador.
      }
    }
    grabadorRef.current = null
    flujoAudioRef.current?.getTracks().forEach((pista) => pista.stop())
    flujoAudioRef.current = null
    void contextoAudioRef.current?.close().catch(() => undefined)
    contextoAudioRef.current = null
    analizadorRef.current = null
    fragmentosRef.current = []
    setNivelVoz(0)
    if (cancelarLocucion) window.speechSynthesis?.cancel()
  }

  useEffect(() => {
    if (!entrevistaActivaRef.current) return
    const intervalo = window.setInterval(() => {
      setDuracionSegundos(Math.floor((Date.now() - inicioEntrevistaRef.current) / 1000))
    }, 250)
    return () => window.clearInterval(intervalo)
  }, [estado])

  useEffect(() => () => {
    entrevistaActivaRef.current = false
    cicloEntrevistaRef.current += 1
    liberarRecursos()
  }, [])

  function programarEnvioPorSilencio() {
    if (!vozDetectadaRef.current || estadoRef.current !== 'escuchando') return
    if (silencioTemporizadorRef.current !== null) {
      window.clearTimeout(silencioTemporizadorRef.current)
    }
    silencioTemporizadorRef.current = window.setTimeout(() => {
      finalizarTurnoAutomaticamente()
    }, PAUSA_PARA_ENVIAR_MS)
  }

  function vigilarNivelAudio() {
    const analizador = analizadorRef.current
    if (!analizador || estadoRef.current !== 'escuchando') return
    const muestras = new Float32Array(analizador.fftSize)
    analizador.getFloatTimeDomainData(muestras)
    const energia = Math.sqrt(
      muestras.reduce((acumulado, valor) => acumulado + valor * valor, 0) / muestras.length,
    )
    setNivelVoz(Math.min(1, energia * 14))
    if (energia >= UMBRAL_VOZ) {
      vozDetectadaRef.current = true
      programarEnvioPorSilencio()
    }
    animacionAudioRef.current = window.requestAnimationFrame(vigilarNivelAudio)
  }

  function iniciarReconocimiento() {
    const ConstructorReconocimiento = obtenerConstructorReconocimiento()
    if (!ConstructorReconocimiento) return
    const reconocedor = new ConstructorReconocimiento()
    reconocedor.lang = 'es-PE'
    reconocedor.continuous = true
    reconocedor.interimResults = true
    reconocedor.onresult = (evento) => {
      let textoIntermedio = ''
      for (let indice = evento.resultIndex; indice < evento.results.length; indice += 1) {
        const resultado = evento.results[indice]
        const fragmento = resultado?.[0]?.transcript?.trim()
        if (!fragmento) continue
        if (resultado.isFinal) textoConfirmadoRef.current += `${fragmento} `
        else textoIntermedio += `${fragmento} `
      }
      const textoActual = `${textoConfirmadoRef.current}${textoIntermedio}`.trim()
      if (!textoActual) return
      textoActualRef.current = textoActual
      vozDetectadaRef.current = true
      setTextoReconocido(textoActual)
      programarEnvioPorSilencio()
    }
    reconocedor.onerror = () => undefined
    reconocedor.onend = () => {
      if (!entrevistaActivaRef.current || estadoRef.current !== 'escuchando') return
      window.setTimeout(() => {
        if (!entrevistaActivaRef.current || estadoRef.current !== 'escuchando') return
        try {
          reconocedor.start()
        } catch {
          // Algunos navegadores reinician el reconocimiento automáticamente.
        }
      }, 120)
    }
    reconocedorRef.current = reconocedor
    try {
      reconocedor.start()
    } catch {
      // El audio continúa y el servidor puede encargarse de la transcripción.
    }
  }

  function iniciarTurno() {
    const flujo = flujoAudioRef.current
    if (!flujo || !entrevistaActivaRef.current) return
    const tipo = obtenerTipoAudioCompatible()
    const grabador = new MediaRecorder(flujo, tipo ? { mimeType: tipo } : undefined)
    grabadorRef.current = grabador
    fragmentosRef.current = []
    textoConfirmadoRef.current = ''
    textoActualRef.current = ''
    vozDetectadaRef.current = false
    enviandoRef.current = false
    enviarAlDetenerRef.current = false
    setTextoReconocido('')
    setNivelVoz(0)

    grabador.ondataavailable = (evento) => {
      if (evento.data.size > 0) fragmentosRef.current.push(evento.data)
    }
    grabador.onstop = () => {
      if (!enviarAlDetenerRef.current) return
      enviarAlDetenerRef.current = false
      const audio = new Blob(fragmentosRef.current, { type: grabador.mimeType || 'audio/webm' })
      fragmentosRef.current = []
      void procesarRespuesta(audio.size > 0 ? audio : null, textoActualRef.current.trim())
    }

    cambiarEstado('escuchando')
    iniciarReconocimiento()
    grabador.start(250)
    vigilarNivelAudio()
    turnoTemporizadorRef.current = window.setTimeout(() => {
      if (vozDetectadaRef.current) finalizarTurnoAutomaticamente()
    }, DURACION_MAXIMA_TURNO_MS)
  }

  function finalizarTurnoAutomaticamente() {
    const grabador = grabadorRef.current
    if (
      enviandoRef.current ||
      estadoRef.current !== 'escuchando' ||
      !grabador ||
      grabador.state === 'inactive'
    ) return
    enviandoRef.current = true
    enviarAlDetenerRef.current = true
    cambiarEstado('procesando')
    limpiarTemporizadoresTurno()
    detenerReconocimiento()
    try {
      grabador.requestData()
    } catch {
      // requestData no está disponible en todas las implementaciones.
    }
    grabador.stop()
  }

  function hablarPregunta(texto: string) {
    const pregunta = texto.trim()
    if (!pregunta || !('speechSynthesis' in window)) return Promise.resolve()
    cambiarEstado('preguntando')
    window.speechSynthesis.cancel()
    return new Promise<void>((resolver) => {
      const locucion = new SpeechSynthesisUtterance(pregunta)
      let finalizada = false
      const completar = () => {
        if (finalizada) return
        finalizada = true
        window.clearTimeout(respaldo)
        resolver()
      }
      const respaldo = window.setTimeout(completar, Math.max(5_000, pregunta.length * 95))
      locucion.lang = 'es-PE'
      locucion.rate = 0.94
      locucion.pitch = 1
      locucion.voice = seleccionarVozEspanol()
      locucion.onend = completar
      locucion.onerror = completar
      window.speechSynthesis.speak(locucion)
    })
  }

  async function procesarRespuesta(audio: Blob | null, texto: string) {
    const cicloActual = cicloEntrevistaRef.current
    try {
      const actualizada = await enviarRespuestaRef.current({ audio, texto })
      if (!entrevistaActivaRef.current || cicloActual !== cicloEntrevistaRef.current) return
      const entrevistaLista = actualizada.estado === 'LISTO' || actualizada.estado === 'PUBLICADO'
      if (!actualizada.iaDisponible) {
        entrevistaActivaRef.current = false
        liberarRecursos()
        cambiarEstado('detenida')
        return
      }
      await hablarPregunta(actualizada.preguntaActual)
      if (!entrevistaActivaRef.current || cicloActual !== cicloEntrevistaRef.current) return
      if (entrevistaLista) {
        entrevistaActivaRef.current = false
        liberarRecursos({ cancelarLocucion: false })
        cambiarEstado('completada')
        return
      }
      iniciarTurno()
    } catch {
      entrevistaActivaRef.current = false
      liberarRecursos()
      cambiarEstado('detenida')
    } finally {
      enviandoRef.current = false
    }
  }

  async function prepararAudio() {
    const flujo = await navigator.mediaDevices.getUserMedia({
      audio: { autoGainControl: true, echoCancellation: true, noiseSuppression: true },
    })
    flujoAudioRef.current = flujo
    const ConstructorContexto = obtenerConstructorContextoAudio()
    if (!ConstructorContexto) return
    try {
      const contexto = new ConstructorContexto()
      const analizador = contexto.createAnalyser()
      analizador.fftSize = 1024
      analizador.smoothingTimeConstant = 0.72
      contexto.createMediaStreamSource(flujo).connect(analizador)
      await contexto.resume()
      contextoAudioRef.current = contexto
      analizadorRef.current = analizador
    } catch {
      contextoAudioRef.current = null
      analizadorRef.current = null
    }
  }

  async function iniciarEntrevista() {
    if (deshabilitado || procesando || entrevistaActivaRef.current || preparandoAudioRef.current) return
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      errorRef.current?.('Este navegador no permite usar el micrófono para la entrevista.')
      return
    }
    try {
      cicloEntrevistaRef.current += 1
      const cicloActual = cicloEntrevistaRef.current
      preparandoAudioRef.current = true
      entrevistaActivaRef.current = true
      cambiarEstado('preguntando')
      await prepararAudio()
      preparandoAudioRef.current = false
      if (!entrevistaActivaRef.current || cicloActual !== cicloEntrevistaRef.current) {
        liberarRecursos()
        return
      }
      inicioEntrevistaRef.current = Date.now()
      setDuracionSegundos(0)
      await hablarPregunta(preguntaActual)
      if (entrevistaActivaRef.current && cicloActual === cicloEntrevistaRef.current) iniciarTurno()
    } catch {
      preparandoAudioRef.current = false
      entrevistaActivaRef.current = false
      liberarRecursos()
      cambiarEstado('detenida')
      errorRef.current?.('No se pudo acceder al micrófono. Revisa el permiso del navegador e inténtalo otra vez.')
    }
  }

  function detenerEntrevista() {
    entrevistaActivaRef.current = false
    cicloEntrevistaRef.current += 1
    liberarRecursos()
    cambiarEstado('detenida')
  }

  const etiquetaEstado = useMemo(() => {
    if (procesando || estado === 'procesando') return contenido.estadoProcesando
    if (estado === 'completada') return contenido.estadoCompletada
    if (estado === 'detenida') return contenido.estadoDetenida
    if (estado === 'escuchando') return contenido.estadoEscuchando
    if (estado === 'preguntando') return contenido.estadoPreguntando
    return contenido.estadoInactiva
  }, [contenido, estado, procesando])

  const entrevistaActiva = ['escuchando', 'preguntando', 'procesando'].includes(estado)
  const ultimasIntervenciones = intervenciones.slice(-5)

  return (
    <section
      aria-labelledby={tituloId}
      className='flex min-h-[430px] flex-col rounded-xl border border-[#dce5ee] bg-white p-3 shadow-[0_2px_8px_rgba(18,52,91,0.04)]'
    >
      <header>
        <h2 className='text-[12px] font-extrabold text-[#0a2b70]' id={tituloId}>{contenido.titulo}</h2>
        <p className='mt-0.5 text-[8px] font-medium text-[#52698e]'>{contenido.subtitulo}</p>
      </header>

      <div className='flex flex-col items-center py-2'>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[9px] font-extrabold ${
            estado === 'escuchando'
              ? 'bg-[#e1f8e8] text-[#1a9d4b]'
              : estado === 'procesando'
                ? 'bg-[#fff3d9] text-[#b87005]'
                : 'bg-[#e7f2ff] text-[#277bd9]'
          }`}
          role='status'
        >
          <span className={`h-1.5 w-1.5 rounded-full bg-current ${estado === 'escuchando' ? 'motion-safe:animate-pulse' : ''}`} />
          {etiquetaEstado}
        </span>

        <button
          aria-label={entrevistaActiva ? contenido.detener : contenido.iniciar}
          className='relative mt-2 grid h-[108px] w-[108px] cursor-pointer place-items-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#08aabb] disabled:cursor-not-allowed disabled:opacity-55'
          disabled={deshabilitado || estado === 'completada'}
          onClick={entrevistaActiva ? detenerEntrevista : () => void iniciarEntrevista()}
          type='button'
        >
          <span
            className={`absolute inset-0 rounded-full bg-[#eaf8fa] ${estado === 'escuchando' ? 'motion-safe:animate-pulse' : ''}`}
            style={estado === 'escuchando' ? { transform: `scale(${1 + nivelVoz * 0.08})` } : undefined}
          />
          <span className='absolute inset-[13px] rounded-full border-[8px] border-[#d6f2f4] bg-[#c9eef1]' />
          <span className='relative grid h-[66px] w-[66px] place-items-center rounded-full bg-gradient-to-b from-[#12b7c3] to-[#008ea6] text-white shadow-[0_8px_20px_rgba(0,151,166,0.30)]'>
            <IconoMedico className='h-9 w-9' nombre={entrevistaActiva ? 'stop' : 'microphone'} strokeWidth={1.9} />
          </span>
        </button>
        <p className='mt-1 text-[9px] font-extrabold text-[#078fa4]'>
          {entrevistaActiva ? contenido.detener : estado === 'completada' ? 'Entrevista completada' : contenido.iniciar}
        </p>

        <time className='mt-1 text-[23px] font-extrabold tracking-[0.03em] text-[#0b2d78]' dateTime={`PT${duracionSegundos}S`} role='timer'>
          {formatearDuracion(duracionSegundos)}
        </time>

        <div aria-hidden='true' className='mt-1 flex h-6 items-center justify-center gap-[3px] text-[#12aebd]'>
          {ALTURAS_ONDA.map((altura, indice) => (
            <span
              className={`w-[2px] rounded-full bg-current ${estado === 'escuchando' ? 'motion-safe:animate-pulse' : 'opacity-45'}`}
              key={`${altura}-${indice}`}
              style={{
                height: `${Math.max(7, Math.round(altura * 0.48 * (1 + nivelVoz * 0.45)))}px`,
                animationDelay: `${indice * 45}ms`,
              }}
            />
          ))}
        </div>

        <p className='mt-1 max-w-[260px] text-center text-[8px] leading-3 text-[#617494]'>
          Habla con naturalidad. La respuesta se enviará al detectar una pausa y la siguiente pregunta comenzará sola.
        </p>
      </div>

      <div className='mt-auto rounded-lg border border-[#dceaf2] bg-[#f8fcff] p-2'>
        <p className='text-[8px] font-extrabold uppercase tracking-[0.04em] text-[#1a4b82]'>Conversación</p>
        <div aria-live='polite' className='mt-1 max-h-[76px] space-y-1 overflow-y-auto pr-1'>
          {ultimasIntervenciones.length === 0 ? (
            <p className='text-[8px] text-[#617494]'>La entrevista aparecerá aquí.</p>
          ) : ultimasIntervenciones.map((intervencion, indice) => (
            <p className='text-[8px] leading-[11px] text-[#38557f]' key={`${intervencion.fecha}-${indice}`}>
              <strong className={intervencion.rol === 'IA' ? 'text-[#0798ad]' : 'text-[#173879]'}>
                {intervencion.rol === 'IA' ? 'Asistente: ' : 'Médico: '}
              </strong>
              {intervencion.texto}
            </p>
          ))}
        </div>
        <div className='mt-1.5 min-h-10 rounded-md border border-[#d8e4ee] bg-white px-2 py-1.5'>
          <p className='text-[7px] font-extrabold uppercase tracking-[0.04em] text-[#6a7e9c]'>Transcripción actual</p>
          <p className='mt-0.5 line-clamp-2 text-[8px] leading-[11px] text-[#254574]'>
            {textoReconocido || (estado === 'escuchando' ? 'Escuchando tu respuesta…' : 'Se mostrará mientras hablas.')}
          </p>
        </div>
      </div>
    </section>
  )
}

export default GrabacionVozComp
