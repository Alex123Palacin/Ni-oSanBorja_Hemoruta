import type { FormEvent } from 'react'
import IconoMedico from '../IconoMedico'

export interface ContenidoFormRecuperacionPaciente {
  ayuda: string
  descripcion: string
  enviarCodigo: string
  identificadorEtiqueta: string
  identificadorPlaceholder: string
  seguridadDescripcion: string
  seguridadTitulo: string
  titulo: string
  volver: string
}

interface FormRecuperacionPacienteCompProps {
  contenido: ContenidoFormRecuperacionPaciente
  onEnviarCodigo: (identificador: string) => void | Promise<void>
  onVolver: () => void
}

function FormRecuperacionPacienteComp({
  contenido,
  onEnviarCodigo,
  onVolver,
}: FormRecuperacionPacienteCompProps) {
  function manejarEnvio(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    const datos = new FormData(evento.currentTarget)
    const identificador = String(datos.get('identificador') ?? '').trim()

    if (identificador) {
      void onEnviarCodigo(identificador)
    }
  }

  return (
    <section className='flex w-full flex-1 flex-col items-center px-[18px] pb-[max(16px,env(safe-area-inset-bottom))] pt-7 text-center'>
      <h1 className='text-[22px] font-extrabold leading-[27px] tracking-[-0.025em] text-[#0a2b70]'>{contenido.titulo}</h1>
      <p className='mt-2 max-w-[285px] text-[11.5px] font-medium leading-[17px] text-[#5d6e8d]'>{contenido.descripcion}</p>

      <form className='mt-5 w-full max-w-[360px]' onSubmit={manejarEnvio}>
        <label className='relative block' htmlFor='identificador-recuperacion-paciente'>
          <span className='sr-only'>{contenido.identificadorEtiqueta}</span>
          <IconoMedico
            className='pointer-events-none absolute left-3.5 top-1/2 h-[22px] w-[22px] -translate-y-1/2 text-[#00aeb0]'
            nombre='user'
            strokeWidth={1.8}
          />
          <input
            aria-describedby='ayuda-identificador-paciente'
            autoCapitalize='none'
            autoComplete='username'
            className='h-[54px] w-full rounded-xl border border-[#d7e0eb] bg-white pl-[49px] pr-3 text-[13px] font-medium text-[#15366f] shadow-[0_4px_12px_rgba(30,65,105,0.07)] outline-none transition placeholder:text-[#687a96] focus:border-[#05aeb0] focus:ring-2 focus:ring-[#05aeb0]/15'
            id='identificador-recuperacion-paciente'
            name='identificador'
            placeholder={contenido.identificadorPlaceholder}
            required
            spellCheck={false}
            type='text'
          />
        </label>

        <p
          className='mt-3 px-5 text-left text-[10px] font-medium leading-[14px] text-[#5f7190]'
          id='ayuda-identificador-paciente'
        >
          {contenido.ayuda}
        </p>

        <button
          className='mt-5 h-[46px] w-full cursor-pointer rounded-[18px] bg-gradient-to-r from-[#09b8b0] to-[#049fa7] text-[15px] font-bold text-white shadow-[0_7px_14px_rgba(0,159,167,0.20)] transition hover:brightness-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#087fa0] active:translate-y-px'
          type='submit'
        >
          {contenido.enviarCodigo}
        </button>
      </form>

      <button
        className='mt-2.5 min-h-9 cursor-pointer rounded-lg px-5 text-[13px] font-bold text-[#00a5a7] transition hover:bg-[#effafa] hover:text-[#007f89] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#08aabb]'
        onClick={onVolver}
        type='button'
      >
        {contenido.volver}
      </button>

      <div className='mt-3 flex min-h-[52px] w-full max-w-[360px] items-center justify-center gap-3 rounded-xl bg-[#eef6ff] px-4 py-2 text-left text-[#173a77]'>
        <IconoMedico className='h-[27px] w-[27px] shrink-0 text-[#04aeb2]' nombre='shield' strokeWidth={1.7} />
        <p className='leading-[14px]'>
          <strong className='block text-[10.5px] font-bold'>{contenido.seguridadTitulo}</strong>
          <span className='block text-[9.5px] font-medium text-[#536a8e]'>{contenido.seguridadDescripcion}</span>
        </p>
      </div>
    </section>
  )
}

export default FormRecuperacionPacienteComp
