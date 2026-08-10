import { useId, useMemo, useState, type FormEvent } from 'react'
import IconoMedico from './IconoMedico'

export interface RequisitoContrasenaActivacion {
  id: string
  texto: string
  validar: (contrasena: string) => boolean
}

export interface ContenidoFormActivacionCuenta {
  botonActivar: string
  confirmarContrasenaEtiqueta: string
  confirmarContrasenaPlaceholder: string
  correoEtiqueta: string
  descripcion: readonly string[]
  enlaceValido: string
  errorContrasenasDistintas: string
  errorRequisitos: string
  nuevaContrasenaEtiqueta: string
  nuevaContrasenaPlaceholder: string
  requisitosTitulo: string
  titulo: string
}

export interface DatosActivacionCuenta {
  contrasena: string
  correoInstitucional: string
}

interface FormActivacionCuentaCompProps {
  contenido: ContenidoFormActivacionCuenta
  correoInstitucional: string
  onActivar?: (datos: DatosActivacionCuenta) => void | Promise<void>
  requisitos: readonly RequisitoContrasenaActivacion[]
}

interface CampoContrasenaProps {
  ariaDescribedBy?: string
  ariaInvalid?: boolean
  etiqueta: string
  id: string
  mostrar: boolean
  onAlternarVisibilidad: () => void
  onChange: (valor: string) => void
  placeholder: string
  valor: string
}

function CampoContrasena({
  ariaDescribedBy,
  ariaInvalid,
  etiqueta,
  id,
  mostrar,
  onAlternarVisibilidad,
  onChange,
  placeholder,
  valor,
}: CampoContrasenaProps) {
  return (
    <div>
      <label className='mb-1.5 block text-[11px] font-bold text-[#183a7a]' htmlFor={id}>{etiqueta}</label>
      <div className='relative'>
        <IconoMedico className='pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#62799b]' nombre='lock' strokeWidth={1.65} />
        <input
          aria-describedby={ariaDescribedBy}
          aria-invalid={ariaInvalid}
          autoComplete='new-password'
          className='h-11 w-full rounded-lg border border-[#d7e0ea] bg-white pl-10 pr-11 text-[11px] font-medium text-[#183a70] outline-none transition placeholder:text-[#a0aec1] focus:border-[#08aebb] focus:ring-3 focus:ring-[#08aebb]/10'
          id={id}
          minLength={8}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          required
          type={mostrar ? 'text' : 'password'}
          value={valor}
        />
        <button
          aria-label={mostrar ? `Ocultar ${etiqueta.toLowerCase()}` : `Mostrar ${etiqueta.toLowerCase()}`}
          aria-pressed={mostrar}
          className='absolute right-1.5 top-1/2 grid h-9 w-9 -translate-y-1/2 cursor-pointer place-items-center rounded-md text-[#49688f] transition hover:bg-[#edf8fa] hover:text-[#079eac] focus-visible:outline-2 focus-visible:outline-[#08aabb]'
          onClick={onAlternarVisibilidad}
          type='button'
        >
          <IconoMedico className='h-4 w-4' nombre={mostrar ? 'eyeOff' : 'eye'} strokeWidth={1.7} />
        </button>
      </div>
    </div>
  )
}

function FormActivacionCuentaComp({
  contenido,
  correoInstitucional,
  onActivar,
  requisitos,
}: FormActivacionCuentaCompProps) {
  const [contrasena, setContrasena] = useState('')
  const [confirmacion, setConfirmacion] = useState('')
  const [mostrarContrasena, setMostrarContrasena] = useState(false)
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false)
  const [intentoEnvio, setIntentoEnvio] = useState(false)
  const requisitosId = useId()
  const errorId = useId()

  const estadosRequisitos = useMemo(
    () => requisitos.map((requisito) => ({ ...requisito, cumple: requisito.validar(contrasena) })),
    [contrasena, requisitos],
  )
  const cumpleRequisitos = estadosRequisitos.every((requisito) => requisito.cumple)
  const contrasenasCoinciden = contrasena.length > 0 && contrasena === confirmacion
  const mensajeError = intentoEnvio
    ? !cumpleRequisitos
      ? contenido.errorRequisitos
      : !contrasenasCoinciden
        ? contenido.errorContrasenasDistintas
        : null
    : null

  function cambiarContrasena(valor: string) {
    setContrasena(valor)
    setIntentoEnvio(false)
  }

  function cambiarConfirmacion(valor: string) {
    setConfirmacion(valor)
    setIntentoEnvio(false)
  }

  function enviarFormulario(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIntentoEnvio(true)

    if (!cumpleRequisitos || !contrasenasCoinciden) return

    void onActivar?.({ contrasena, correoInstitucional })
  }

  return (
    <form
      className='w-full rounded-[18px] border border-white/90 bg-white px-5 py-6 shadow-[0_15px_45px_rgba(15,46,85,0.09)] sm:px-8 sm:py-8 lg:px-12'
      noValidate
      onSubmit={enviarFormulario}
    >
      <div className='text-center'>
        <span className='inline-flex items-center gap-1.5 rounded-full border border-[#cfeade] bg-[#eff9f5] px-4 py-1.5 text-[9px] font-extrabold text-[#169666]' role='status'>
          <IconoMedico className='h-3.5 w-3.5' nombre='shield' strokeWidth={1.8} />
          {contenido.enlaceValido}
        </span>
        <h1 className='mt-5 text-[clamp(22px,2.2vw,29px)] font-extrabold tracking-[-0.025em] text-[#0a2b70]'>
          {contenido.titulo}
        </h1>
        <div className='mx-auto mt-2 max-w-[600px] text-[11px] font-medium leading-[17px] text-[#637594] sm:text-[12px]'>
          {contenido.descripcion.map((linea) => <p key={linea}>{linea}</p>)}
        </div>
      </div>

      <div className='mx-auto mt-7 grid max-w-[700px] gap-5 lg:grid-cols-[minmax(0,1.55fr)_minmax(190px,0.9fr)] lg:gap-8'>
        <div className='space-y-3'>
          <div>
            <label className='mb-1.5 block text-[11px] font-bold text-[#183a7a]' htmlFor='correo-institucional'>
              {contenido.correoEtiqueta}
            </label>
            <div className='relative'>
              <IconoMedico className='pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#62799b]' nombre='mail' strokeWidth={1.65} />
              <input
                autoComplete='username'
                className='h-11 w-full rounded-lg border border-[#d7e0ea] bg-[#f4f6f8] pl-10 pr-3 text-[11px] font-medium text-[#8290a5] outline-none'
                id='correo-institucional'
                readOnly
                type='email'
                value={correoInstitucional}
              />
            </div>
          </div>

          <CampoContrasena
            ariaDescribedBy={requisitosId}
            ariaInvalid={Boolean(mensajeError && !cumpleRequisitos)}
            etiqueta={contenido.nuevaContrasenaEtiqueta}
            id='nueva-contrasena-activacion'
            mostrar={mostrarContrasena}
            onAlternarVisibilidad={() => setMostrarContrasena((actual) => !actual)}
            onChange={cambiarContrasena}
            placeholder={contenido.nuevaContrasenaPlaceholder}
            valor={contrasena}
          />

          <CampoContrasena
            ariaDescribedBy={mensajeError ? errorId : undefined}
            ariaInvalid={Boolean(mensajeError && cumpleRequisitos && !contrasenasCoinciden)}
            etiqueta={contenido.confirmarContrasenaEtiqueta}
            id='confirmar-contrasena-activacion'
            mostrar={mostrarConfirmacion}
            onAlternarVisibilidad={() => setMostrarConfirmacion((actual) => !actual)}
            onChange={cambiarConfirmacion}
            placeholder={contenido.confirmarContrasenaPlaceholder}
            valor={confirmacion}
          />
        </div>

        <aside
          aria-label={contenido.requisitosTitulo}
          className='self-center rounded-xl border border-[#dfe7ee] bg-[#fcfeff] p-4 shadow-[0_4px_14px_rgba(15,46,85,0.03)]'
          id={requisitosId}
        >
          <h2 className='flex items-center gap-2 text-[10px] font-extrabold text-[#163776]'>
            <IconoMedico className='h-4 w-4 text-[#486591]' nombre='lock' strokeWidth={1.7} />
            {contenido.requisitosTitulo}
          </h2>
          <ul className='mt-3 space-y-2'>
            {estadosRequisitos.map((requisito) => (
              <li className='flex items-center gap-2 text-[9px] font-medium text-[#526a8f]' key={requisito.id}>
                <span
                  aria-hidden='true'
                  className={`h-1.5 w-1.5 shrink-0 rounded-full ${requisito.cumple ? 'bg-[#21ad64]' : 'bg-[#13b8bf]'}`}
                />
                <span className='sr-only'>{requisito.cumple ? 'Cumplido:' : 'Pendiente:'}</span>
                {requisito.texto}
              </li>
            ))}
          </ul>
        </aside>
      </div>

      <div className='mx-auto mt-5 min-h-4 max-w-[700px] text-center'>
        {mensajeError && <p className='text-[10px] font-semibold text-[#d6424d]' id={errorId} role='alert'>{mensajeError}</p>}
      </div>

      <button
        className='mx-auto mt-2 flex h-12 w-full max-w-[390px] cursor-pointer items-center justify-center rounded-xl bg-gradient-to-r from-[#0bb5ae] to-[#009da7] px-5 text-[13px] font-extrabold text-white shadow-[0_9px_20px_rgba(4,162,170,0.20)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_25px_rgba(4,162,170,0.27)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#08aeb5] active:translate-y-0'
        type='submit'
      >
        {contenido.botonActivar}
      </button>
    </form>
  )
}

export default FormActivacionCuentaComp
