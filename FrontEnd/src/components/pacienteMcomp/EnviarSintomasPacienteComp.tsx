import IconoMedico from '../IconoMedico'
import type { EstadoEnvioSintomasPaciente } from '../../hooks/useRegistroSintomasPaciente'

interface EnviarSintomasPacienteCompProps {
  estado: EstadoEnvioSintomasPaciente
  mensaje: string
  onEnviar: () => void
}

const ESTILO_MENSAJE: Record<Exclude<EstadoEnvioSintomasPaciente, 'inactivo'>, string> = {
  enviando: 'border-[#bddfea] bg-[#eff9fc] text-[#236981]',
  error: 'border-[#f4c3c6] bg-[#fff3f4] text-[#a23942]',
  exito: 'border-[#bce7c8] bg-[#effbf3] text-[#237d3d]',
}

function EnviarSintomasPacienteComp({ estado, mensaje, onEnviar }: EnviarSintomasPacienteCompProps) {
  return (
    <section aria-label='Enviar reporte de síntomas'>
      {mensaje && estado !== 'inactivo' && (
        <p
          aria-live='polite'
          className={`mb-1.5 rounded-lg border px-2.5 py-1.5 text-center text-[7.5px] font-semibold leading-[11px] ${ESTILO_MENSAJE[estado]}`}
          role={estado === 'error' ? 'alert' : 'status'}
        >
          {mensaje}
        </p>
      )}
      <button
        className='flex h-[42px] w-full items-center justify-center gap-2 rounded-[10px] bg-gradient-to-r from-[#08b5b0] to-[#009ba8] text-[10px] font-extrabold text-white shadow-[0_5px_13px_rgba(0,157,168,0.20)] transition hover:brightness-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#079ca8] disabled:cursor-wait disabled:opacity-65'
        disabled={estado === 'enviando'}
        onClick={onEnviar}
        type='button'
      >
        <IconoMedico className='h-4 w-4' nombre={estado === 'exito' ? 'check' : 'send'} strokeWidth={1.9} />
        {estado === 'enviando' ? 'Enviando reporte...' : 'Enviar síntomas al médico'}
      </button>
    </section>
  )
}

export default EnviarSintomasPacienteComp
