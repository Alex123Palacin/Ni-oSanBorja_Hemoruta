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
  cargando?: boolean
  contenido: ContenidoFormLoginPaciente
  error?: string | null
  onIniciarSesion: (credenciales: CredencialesPaciente) => void | Promise<void>
  onRecuperarCuenta: () => void
  onWhatsApp: () => void
}

function FormLoginPacienteComp({
  cargando = false,
  contenido,
  error,
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
      className='relative z-30 mx-[clamp(8px,2.7vw,10px)] mb-2 flex flex-1 flex-col rounded-[20px] border border-[#e1e8ef] bg-white px-[clamp(13px,4.35vw,16px)] pb-[max(18px,env(safe-area-inset-bottom))] pt-[clamp(18px,6.25vw,23px)] shadow-[0_5px_22px_rgba(20,52,92,0.10)]'
      onSubmit={manejarEnvio}
    >
      <div className='space-y-[clamp(14px,4.9vw,18px)]'>
        <label className='relative block' htmlFor='identificador-paciente'>
          <span className='sr-only'>{contenido.identificadorPlaceholder}</span>
          <IconoMedico
            className='pointer-events-none absolute left-[clamp(14px,4.6vw,17px)] top-1/2 h-[clamp(22px,6.5vw,24px)] w-[clamp(22px,6.5vw,24px)] -translate-y-1/2 text-[#00a9ad]'
            nombre='user'
            strokeWidth={1.7}
          />
          <input
            autoCapitalize='none'
            autoComplete='username'
            className='h-[clamp(48px,16vw,59px)] w-full rounded-[14px] border border-[#d7e0eb] bg-white pl-[clamp(49px,15.2vw,56px)] pr-4 text-[clamp(13px,4.35vw,16px)] font-medium text-[#15366f] outline-none transition placeholder:text-[#71809a] focus:border-[#05aeb0] focus:ring-2 focus:ring-[#05aeb0]/15'
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
            className='pointer-events-none absolute left-[clamp(14px,4.6vw,17px)] top-1/2 h-[clamp(21px,6.5vw,24px)] w-[clamp(21px,6.5vw,24px)] -translate-y-1/2 text-[#00a9ad]'
            nombre='lock'
            strokeWidth={1.7}
          />
          <input
            autoComplete='current-password'
            className='h-[clamp(48px,16vw,59px)] w-full rounded-[14px] border border-[#d7e0eb] bg-white pl-[clamp(49px,15.2vw,56px)] pr-14 text-[clamp(13px,4.35vw,16px)] font-medium text-[#15366f] outline-none transition placeholder:text-[#71809a] focus:border-[#05aeb0] focus:ring-2 focus:ring-[#05aeb0]/15'
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
            className='absolute right-1.5 top-1/2 grid h-11 w-11 -translate-y-1/2 cursor-pointer place-items-center rounded-lg text-[#6e7d97] transition hover:bg-[#f0f8fa] hover:text-[#00aeb0] focus-visible:outline-2 focus-visible:outline-[#08aabb]'
            onClick={() => setMostrarContrasena((valorActual) => !valorActual)}
            type='button'
          >
            <IconoMedico
              className='h-[clamp(21px,6.5vw,24px)] w-[clamp(21px,6.5vw,24px)]'
              nombre={mostrarContrasena ? 'eyeOff' : 'eye'}
              strokeWidth={1.8}
            />
          </button>
        </label>
      </div>

      <div className='mt-[clamp(10px,2.8vw,11px)] flex min-h-[clamp(36px,11.9vw,44px)] items-center justify-between gap-2'>
        <label className='flex cursor-pointer items-center gap-2.5 text-[clamp(11px,3.52vw,13px)] font-medium text-[#19386f]'>
          <input
            checked={recordarme}
            className='peer sr-only'
            name='recordarme'
            onChange={(evento) => setRecordarme(evento.target.checked)}
            type='checkbox'
          />
          <span className="relative h-[clamp(22px,7.3vw,27px)] w-[clamp(38px,12.5vw,46px)] shrink-0 rounded-full bg-[#cbd6e1] transition-colors after:absolute after:left-[3px] after:top-[3px] after:h-[calc(100%-6px)] after:aspect-square after:rounded-full after:bg-white after:shadow-sm after:transition-transform after:content-[''] peer-checked:bg-[#00aaa9] peer-checked:after:translate-x-[clamp(16px,5.15vw,19px)] peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[#08aabb]" />
          {contenido.recordarme}
        </label>

        <button
          className='min-h-11 cursor-pointer rounded-md px-1 text-right text-[clamp(10.5px,3.52vw,13px)] font-semibold text-[#00a4a8] transition hover:text-[#007f89] hover:underline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#08aabb]'
          onClick={onRecuperarCuenta}
          type='button'
        >
          {contenido.recuperarCuenta}
        </button>
      </div>

      {error && (
        <p aria-live='polite' className='mt-2 text-center text-[11px] font-semibold text-[#d6424d]' role='alert'>
          {error}
        </p>
      )}

      <button
        className='mt-[clamp(16px,5.42vw,20px)] h-[clamp(44px,14.9vw,55px)] w-full cursor-pointer rounded-[14px] bg-gradient-to-r from-[#09b8b0] to-[#049fa7] text-[clamp(15px,4.88vw,18px)] font-bold text-white shadow-[0_5px_12px_rgba(0,165,171,0.18)] transition hover:brightness-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#087fa0] active:translate-y-px disabled:cursor-wait disabled:opacity-70'
        disabled={cargando}
        type='submit'
      >
        {cargando ? 'Ingresando…' : contenido.iniciarSesion}
      </button>

      <div className='mb-[clamp(10px,3.25vw,12px)] mt-[clamp(19px,6.5vw,24px)] flex items-center gap-3 text-[clamp(11px,3.25vw,12px)] font-semibold text-[#6e7d96]'>
        <span className='h-px flex-1 bg-[#dce4ec]' />
        <span>{contenido.separador}</span>
        <span className='h-px flex-1 bg-[#dce4ec]' />
      </div>

      <button
        className='flex h-[clamp(44px,14.65vw,54px)] w-full cursor-pointer items-center justify-center gap-2.5 rounded-[14px] border border-[#d7e0e9] bg-white text-[clamp(13px,4.35vw,16px)] font-bold text-[#00a28e] transition hover:border-[#19b767] hover:bg-[#f4fff8] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#19b767]'
        onClick={onWhatsApp}
        type='button'
      >
        <IconoMedico className='h-[clamp(23px,7.3vw,27px)] w-[clamp(23px,7.3vw,27px)] text-[#13b85f]' nombre='whatsapp' strokeWidth={1.7} />
        {contenido.continuarWhatsApp}
      </button>

      <div className='mt-[clamp(12px,3.8vw,14px)] flex min-h-[clamp(52px,16.8vw,62px)] items-center justify-center gap-3 rounded-[13px] bg-[#eef6ff] px-4 py-2 text-[#163a78]'>
        <IconoMedico className='h-[clamp(27px,8.15vw,30px)] w-[clamp(27px,8.15vw,30px)] shrink-0 text-[#1688ee]' nombre='users' strokeWidth={1.7} />
        <p className='max-w-[205px] text-center text-[clamp(10.5px,3.52vw,13px)] font-medium leading-[1.35]'>{contenido.cuentaAdministrada}</p>
      </div>

      <div className='mt-[clamp(14px,5.42vw,20px)] flex min-h-[clamp(52px,16.25vw,60px)] items-center justify-center gap-3 px-1 text-[#687a98]'>
        <IconoMedico className='h-[clamp(27px,8.4vw,31px)] w-[clamp(27px,8.4vw,31px)] shrink-0 text-[#02aeb2]' nombre='shield' strokeWidth={1.6} />
        <p className='text-[clamp(9.5px,3.38vw,12.5px)] leading-[1.4]'>
          {contenido.proteccionDatos}
          <br />
          Consulta nuestro <span className='font-semibold text-[#00a4a8]'>{contenido.avisoPrivacidad}</span>
        </p>
      </div>
    </form>
  )
}

export default FormLoginPacienteComp
