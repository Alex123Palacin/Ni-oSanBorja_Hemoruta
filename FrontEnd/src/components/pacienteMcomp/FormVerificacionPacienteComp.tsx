import { useRef, useState, type FormEvent } from 'react'
import useCodigoVerificacionPaciente from '../../hooks/CodigoVerificacionPaciente'
import IconoMedico from '../IconoMedico'

export interface ContenidoFormVerificacionPaciente {
  codigoEtiqueta: string
  codigoInicial: string
  confirmarContrasena: string
  confirmarContrasenaPlaceholder: string
  contrasenasNoCoinciden: string
  expiracionCodigo: string
  guardarContrasena: string
  nuevaContrasena: string
  nuevaContrasenaPlaceholder: string
  reenviarCodigo: string
  requisitos: readonly string[]
  requisitosTitulo: string
  tiempoExpiracion: string
}

export interface DatosVerificacionPaciente {
  codigo: string
  contrasena: string
}

interface FormVerificacionPacienteCompProps {
  contenido: ContenidoFormVerificacionPaciente
  onGuardar: (datos: DatosVerificacionPaciente) => void | Promise<void>
  onReenviarCodigo?: () => void | Promise<void>
}

interface CampoContrasenaProps {
  autocomplete: 'new-password'
  etiqueta: string
  id: string
  mostrar: boolean
  onCambiar: (valor: string) => void
  onMostrar: () => void
  placeholder: string
  referencia?: React.RefObject<HTMLInputElement | null>
  valor: string
}

function CampoContrasena({
  autocomplete,
  etiqueta,
  id,
  mostrar,
  onCambiar,
  onMostrar,
  placeholder,
  referencia,
  valor,
}: CampoContrasenaProps) {
  return (
    <label className='block text-left' htmlFor={id}>
      <span className='mb-1.5 block text-[10.5px] font-bold text-[#15346f]'>{etiqueta}</span>
      <span className='relative block'>
        <IconoMedico
          className='pointer-events-none absolute left-3 top-1/2 h-[16px] w-[16px] -translate-y-1/2 text-[#7890ae]'
          nombre='lock'
          strokeWidth={1.7}
        />
        <input
          autoComplete={autocomplete}
          className='h-[38px] w-full rounded-lg border border-[#d7e0eb] bg-white pl-9 pr-10 text-[10px] font-medium text-[#17366f] outline-none transition placeholder:text-[#71819b] focus:border-[#05aeb0] focus:ring-2 focus:ring-[#05aeb0]/15'
          id={id}
          minLength={8}
          onChange={(evento) => onCambiar(evento.target.value)}
          placeholder={placeholder}
          ref={referencia}
          required
          type={mostrar ? 'text' : 'password'}
          value={valor}
        />
        <button
          aria-label={mostrar ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          aria-pressed={mostrar}
          className='absolute right-0 top-1/2 grid h-9 w-9 -translate-y-1/2 cursor-pointer place-items-center rounded-lg text-[#71839f] transition hover:bg-[#f2f8fb] hover:text-[#00a7ad] focus-visible:outline-2 focus-visible:outline-[#08aabb]'
          onClick={onMostrar}
          type='button'
        >
          <IconoMedico className='h-[18px] w-[18px]' nombre={mostrar ? 'eyeOff' : 'eye'} strokeWidth={1.7} />
        </button>
      </span>
    </label>
  )
}

function FormVerificacionPacienteComp({
  contenido,
  onGuardar,
  onReenviarCodigo,
}: FormVerificacionPacienteCompProps) {
  const {
    asignarReferencia,
    cambiarDigito,
    codigo,
    codigoCompleto,
    manejarPegado,
    manejarTecla,
    reiniciarCodigo,
  } = useCodigoVerificacionPaciente(6, contenido.codigoInicial)
  const [nuevaContrasena, setNuevaContrasena] = useState('')
  const [confirmacion, setConfirmacion] = useState('')
  const [mostrarNueva, setMostrarNueva] = useState(false)
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false)
  const [error, setError] = useState('')
  const confirmacionRef = useRef<HTMLInputElement>(null)

  function manejarEnvio(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()

    if (nuevaContrasena !== confirmacion) {
      setError(contenido.contrasenasNoCoinciden)
      confirmacionRef.current?.focus()
      return
    }

    setError('')
    void onGuardar({ codigo: codigoCompleto, contrasena: nuevaContrasena })
  }

  function manejarReenvio() {
    reiniciarCodigo()
    void onReenviarCodigo?.()
  }

  return (
    <form className='flex w-full flex-1 flex-col items-center bg-white pb-[env(safe-area-inset-bottom)]' onSubmit={manejarEnvio}>
      <section className='min-h-[124px] w-[calc(100%-14px)] max-w-[370px] rounded-[14px] border border-[#e2e9f0] bg-white px-4 pb-3 pt-3 text-center shadow-[0_4px_14px_rgba(24,59,100,0.09)]'>
        <h2 className='text-[10.5px] font-bold text-[#17366f]'>{contenido.codigoEtiqueta}</h2>

        <div className='mt-3 grid grid-cols-6 gap-2'>
          {codigo.map((digito, indice) => (
            <input
              aria-label={`${contenido.codigoEtiqueta}, dígito ${indice + 1}`}
              autoComplete={indice === 0 ? 'one-time-code' : 'off'}
              className={`h-[41px] min-w-0 rounded-lg border bg-white text-center text-[21px] font-medium outline-none transition focus:ring-2 focus:ring-[#05aeb0]/15 ${
                digito ? 'border-[#04aeb2] text-[#079ca8]' : 'border-[#d7e0eb] text-[#17366f] focus:border-[#05aeb0]'
              }`}
              inputMode='numeric'
              key={indice}
              maxLength={1}
              onChange={(evento) => cambiarDigito(indice, evento.target.value)}
              onFocus={(evento) => evento.target.select()}
              onKeyDown={(evento) => manejarTecla(indice, evento)}
              onPaste={(evento) => manejarPegado(indice, evento)}
              pattern='[0-9]'
              ref={(elemento) => asignarReferencia(indice, elemento)}
              required
              type='text'
              value={digito}
            />
          ))}
        </div>

        <p className='mt-2.5 flex items-center justify-center gap-1 text-[9.5px] font-medium text-[#647795]'>
          <IconoMedico className='h-[12px] w-[12px]' nombre='clock' strokeWidth={1.8} />
          {contenido.expiracionCodigo} <strong className='font-bold text-[#00a7aa]'>{contenido.tiempoExpiracion}</strong>
        </p>
      </section>

      <section className='mt-2.5 min-h-[253px] w-[calc(100%-14px)] max-w-[370px] rounded-[14px] border border-[#e2e9f0] bg-white px-3.5 pb-3 pt-3.5 shadow-[0_4px_14px_rgba(24,59,100,0.09)]'>
        <CampoContrasena
          autocomplete='new-password'
          etiqueta={contenido.nuevaContrasena}
          id='nueva-contrasena-paciente'
          mostrar={mostrarNueva}
          onCambiar={(valor) => {
            setNuevaContrasena(valor)
            setError('')
          }}
          onMostrar={() => setMostrarNueva((valorActual) => !valorActual)}
          placeholder={contenido.nuevaContrasenaPlaceholder}
          valor={nuevaContrasena}
        />

        <div className='relative mt-3.5'>
          <CampoContrasena
            autocomplete='new-password'
            etiqueta={contenido.confirmarContrasena}
            id='confirmar-contrasena-paciente'
            mostrar={mostrarConfirmacion}
            onCambiar={(valor) => {
              setConfirmacion(valor)
              setError('')
            }}
            onMostrar={() => setMostrarConfirmacion((valorActual) => !valorActual)}
            placeholder={contenido.confirmarContrasenaPlaceholder}
            referencia={confirmacionRef}
            valor={confirmacion}
          />
          {error && (
            <p aria-live='polite' className='absolute -bottom-3 right-0 text-[8px] font-semibold text-[#d84b55]'>
              {error}
            </p>
          )}
        </div>

        <div className='mt-3.5 rounded-lg border border-[#deebf3] bg-[#f2f9ff] px-2.5 py-2'>
          <div className='flex items-center gap-2 text-[#12356f]'>
            <IconoMedico className='h-[18px] w-[18px] shrink-0 text-[#02aeb2]' nombre='shield' strokeWidth={1.7} />
            <strong className='text-[9px] font-bold'>{contenido.requisitosTitulo}</strong>
          </div>
          <ul className='mt-2 grid grid-cols-2 gap-x-2 gap-y-1.5 text-left'>
            {contenido.requisitos.map((requisito) => (
              <li className='flex min-w-0 items-start gap-1.5 text-[7.5px] font-medium leading-[10px] text-[#294a7d]' key={requisito}>
                <span className='mt-px grid h-3 w-3 shrink-0 place-items-center rounded-full border border-[#05aeb0] text-[#05aeb0]'>
                  <IconoMedico className='h-2 w-2' nombre='check' strokeWidth={2.2} />
                </span>
                {requisito}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <button
        className='mt-1.5 flex min-h-[31px] cursor-pointer items-center justify-center gap-1.5 rounded-lg px-4 text-[10.5px] font-bold text-[#00a3a7] transition hover:bg-[#effafa] hover:text-[#007e88] focus-visible:outline-2 focus-visible:outline-[#08aabb]'
        onClick={manejarReenvio}
        type='button'
      >
        <IconoMedico className='h-[15px] w-[15px]' nombre='refresh' strokeWidth={1.8} />
        {contenido.reenviarCodigo}
      </button>

      <button
        className='mt-1 h-10 w-[calc(100%-28px)] max-w-[356px] cursor-pointer rounded-[18px] bg-gradient-to-r from-[#09b8b0] to-[#049fa7] text-[13px] font-bold text-white shadow-[0_6px_13px_rgba(0,159,167,0.18)] transition hover:brightness-95 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#087fa0] active:translate-y-px'
        type='submit'
      >
        {contenido.guardarContrasena}
      </button>
    </form>
  )
}

export default FormVerificacionPacienteComp
