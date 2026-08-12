import { useEffect, useId, useRef, useState, type FormEvent } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { consultarAsistentePacienteApi } from '../../api/paciente/AsistentePacienteApi'
import { obtenerMensajeErrorApi } from '../../api/compartido/ClienteApi'
import IconoMedico from '../IconoMedico'

type AutorMensaje = 'asistente' | 'paciente'

interface MensajeAsistente {
  autor: AutorMensaje
  etiquetaRuta?: string | null
  id: number
  rutaSugerida?: string | null
  texto: string
}

interface AlternativaReconocimientoVoz {
  transcript: string
}

interface ResultadoReconocimientoVoz {
  0: AlternativaReconocimientoVoz
  isFinal: boolean
  length: number
}

interface EventoReconocimientoVoz {
  resultIndex: number
  results: ArrayLike<ResultadoReconocimientoVoz>
}

interface ErrorReconocimientoVoz {
  error: string
}

interface ReconocedorVoz {
  continuous: boolean
  interimResults: boolean
  lang: string
  onend: (() => void) | null
  onerror: ((evento: ErrorReconocimientoVoz) => void) | null
  onresult: ((evento: EventoReconocimientoVoz) => void) | null
  abort: () => void
  start: () => void
  stop: () => void
}

type ConstructorReconocedorVoz = new () => ReconocedorVoz

const MENSAJE_INICIAL: MensajeAsistente = {
  autor: 'asistente',
  id: 1,
  texto: 'Hola, soy el asistente de HemoRuta. Puedo ayudarte con tu medicación, próxima cita, síntomas, tratamiento o documentos.',
}

function obtenerConstructorReconocedor() {
  const navegador = window as typeof window & {
    SpeechRecognition?: ConstructorReconocedorVoz
    webkitSpeechRecognition?: ConstructorReconocedorVoz
  }
  return navegador.SpeechRecognition ?? navegador.webkitSpeechRecognition
}

function reproducirRespuesta(texto: string) {
  if (!('speechSynthesis' in window)) return
  window.speechSynthesis.cancel()
  const locucion = new SpeechSynthesisUtterance(texto)
  locucion.lang = 'es-PE'
  locucion.rate = 0.96
  const voces = window.speechSynthesis.getVoices()
  locucion.voice =
    voces.find((voz) => voz.lang.toLowerCase() === 'es-pe') ??
    voces.find((voz) => voz.lang.toLowerCase().startsWith('es')) ??
    null
  window.speechSynthesis.speak(locucion)
}

function AsistentePacienteComp() {
  const panelId = useId()
  const navigate = useNavigate()
  const location = useLocation()
  const botonActivadorRef = useRef<HTMLButtonElement>(null)
  const entradaRef = useRef<HTMLTextAreaElement>(null)
  const reconocedorRef = useRef<ReconocedorVoz | null>(null)
  const procesandoRef = useRef(false)
  const siguienteId = useRef(2)
  const listaMensajesRef = useRef<HTMLDivElement>(null)
  const [abierto, setAbierto] = useState(false)
  const [entrada, setEntrada] = useState('')
  const [mensajes, setMensajes] = useState<MensajeAsistente[]>([MENSAJE_INICIAL])
  const [escuchando, setEscuchando] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!abierto) return
    const enfoque = window.requestAnimationFrame(() => entradaRef.current?.focus())

    function cerrarConEscape(evento: KeyboardEvent) {
      if (evento.key !== 'Escape') return
      reconocedorRef.current?.abort()
      window.speechSynthesis?.cancel()
      setAbierto(false)
      setEscuchando(false)
      window.requestAnimationFrame(() => botonActivadorRef.current?.focus())
    }

    document.addEventListener('keydown', cerrarConEscape)
    return () => {
      window.cancelAnimationFrame(enfoque)
      document.removeEventListener('keydown', cerrarConEscape)
    }
  }, [abierto])

  useEffect(() => {
    if (!abierto) return
    listaMensajesRef.current?.scrollTo({ behavior: 'smooth', top: listaMensajesRef.current.scrollHeight })
  }, [abierto, escuchando, enviando, mensajes])

  useEffect(
    () => () => {
      reconocedorRef.current?.abort()
      window.speechSynthesis?.cancel()
    },
    [],
  )

  async function procesarConsulta(textoEntrada: string) {
    const texto = textoEntrada.trim()
    if (!texto || procesandoRef.current) return

    procesandoRef.current = true
    setError('')
    setEntrada('')
    setEnviando(true)
    setMensajes((actuales) => [
      ...actuales,
      { autor: 'paciente', id: siguienteId.current++, texto },
    ])
    try {
      const resultado = await consultarAsistentePacienteApi({
        mensaje: texto,
        rutaActual: location.pathname,
      })
      setMensajes((actuales) => [
        ...actuales,
        {
          autor: 'asistente',
          etiquetaRuta: resultado.etiquetaRuta,
          id: siguienteId.current++,
          rutaSugerida: resultado.rutaSugerida,
          texto: resultado.respuesta,
        },
      ])
      reproducirRespuesta(resultado.respuesta)
    } catch (problema) {
      setError(obtenerMensajeErrorApi(problema))
    } finally {
      procesandoRef.current = false
      setEnviando(false)
    }
  }

  function enviarMensaje(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    void procesarConsulta(entrada)
  }

  function alternarVoz() {
    if (escuchando) {
      reconocedorRef.current?.stop()
      return
    }
    const Constructor = obtenerConstructorReconocedor()
    if (!Constructor) {
      setError('Tu navegador no admite el reconocimiento de voz. Puedes escribir tu consulta.')
      return
    }

    window.speechSynthesis?.cancel()
    setError('')
    const reconocedor = new Constructor()
    reconocedor.lang = 'es-PE'
    reconocedor.continuous = false
    reconocedor.interimResults = true
    reconocedor.onresult = (evento) => {
      let textoParcial = ''
      let textoFinal = ''
      for (let indice = evento.resultIndex; indice < evento.results.length; indice += 1) {
        const resultado = evento.results[indice]
        const transcripcion = resultado[0]?.transcript ?? ''
        if (resultado.isFinal) textoFinal += transcripcion
        else textoParcial += transcripcion
      }
      setEntrada(textoFinal || textoParcial)
      if (textoFinal.trim()) {
        reconocedor.stop()
        void procesarConsulta(textoFinal)
      }
    }
    reconocedor.onerror = (evento) => {
      if (evento.error !== 'aborted' && evento.error !== 'no-speech') {
        setError('No pude escuchar con claridad. Inténtalo otra vez o escribe tu consulta.')
      }
      setEscuchando(false)
    }
    reconocedor.onend = () => setEscuchando(false)
    reconocedorRef.current = reconocedor
    setEscuchando(true)
    reconocedor.start()
  }

  function alternarPanel() {
    setAbierto((actual) => {
      if (actual) {
        reconocedorRef.current?.abort()
        window.speechSynthesis?.cancel()
        setEscuchando(false)
        window.requestAnimationFrame(() => botonActivadorRef.current?.focus())
      }
      return !actual
    })
  }

  function irASeccion(ruta: string) {
    reconocedorRef.current?.abort()
    window.speechSynthesis?.cancel()
    setAbierto(false)
    navigate(ruta)
  }

  return (
    <aside
      aria-label='Asistente virtual del paciente'
      className='fixed bottom-[calc(66px+env(safe-area-inset-bottom))] right-3 z-[90] sm:right-[calc((100vw-clamp(400px,30vw,500px))/2+12px)]'
    >
      {abierto && (
        <section
          aria-labelledby={`${panelId}-titulo`}
          className='absolute bottom-[62px] right-0 flex h-[min(430px,calc(100dvh-155px))] w-[min(370px,calc(100vw-24px))] flex-col overflow-hidden rounded-[22px] border border-[#cfe4ea] bg-white shadow-[0_18px_50px_rgba(8,39,103,0.22)]'
          id={panelId}
          role='dialog'
        >
          <header className='flex shrink-0 items-center gap-2.5 bg-gradient-to-r from-[#009ca8] to-[#04b7b1] px-3.5 py-3 text-white'>
            <span className='grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/20 ring-1 ring-white/30'>
              <IconoMedico className='h-5 w-5' nombre='sparkles' strokeWidth={2} />
            </span>
            <span className='min-w-0 flex-1'>
              <strong className='block text-[12px] leading-tight' id={`${panelId}-titulo`}>
                Asistente HemoRuta
              </strong>
              <span className='block text-[8px] font-semibold text-white/85'>Tu guía para usar la aplicación</span>
            </span>
            <button
              aria-label='Cerrar asistente'
              className='grid h-9 w-9 cursor-pointer place-items-center rounded-full text-white transition hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-white'
              onClick={alternarPanel}
              type='button'
            >
              <IconoMedico className='h-5 w-5' nombre='x' strokeWidth={2.2} />
            </button>
          </header>

          <div className='min-h-0 flex-1 bg-[#f7fbfd] px-3 py-2.5'>
            <div
              aria-live='polite'
              className='h-full space-y-2 overflow-y-auto overscroll-contain pr-0.5 [scrollbar-width:thin]'
              ref={listaMensajesRef}
            >
              {mensajes.map((mensaje) => (
                <div
                  className={`max-w-[88%] rounded-2xl px-3 py-2 text-[9px] font-medium leading-[1.45] shadow-sm ${
                    mensaje.autor === 'paciente'
                      ? 'ml-auto rounded-br-md bg-[#00a9ae] text-white'
                      : 'mr-auto rounded-bl-md border border-[#e0ebf0] bg-white text-[#33496e]'
                  }`}
                  key={mensaje.id}
                >
                  <p>{mensaje.texto}</p>
                  {mensaje.rutaSugerida && (
                    <button
                      className='mt-2 flex w-full cursor-pointer items-center justify-between rounded-xl bg-[#eaf8fa] px-2.5 py-2 text-left text-[8.5px] font-extrabold text-[#008f9d] transition hover:bg-[#d9f3f5] focus-visible:outline-2 focus-visible:outline-[#00aeb2]'
                      onClick={() => irASeccion(mensaje.rutaSugerida!)}
                      type='button'
                    >
                      <span>{mensaje.etiquetaRuta || 'Abrir sección'}</span>
                      <IconoMedico className='h-3.5 w-3.5' nombre='arrowRight' strokeWidth={2.2} />
                    </button>
                  )}
                </div>
              ))}

              {enviando && (
                <div className='mr-auto flex items-center gap-2 rounded-2xl rounded-bl-md border border-[#d8e9ee] bg-white px-3 py-2 text-[8.5px] font-bold text-[#5c708f]' role='status'>
                  <span className='h-2 w-2 animate-pulse rounded-full bg-[#00aeb2]' />
                  Revisando tu información…
                </div>
              )}
              {escuchando && (
                <div className='mr-auto flex max-w-[92%] items-center gap-2 rounded-2xl rounded-bl-md border border-[#bfe7e6] bg-[#ebfbfa] px-3 py-2 text-[#087f89]'>
                  <span className='relative grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#00aeb2] text-white'>
                    <span aria-hidden='true' className='absolute inset-0 animate-ping rounded-full bg-[#00aeb2]/30' />
                    <IconoMedico className='relative h-4 w-4' nombre='microphone' strokeWidth={2} />
                  </span>
                  <span className='text-[9px] font-bold'>Te escucho…</span>
                </div>
              )}
            </div>
          </div>

          <form className='shrink-0 border-t border-[#e1ebf0] bg-white p-2.5' onSubmit={enviarMensaje}>
            {error && <p className='mb-2 rounded-lg bg-[#fff0f0] px-2.5 py-1.5 text-[8px] font-semibold text-[#d94444]' role='alert'>{error}</p>}
            <div className='flex items-end gap-1.5 rounded-2xl border border-[#cbdce5] bg-[#fbfdfe] p-1.5 focus-within:border-[#00aeb2] focus-within:ring-2 focus-within:ring-[#00aeb2]/10'>
              <label className='sr-only' htmlFor={`${panelId}-entrada`}>
                Escribe tu consulta
              </label>
              <textarea
                className='max-h-20 min-h-9 min-w-0 flex-1 resize-none bg-transparent px-2 py-2 text-[9.5px] text-[#173664] outline-none placeholder:text-[#8290a7]'
                disabled={enviando}
                id={`${panelId}-entrada`}
                onChange={(evento) => setEntrada(evento.target.value)}
                placeholder='Escribe o pregúntame por voz…'
                ref={entradaRef}
                rows={1}
                value={entrada}
              />
              <button
                aria-label={escuchando ? 'Detener escucha' : 'Hacer una consulta por voz'}
                aria-pressed={escuchando}
                className={`grid h-9 w-9 shrink-0 cursor-pointer place-items-center rounded-xl transition focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#00aeb2] ${
                  escuchando ? 'bg-[#e7f8f7] text-[#009ba5]' : 'text-[#536b8e] hover:bg-[#edf7f8] hover:text-[#009ba5]'
                }`}
                disabled={enviando}
                onClick={alternarVoz}
                type='button'
              >
                <IconoMedico className='h-[18px] w-[18px]' nombre={escuchando ? 'stop' : 'microphone'} strokeWidth={2} />
              </button>
              <button
                aria-label='Enviar consulta'
                className='grid h-9 w-9 shrink-0 cursor-pointer place-items-center rounded-xl bg-[#00aeb2] text-white shadow-sm transition hover:bg-[#008f9c] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#00aeb2] disabled:cursor-not-allowed disabled:opacity-45'
                disabled={enviando || !entrada.trim()}
                type='submit'
              >
                <IconoMedico className='h-[17px] w-[17px]' nombre='send' strokeWidth={2} />
              </button>
            </div>
            <p className='mt-1.5 text-center text-[7px] font-semibold text-[#7b8aa0]'>
              Consulta tus datos registrados; no reemplaza la orientación del personal de salud.
            </p>
          </form>
        </section>
      )}

      <button
        aria-controls={panelId}
        aria-expanded={abierto}
        aria-label={abierto ? 'Cerrar asistente virtual' : 'Abrir asistente virtual'}
        className={`relative grid h-[52px] w-[52px] cursor-pointer place-items-center rounded-full border-2 border-white text-white shadow-[0_10px_28px_rgba(0,142,156,0.38)] transition hover:-translate-y-0.5 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#00aeb2] ${
          abierto ? 'bg-[#087f8f]' : 'bg-gradient-to-br from-[#08b7b1] to-[#008eaa]'
        }`}
        onClick={alternarPanel}
        ref={botonActivadorRef}
        type='button'
      >
        <IconoMedico className='h-6 w-6' nombre={abierto ? 'x' : 'sparkles'} strokeWidth={2.1} />
        {!abierto && (
          <span className='absolute -right-1 -top-1 rounded-full border-2 border-white bg-[#082767] px-1.5 py-0.5 text-[7px] font-black leading-none'>
            IA
          </span>
        )}
      </button>
    </aside>
  )
}

export default AsistentePacienteComp
