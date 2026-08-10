import { useEffect, useId, useMemo, useRef, useState } from 'react'
import IconoMedico from './IconoMedico'

export type EstadoGrabacionVoz = 'descartada' | 'finalizada' | 'grabando' | 'pausada'

export interface ContenidoGrabacionVoz {
  descartar: string
  estadoDescartada: string
  estadoFinalizada: string
  estadoGrabando: string
  estadoPausada: string
  finalizar: string
  pausar: string
  reanudar: string
  subtitulo: string
  titulo: string
}

interface GrabacionVozCompProps {
  contenido: ContenidoGrabacionVoz
  onCambiarEstado?: (estado: EstadoGrabacionVoz, duracionSegundos: number) => void
  onDescartar?: () => void
  segundosIniciales?: number
}

const ALTURAS_ONDA = [14, 24, 34, 20, 42, 26, 18, 38, 50, 27, 17, 33, 45, 22, 15, 29, 40, 19, 31, 15, 23, 36, 17, 28]

function formatearDuracion(segundosTotales: number) {
  const horas = Math.floor(segundosTotales / 3600)
  const minutos = Math.floor((segundosTotales % 3600) / 60)
  const segundos = segundosTotales % 60

  return [horas, minutos, segundos].map((valor) => String(valor).padStart(2, '0')).join(':')
}

function GrabacionVozComp({
  contenido,
  onCambiarEstado,
  onDescartar,
  segundosIniciales = 0,
}: GrabacionVozCompProps) {
  const [estado, setEstado] = useState<EstadoGrabacionVoz>('grabando')
  const [duracionSegundos, setDuracionSegundos] = useState(segundosIniciales)
  const duracionActualRef = useRef(segundosIniciales)
  const tituloId = useId()

  useEffect(() => {
    if (estado !== 'grabando') return

    const duracionBase = duracionActualRef.current
    const inicioTramo = Date.now()
    const intervalo = window.setInterval(() => {
      const siguienteDuracion = duracionBase + Math.floor((Date.now() - inicioTramo) / 1000)

      if (siguienteDuracion !== duracionActualRef.current) {
        duracionActualRef.current = siguienteDuracion
        setDuracionSegundos(siguienteDuracion)
      }
    }, 250)

    return () => window.clearInterval(intervalo)
  }, [estado])

  const etiquetaEstado = useMemo(() => {
    if (estado === 'descartada') return contenido.estadoDescartada
    if (estado === 'finalizada') return contenido.estadoFinalizada
    if (estado === 'pausada') return contenido.estadoPausada
    return contenido.estadoGrabando
  }, [contenido, estado])

  function actualizarEstado(nuevoEstado: EstadoGrabacionVoz) {
    setEstado(nuevoEstado)
    onCambiarEstado?.(nuevoEstado, duracionActualRef.current)
  }

  function alternarPausa() {
    actualizarEstado(estado === 'pausada' ? 'grabando' : 'pausada')
  }

  function descartarGrabacion() {
    duracionActualRef.current = 0
    setDuracionSegundos(0)
    setEstado('descartada')
    onDescartar?.()
    onCambiarEstado?.('descartada', 0)
  }

  const grabacionControlable = estado === 'grabando' || estado === 'pausada'

  return (
    <section
      aria-labelledby={tituloId}
      className='flex h-full min-h-[350px] flex-col rounded-xl border border-[#dce5ee] bg-white p-3 shadow-[0_2px_8px_rgba(18,52,91,0.04)]'
    >
      <header>
        <h2 className='text-[12px] font-extrabold text-[#0a2b70]' id={tituloId}>{contenido.titulo}</h2>
        <p className='mt-0.5 text-[8px] font-medium text-[#52698e]'>{contenido.subtitulo}</p>
      </header>

      <div className='flex flex-1 flex-col items-center justify-center py-1'>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[9px] font-extrabold ${
            estado === 'grabando'
              ? 'bg-[#e1f8e8] text-[#1a9d4b]'
              : estado === 'pausada'
                ? 'bg-[#fff3d9] text-[#c37a08]'
                : 'bg-[#e7f2ff] text-[#277bd9]'
          }`}
          role='status'
        >
          <span className={`h-1.5 w-1.5 rounded-full ${estado === 'grabando' ? 'bg-[#28b754] motion-safe:animate-pulse' : 'bg-current'}`} />
          {etiquetaEstado}
        </span>

        <div className='relative mt-2 grid h-[112px] w-[112px] place-items-center'>
          <span className={`absolute inset-0 rounded-full bg-[#eaf8fa] ${estado === 'grabando' ? 'motion-safe:animate-pulse' : ''}`} />
          <span className='absolute inset-[13px] rounded-full border-[8px] border-[#d6f2f4] bg-[#c9eef1]' />
          <span className='relative grid h-[68px] w-[68px] place-items-center rounded-full bg-gradient-to-b from-[#12b7c3] to-[#008ea6] text-white shadow-[0_8px_20px_rgba(0,151,166,0.30)]'>
            <IconoMedico className='h-9 w-9' nombre='microphone' strokeWidth={1.9} />
          </span>
        </div>

        <time className='mt-1 text-[24px] font-extrabold tracking-[0.03em] text-[#0b2d78]' dateTime={`PT${duracionSegundos}S`} role='timer'>
          {formatearDuracion(duracionSegundos)}
        </time>

        <div aria-hidden='true' className='mt-1 flex h-7 items-center justify-center gap-[3.5px] text-[#12aebd]'>
          {ALTURAS_ONDA.map((altura, indice) => (
            <span
              className={`w-[2px] rounded-full bg-current ${estado === 'grabando' ? 'motion-safe:animate-pulse' : 'opacity-55'}`}
              key={`${altura}-${indice}`}
              style={{ height: `${Math.max(7, Math.round(altura * 0.52))}px`, animationDelay: `${indice * 45}ms` }}
            />
          ))}
        </div>

        <div className='mt-2 flex flex-wrap items-center justify-center gap-2'>
          <button
            className='flex h-8 min-w-[94px] cursor-pointer items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#08aebb] to-[#078da6] px-3 text-[9px] font-extrabold text-white shadow-sm transition hover:brightness-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#08aabb] disabled:cursor-not-allowed disabled:opacity-50'
            disabled={!grabacionControlable}
            onClick={alternarPausa}
            type='button'
          >
            <IconoMedico className='h-4 w-4' nombre={estado === 'pausada' ? 'microphone' : 'pause'} strokeWidth={2} />
            {estado === 'pausada' ? contenido.reanudar : contenido.pausar}
          </button>
          <button
            className='flex h-8 min-w-[135px] cursor-pointer items-center justify-center gap-2 rounded-full border border-[#ff6972] bg-white px-3 text-[9px] font-extrabold text-[#ed4a55] transition hover:bg-[#fff5f5] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ef5963] disabled:cursor-not-allowed disabled:opacity-50'
            disabled={!grabacionControlable}
            onClick={() => actualizarEstado('finalizada')}
            type='button'
          >
            <IconoMedico className='h-4 w-4' nombre='stop' strokeWidth={1.9} />
            {contenido.finalizar}
          </button>
        </div>

        <button
          className='mt-2 flex h-8 min-w-[158px] cursor-pointer items-center justify-center gap-2 rounded-lg border border-[#d9e2eb] bg-white px-4 text-[9px] font-bold text-[#36558d] transition hover:border-[#b8c9da] hover:bg-[#f8fbfd] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#08aabb]'
          onClick={descartarGrabacion}
          type='button'
        >
          <IconoMedico className='h-4 w-4 text-[#287bdc]' nombre='trash' strokeWidth={1.7} />
          {contenido.descartar}
        </button>
      </div>
    </section>
  )
}

export default GrabacionVozComp
