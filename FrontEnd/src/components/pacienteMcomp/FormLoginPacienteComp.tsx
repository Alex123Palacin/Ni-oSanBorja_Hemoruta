import { useState, type FormEvent } from 'react'
import IconoMedico from '../IconoMedico'

export interface CredencialesPaciente {
  contrasena: string
  identificador: string
  recordarme: boolean
}

export interface ContenidoFormLoginPaciente {
  avisoPrivacidad: string
  contrasenaPlaceholder: string
  continuarWhatsApp: string
  cuentaAdministrada: string
  identificadorPlaceholder: string
  iniciarSesion: string
  proteccionDatos: string
  recordarme: string
  recuperarCuenta: string
  separador: string
}

interface FormLoginPacienteCompProps {
  contenido: ContenidoFormLoginPaciente
  onIniciarSesion: (credenciales: CredencialesPaciente) => void | Promise<void>
  onRecuperarCuenta: () => void
  onWhatsApp: () => void
}

function FormLoginPacienteComp({
  contenido,
  onIniciarSesion,
  onRecuperarCuenta,
  onWhatsApp,
}: FormLoginPacienteCompProps) {
  const [identificador, setIdentificador] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [recordarme, setRecordarme] = useState(true)
  const [mostrarContrasena, setMostrarContrasena] = useState(false)

  function manejarEnvio(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    void onIniciarSesion({ contrasena, identificador: identificador.trim(), recordarme })
  }

  return (
    <form
      className='relative z-30 mx-2 mb-2 flex flex-1 flex-col rounded-[20px] border border-[#e1e8ef] bg-white px-3.5 pb-[max(18px,env(safe-area-inset-bottom))] pt-[18px] shadow-[0_4px_18px_rgba(20,52,92,0.10)]'
      onSubmit={manejarEnvio}
    >
      <div className='space-y-3.5'>
        <label className='relative block' htmlFor='identificador-paciente'>
          <span className='sr-only'>{contenido.identificadorPlaceholder}</span>
          <IconoMedico
            className='pointer-events-none absolute left-3.5 top-1/2 h-[22px] w-[22px] -translate-y-1/2 text-[#00aeb0]'
            nombre='user'
            strokeWidth={1.8}
          />
          <input
            autoCapitalize='none'
            autoComplete='username'
            className='h-12 w-full rounded-xl border border-[#d7e0eb] bg-white pl-[49px] pr-3 text-[13px] font-medium text-[#15366f] outline-none transition placeholder:text-[#71809a] focus:border-[#05aeb0] focus:ring-2 focus:ring-[#05aeb0]/15'
            id='identificador-paciente'
            name='identificador'
            onChange={(evento) => setIdentificador(evento.target.value)}
            placeholder={contenido.identificadorPlaceholder}
            required
            spellCheck={false}
            type='text'
            value={identificador}
          />
        </label>

        <label className='relative block' htmlFor='contrasena-paciente'>
          <span className='sr-only'>{contenido.contrasenaPlaceholder}</span>
          <IconoMedico
            className='pointer-events-none absolute left-3.5 top-1/2 h-[21px] w-[21px] -translate-y-1/2 text-[#00aeb0]'
            nombre='lock'
            strokeWidth={1.8}
          />
          <input
            autoComplete='current-password'
            className='h-12 w-full rounded-xl border border-[#d7e0eb] bg-white pl-[49px] pr-12 text-[13px] font-medium text-[#15366f] outline-none transition placeholder:text-[#71809a] focus:border-[#05aeb0] focus:ring-2 focus:ring-[#05aeb0]/15'
            id='contrasena-paciente'
            name='contrasena'
            onChange={(evento) => setContrasena(evento.target.value)}
            placeholder={contenido.contrasenaPlaceholder}
            required
            type={mostrarContrasena ? 'text' : 'password'}
            value={contrasena}
          />
          <button
            aria-label={mostrarContrasena ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            aria-pressed={mostrarContrasena}
            className='absolute right-1.5 top-1/2 grid h-10 w-10 -translate-y-1/2 cursor-pointer place-items-center rounded-lg text-[#6e7d97] transition hover:bg-[#f0f8fa] hover:text-[#00aeb0] focus-visible:outline-2 focus-visible:outline-[#08aabb]'
            onClick={() => setMostrarContrasena((valorActual) => !valorActual)}
            type='button'
          >
            <IconoMedico
              className='h-[21px] w-[21px]'
              nombre={mostrarContrasena ? 'eyeOff' : 'eye'}
              strokeWidth={1.8}
            />
          </button>
        </label>
      </div>

      <div className='my-3.5 flex min-h-7 items-center justify-between gap-2'>
        <label className='flex cursor-pointer items-center gap-2 text-[11px] font-medium text-[#19386f]'>
          <input
            checked={recordarme}
            className='peer sr-only'
            name='recordarme'
            onChange={(evento) => setRecordarme(evento.target.checked)}
            type='checkbox'
          />
          <span className="relative h-[22px] w-[38px] shrink-0 rounded-full bg-[#cbd6e1] transition-colors after:absolute after:left-[3px] after:top-[3px] after:h-4 after:w-4 after:rounded-full after:bg-white after:shadow-sm after:transition-transform after:content-[''] peer-checked:bg-[#00aaa9] peer-checked:after:translate-x-4 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[#08aabb]" />
          {contenido.recordarme}
        </label>

        <button
          className='min-h-9 cursor-pointer rounded-md px-1 text-right text-[10.5px] font-semibold text-[#00a4a8] transition hover:text-[#007f89] hover:underline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#08aabb]'
          onClick={onRecuperarCuenta}
          type='button'
        >
          {contenido.recuperarCuenta}
        </button>
      </div>

      <button
        className='h-11 w-full cursor-pointer rounded-xl bg-gradient-to-r from-[#09b8b0] to-[#049fa7] text-[15px] font-bold text-white shadow-[0_5px_12px_rgba(0,165,171,0.18)] transition hover:brightness-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#087fa0] active:translate-y-px'
        type='submit'
      >
        {contenido.iniciarSesion}
      </button>

      <div className='my-3.5 flex items-center gap-3 text-[11px] font-semibold text-[#6e7d96]'>
        <span className='h-px flex-1 bg-[#dce4ec]' />
        <span>{contenido.separador}</span>
        <span className='h-px flex-1 bg-[#dce4ec]' />
      </div>

      <button
        className='flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#d7e0e9] bg-white text-[13px] font-bold text-[#00a28e] transition hover:border-[#19b767] hover:bg-[#f4fff8] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#19b767]'
        onClick={onWhatsApp}
        type='button'
      >
        <IconoMedico className='h-[23px] w-[23px] text-[#13b85f]' nombre='whatsapp' strokeWidth={1.9} />
        {contenido.continuarWhatsApp}
      </button>

      <div className='mt-3 flex min-h-[52px] items-center justify-center gap-3 rounded-xl bg-[#eef6ff] px-4 py-2 text-[#163a78]'>
        <IconoMedico className='h-[27px] w-[27px] shrink-0 text-[#1688ee]' nombre='users' strokeWidth={1.7} />
        <p className='max-w-[175px] text-center text-[10.5px] font-medium leading-[14px]'>{contenido.cuentaAdministrada}</p>
      </div>

      <div className='mt-3 flex items-center justify-center gap-2.5 px-1 text-[#687a98]'>
        <IconoMedico className='h-[27px] w-[27px] shrink-0 text-[#02aeb2]' nombre='shield' strokeWidth={1.6} />
        <p className='text-[9.5px] leading-[14px]'>
          {contenido.proteccionDatos}
          <br />
          Consulta nuestro <span className='font-semibold text-[#00a4a8]'>{contenido.avisoPrivacidad}</span>
        </p>
      </div>
    </form>
  )
}

export default FormLoginPacienteComp
