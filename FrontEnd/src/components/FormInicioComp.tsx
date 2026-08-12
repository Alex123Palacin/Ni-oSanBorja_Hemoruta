import { useState, type FormEvent } from 'react'

export interface CredencialesPersonal {
  contrasena: string
  identificador: string
  recordarme: boolean
}

interface FormInicioCompProps {
  cargando?: boolean
  error?: string | null
  onIniciarSesion?: (credenciales: CredencialesPersonal) => void | Promise<void>
  onRecuperarCuenta?: () => void
}

function FormInicioComp({
  cargando = false,
  error,
  onIniciarSesion,
  onRecuperarCuenta,
}: FormInicioCompProps) {
  const [identificador, setIdentificador] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [recordarme, setRecordarme] = useState(false)
  const [mostrarContrasena, setMostrarContrasena] = useState(false)

  function iniciarSesion(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!onIniciarSesion) return

    void onIniciarSesion({
      contrasena,
      identificador: identificador.trim(),
      recordarme,
    })
  }

  return (
    <form
      className='mx-auto w-[85%] max-w-[620px] rounded-[22px] border border-slate-200 bg-white px-6 py-8 shadow-[0_12px_40px_rgba(15,46,85,0.10)] sm:px-12 sm:py-10'
      onSubmit={iniciarSesion}
    >
      <header>
        <h1 className='text-3xl font-bold tracking-tight text-[#082767] sm:text-[34px]'>
          Iniciar sesión
        </h1>
        <p className='mt-1 text-base text-[#65779b] sm:text-lg'>
          Acceso seguro para personal hospitalario
        </p>
      </header>

      <div className='mt-7 space-y-5'>
        <div>
          <label className='mb-2 block font-semibold text-[#082767]' htmlFor='correo-dni'>
            Correo institucional o DNI
          </label>
          <div className='flex h-14 items-center rounded-xl border border-[#ccd6e5] bg-white px-4 transition focus-within:border-[#0aaeb5] focus-within:ring-3 focus-within:ring-[#0aaeb5]/10'>
            <svg
              aria-hidden='true'
              className='h-6 w-6 shrink-0 text-[#60769c]'
              fill='none'
              viewBox='0 0 24 24'
            >
              <path
                d='m3.75 6.75 7.22 5.35a1.75 1.75 0 0 0 2.06 0l7.22-5.35M5.5 19.25h13a2 2 0 0 0 2-2V6.75a2 2 0 0 0-2-2h-13a2 2 0 0 0-2 2v10.5a2 2 0 0 0 2 2Z'
                stroke='currentColor'
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth='1.8'
              />
            </svg>
            <input
              autoComplete='username'
              className='h-full min-w-0 flex-1 bg-transparent px-4 text-base text-[#16366f] outline-none placeholder:text-[#8496b5]'
              id='correo-dni'
              name='correoDni'
              onChange={(event) => setIdentificador(event.target.value)}
              placeholder='Ingresa tu correo institucional o DNI'
              required
              type='text'
              value={identificador}
            />
          </div>
        </div>

        <div>
          <label className='mb-2 block font-semibold text-[#082767]' htmlFor='contrasena'>
            Contraseña
          </label>
          <div className='flex h-14 items-center rounded-xl border border-[#ccd6e5] bg-white px-4 transition focus-within:border-[#0aaeb5] focus-within:ring-3 focus-within:ring-[#0aaeb5]/10'>
            <svg
              aria-hidden='true'
              className='h-6 w-6 shrink-0 text-[#60769c]'
              fill='none'
              viewBox='0 0 24 24'
            >
              <path
                d='M7.25 10V7.75a4.75 4.75 0 0 1 9.5 0V10m-9.5 0h9.5A2.25 2.25 0 0 1 19 12.25v6A2.25 2.25 0 0 1 16.75 20.5h-9.5A2.25 2.25 0 0 1 5 18.25v-6A2.25 2.25 0 0 1 7.25 10Zm4.75 4.25v2'
                stroke='currentColor'
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth='1.8'
              />
            </svg>
            <input
              autoComplete='current-password'
              className='h-full min-w-0 flex-1 bg-transparent px-4 text-base text-[#16366f] outline-none placeholder:text-[#8496b5]'
              id='contrasena'
              name='contrasena'
              onChange={(event) => setContrasena(event.target.value)}
              placeholder='Ingresa tu contraseña'
              required
              type={mostrarContrasena ? 'text' : 'password'}
              value={contrasena}
            />
            <button
              aria-label={mostrarContrasena ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              className='grid h-10 w-10 shrink-0 cursor-pointer place-items-center rounded-lg text-[#60769c] transition hover:bg-[#eef8fa] hover:text-[#08aeb5] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#08aeb5]'
              onClick={() => setMostrarContrasena((visible) => !visible)}
              type='button'
            >
              {mostrarContrasena ? (
                <svg aria-hidden='true' className='h-6 w-6' fill='none' viewBox='0 0 24 24'>
                  <path
                    d='m4 4 16 16M10.65 10.8a2 2 0 0 0 2.55 2.55M9.5 5.42A10.8 10.8 0 0 1 12 5.13c5.25 0 8.5 4.87 8.5 4.87a13 13 0 0 1-2.04 2.51M6.11 6.1C4.42 7.18 3.5 8.5 3.5 8.5S6.75 13.37 12 13.37c.79 0 1.53-.11 2.22-.3'
                    stroke='currentColor'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth='1.8'
                  />
                </svg>
              ) : (
                <svg aria-hidden='true' className='h-6 w-6' fill='none' viewBox='0 0 24 24'>
                  <path
                    d='M3.5 12S6.75 7.13 12 7.13 20.5 12 20.5 12 17.25 16.87 12 16.87 3.5 12 3.5 12Z'
                    stroke='currentColor'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth='1.8'
                  />
                  <circle cx='12' cy='12' r='2.25' stroke='currentColor' strokeWidth='1.8' />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className='mt-5 flex flex-wrap items-center justify-between gap-3 text-sm sm:text-base'>
        <label className='flex cursor-pointer items-center gap-2.5 font-medium text-[#5b7095]'>
          <input
            checked={recordarme}
            className='h-5 w-5 cursor-pointer rounded accent-[#08adb5]'
            name='recordarme'
            onChange={(event) => setRecordarme(event.target.checked)}
            type='checkbox'
          />
          Recordarme
        </label>
        <button
          className='cursor-pointer font-medium text-[#00aeb6] transition hover:text-[#008e99] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#08aeb5]'
          onClick={onRecuperarCuenta}
          type='button'
        >
          ¿Olvidaste tu contraseña?
        </button>
      </div>

      {error && (
        <p aria-live='polite' className='mt-3 text-sm font-semibold text-[#d6424d]' role='alert'>
          {error}
        </p>
      )}

      <button
        className='mt-8 flex h-14 w-full cursor-pointer items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-[#0db8bc] to-[#08aab4] text-lg font-semibold text-white shadow-[0_8px_20px_rgba(5,171,181,0.20)] transition hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(5,171,181,0.28)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#08aeb5] active:translate-y-0 disabled:cursor-wait disabled:opacity-70 disabled:hover:translate-y-0'
        disabled={cargando}
        type='submit'
      >
        <svg aria-hidden='true' className='h-6 w-6' fill='none' viewBox='0 0 24 24'>
          <path
            d='M10 17h-4.25A2.75 2.75 0 0 1 3 14.25v-4.5A2.75 2.75 0 0 1 5.75 7H10m4-3h4.25A2.75 2.75 0 0 1 21 6.75v10.5A2.75 2.75 0 0 1 18.25 20H14m-3-4 4-4-4-4m4 4H6'
            stroke='currentColor'
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth='1.9'
          />
        </svg>
        {cargando ? 'Ingresando…' : 'Iniciar sesión'}
      </button>

      <div className='my-8 flex items-center gap-5 text-sm font-medium text-[#637597] sm:text-base'>
        <span className='h-px flex-1 bg-[#d3deeb]' />
        <span>Acceso para roles</span>
        <span className='h-px flex-1 bg-[#d3deeb]' />
      </div>

      <div className='grid gap-4 min-[560px]:grid-cols-2'>
        <button
          className='flex h-14 cursor-pointer items-center justify-center gap-3 rounded-xl border border-[#d1dbe8] bg-white px-4 font-semibold text-[#123377] shadow-sm transition hover:border-[#0aaeb5] hover:bg-[#f5fcfc] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#08aeb5]'
          type='button'
        >
          <svg aria-hidden='true' className='h-7 w-7 text-[#09aeb7]' fill='none' viewBox='0 0 24 24'>
            <path
              d='M8 3.75v5a4 4 0 0 0 8 0v-5M8 4H6.5M16 4h1.5M12 12.75v2.5a4.25 4.25 0 0 0 8.5 0v-.5M20.5 14.75a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z'
              stroke='currentColor'
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth='1.8'
            />
          </svg>
          Médico
        </button>
        <button
          className='flex h-14 cursor-pointer items-center justify-center gap-3 rounded-xl border border-[#d1dbe8] bg-white px-4 font-semibold text-[#123377] shadow-sm transition hover:border-[#0aaeb5] hover:bg-[#f5fcfc] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#08aeb5]'
          type='button'
        >
          <svg aria-hidden='true' className='h-7 w-7 text-[#1b68d0]' fill='none' viewBox='0 0 24 24'>
            <path
              d='M12 3.25 19 6v5.25c0 4.54-2.93 7.82-7 9.5-4.07-1.68-7-4.96-7-9.5V6l7-2.75Z'
              stroke='currentColor'
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth='1.8'
            />
            <path
              d='m9.5 12 1.65 1.65L14.75 10'
              stroke='currentColor'
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth='1.8'
            />
          </svg>
          Administrador general
        </button>
      </div>
    </form>
  )
}

export default FormInicioComp
