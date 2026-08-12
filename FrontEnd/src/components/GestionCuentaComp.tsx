import { useEffect, useRef, useState, type FormEvent } from 'react'

import {
  actualizarPerfilCuentaApi,
  cambiarContrasenaCuentaApi,
  obtenerPerfilCuentaApi,
  quitarFotoPerfilApi,
  type PerfilCuentaApi,
} from '../api/compartido/PerfilCuentaApi'
import { obtenerMensajeErrorApi } from '../api/compartido/ClienteApi'
import useAuth from '../auth/useAuth'
import AvatarUsuarioComp from './AvatarUsuarioComp'
import IconoMedico from './IconoMedico'

interface GestionCuentaCompProps {
  variante?: 'compacta' | 'completa'
}

const ROTULOS_ROL = {
  ADMINISTRADOR: 'Administrador hospitalario',
  MEDICO: 'Personal médico',
  PACIENTE: 'Cuenta del paciente',
} as const

function CampoCuenta({
  autoComplete,
  etiqueta,
  onChange,
  placeholder,
  tipo = 'text',
  valor,
}: {
  autoComplete?: string
  etiqueta: string
  onChange: (valor: string) => void
  placeholder?: string
  tipo?: string
  valor: string
}) {
  return (
    <label className='block'>
      <span className='mb-1.5 block text-[11px] font-extrabold text-[#173875]'>{etiqueta}</span>
      <input
        autoComplete={autoComplete}
        className='h-11 w-full rounded-xl border border-[#d7e2ec] bg-white px-3.5 text-[12px] font-medium text-[#173875] outline-none transition placeholder:text-[#9aa9bd] focus:border-[#08aab3] focus:ring-2 focus:ring-[#08aab3]/10'
        onChange={(evento) => onChange(evento.target.value)}
        placeholder={placeholder}
        type={tipo}
        value={valor}
      />
    </label>
  )
}

function PanelGestionCuenta({ onCerrar }: { onCerrar?: () => void }) {
  const { refrescarSesion, usuario } = useAuth()
  const archivoRef = useRef<HTMLInputElement>(null)
  const [perfil, setPerfil] = useState<PerfilCuentaApi | null>(null)
  const [nombre, setNombre] = useState(usuario?.nombre ?? '')
  const [apellidos, setApellidos] = useState(usuario?.apellidos ?? '')
  const [telefono, setTelefono] = useState('')
  const [foto, setFoto] = useState<File>()
  const [vistaPrevia, setVistaPrevia] = useState<string>()
  const [contrasenaActual, setContrasenaActual] = useState('')
  const [nuevaContrasena, setNuevaContrasena] = useState('')
  const [confirmarContrasena, setConfirmarContrasena] = useState('')
  const [guardandoPerfil, setGuardandoPerfil] = useState(false)
  const [guardandoContrasena, setGuardandoContrasena] = useState(false)
  const [mensajePerfil, setMensajePerfil] = useState('')
  const [mensajeContrasena, setMensajeContrasena] = useState('')
  const [errorPerfil, setErrorPerfil] = useState('')
  const [errorContrasena, setErrorContrasena] = useState('')

  useEffect(() => {
    let activo = true
    void obtenerPerfilCuentaApi()
      .then((datos) => {
        if (!activo) return
        setPerfil(datos)
        setNombre(datos.nombre)
        setApellidos(datos.apellidos)
        setTelefono(datos.telefono)
      })
      .catch((error: unknown) => {
        if (activo) setErrorPerfil(obtenerMensajeErrorApi(error))
      })
    return () => {
      activo = false
    }
  }, [])

  useEffect(() => {
    if (!foto) {
      setVistaPrevia(undefined)
      return
    }
    const url = URL.createObjectURL(foto)
    setVistaPrevia(url)
    return () => URL.revokeObjectURL(url)
  }, [foto])

  async function guardarPerfil(evento: FormEvent) {
    evento.preventDefault()
    setErrorPerfil('')
    setMensajePerfil('')
    setGuardandoPerfil(true)
    try {
      const actualizado = await actualizarPerfilCuentaApi({ apellidos, foto, nombre, telefono })
      setPerfil(actualizado)
      setFoto(undefined)
      await refrescarSesion()
      setMensajePerfil('Tus datos se actualizaron correctamente.')
    } catch (error) {
      setErrorPerfil(obtenerMensajeErrorApi(error))
    } finally {
      setGuardandoPerfil(false)
    }
  }

  async function quitarFoto() {
    setErrorPerfil('')
    setMensajePerfil('')
    setGuardandoPerfil(true)
    try {
      const actualizado = await quitarFotoPerfilApi()
      setPerfil(actualizado)
      setFoto(undefined)
      await refrescarSesion()
      setMensajePerfil('La foto de perfil fue retirada.')
    } catch (error) {
      setErrorPerfil(obtenerMensajeErrorApi(error))
    } finally {
      setGuardandoPerfil(false)
    }
  }

  async function cambiarContrasena(evento: FormEvent) {
    evento.preventDefault()
    setErrorContrasena('')
    setMensajeContrasena('')
    if (nuevaContrasena !== confirmarContrasena) {
      setErrorContrasena('Las contraseñas nuevas no coinciden.')
      return
    }
    setGuardandoContrasena(true)
    try {
      const respuesta = await cambiarContrasenaCuentaApi({
        confirmarContrasena,
        contrasenaActual,
        nuevaContrasena,
      })
      setContrasenaActual('')
      setNuevaContrasena('')
      setConfirmarContrasena('')
      setMensajeContrasena(respuesta.detalle)
    } catch (error) {
      setErrorContrasena(obtenerMensajeErrorApi(error))
    } finally {
      setGuardandoContrasena(false)
    }
  }

  const fotoMostrada = vistaPrevia ?? perfil?.fotoPerfil ?? usuario?.fotoPerfil
  const nombreMostrado = perfil?.nombreCompleto || usuario?.nombreCompleto || usuario?.nombre || ''

  return (
    <section className='overflow-hidden rounded-[22px] border border-[#dbe6ee] bg-white shadow-[0_18px_50px_rgba(17,54,91,0.09)]'>
      <div className='relative overflow-hidden border-b border-[#dce8ee] bg-gradient-to-r from-[#ecfbfb] via-white to-[#eef5ff] px-5 py-5 sm:px-7'>
        <span aria-hidden='true' className='absolute -right-8 -top-12 h-36 w-36 rounded-full bg-[#09b1b8]/10' />
        <div className='relative flex items-center gap-4'>
          <div className='relative'>
            <AvatarUsuarioComp clase='h-20 w-20 text-xl' foto={fotoMostrada} nombre={nombreMostrado} />
            <button
              aria-label='Elegir foto de perfil'
              className='absolute -bottom-1 -right-1 grid h-8 w-8 cursor-pointer place-items-center rounded-full border-2 border-white bg-[#08a8b1] text-white shadow-md transition hover:bg-[#078e9b]'
              onClick={() => archivoRef.current?.click()}
              type='button'
            >
              <IconoMedico className='h-4 w-4' nombre='camera' />
            </button>
          </div>
          <div className='min-w-0'>
            <p className='text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#069aa5]'>Mi cuenta</p>
            <h2 className='mt-1 truncate text-[clamp(18px,2vw,24px)] font-black tracking-[-0.03em] text-[#08286f]'>
              {nombreMostrado || 'Perfil de usuario'}
            </h2>
            <p className='mt-0.5 text-[11px] font-semibold text-[#607493]'>
              {usuario ? ROTULOS_ROL[usuario.rol] : 'Perfil hospitalario'}
            </p>
          </div>
          {onCerrar && (
            <button
              aria-label='Cerrar mi cuenta'
              className='ml-auto grid h-9 w-9 cursor-pointer place-items-center rounded-full border border-[#d9e4ec] bg-white text-[#5b7192] transition hover:bg-[#f5fafb]'
              onClick={onCerrar}
              type='button'
            >
              <IconoMedico className='h-4 w-4' nombre='x' />
            </button>
          )}
        </div>
      </div>

      <div className='grid gap-6 p-5 sm:p-7 lg:grid-cols-2'>
        <form onSubmit={(evento) => void guardarPerfil(evento)}>
          <div className='mb-4 flex items-center gap-2'>
            <span className='grid h-9 w-9 place-items-center rounded-xl bg-[#e8f8f8] text-[#079da9]'>
              <IconoMedico className='h-5 w-5' nombre='user' />
            </span>
            <div>
              <h3 className='text-[14px] font-black text-[#0b2c72]'>Datos del perfil</h3>
              <p className='text-[9px] font-medium text-[#73849d]'>Actualiza tu nombre, teléfono o fotografía.</p>
            </div>
          </div>

          <input
            accept='image/jpeg,image/png,image/webp'
            className='hidden'
            onChange={(evento) => setFoto(evento.target.files?.[0])}
            ref={archivoRef}
            type='file'
          />
          <div className='grid gap-3 sm:grid-cols-2'>
            <CampoCuenta etiqueta='Nombres' onChange={setNombre} valor={nombre} />
            <CampoCuenta etiqueta='Apellidos' onChange={setApellidos} valor={apellidos} />
            <div className='sm:col-span-2'>
              <CampoCuenta autoComplete='tel' etiqueta='Teléfono' onChange={setTelefono} placeholder='Ej. 987 654 321' tipo='tel' valor={telefono} />
            </div>
          </div>
          <div className='mt-3 flex flex-wrap gap-2'>
            <button
              className='h-10 cursor-pointer rounded-xl bg-gradient-to-r from-[#08acb4] to-[#009ba6] px-5 text-[11px] font-extrabold text-white shadow-sm transition hover:brightness-105 disabled:cursor-wait disabled:opacity-60'
              disabled={guardandoPerfil}
              type='submit'
            >
              {guardandoPerfil ? 'Guardando…' : 'Guardar perfil'}
            </button>
            {(perfil?.fotoPerfil || foto) && (
              <button
                className='h-10 cursor-pointer rounded-xl border border-[#d6e1e9] bg-white px-4 text-[10px] font-bold text-[#617491] transition hover:bg-[#f7fafc] disabled:opacity-60'
                disabled={guardandoPerfil}
                onClick={() => void quitarFoto()}
                type='button'
              >
                Quitar foto
              </button>
            )}
          </div>
          {(mensajePerfil || errorPerfil) && (
            <p aria-live='polite' className={`mt-3 rounded-lg px-3 py-2 text-[10px] font-bold ${errorPerfil ? 'bg-[#fff0f1] text-[#c83a49]' : 'bg-[#eaf9f0] text-[#148347]'}`}>
              {errorPerfil || mensajePerfil}
            </p>
          )}
        </form>

        <form className='border-t border-[#e2e9ef] pt-6 lg:border-l lg:border-t-0 lg:pl-7 lg:pt-0' onSubmit={(evento) => void cambiarContrasena(evento)}>
          <div className='mb-4 flex items-center gap-2'>
            <span className='grid h-9 w-9 place-items-center rounded-xl bg-[#edf4ff] text-[#2475e8]'>
              <IconoMedico className='h-5 w-5' nombre='lock' />
            </span>
            <div>
              <h3 className='text-[14px] font-black text-[#0b2c72]'>Cambiar contraseña</h3>
              <p className='text-[9px] font-medium text-[#73849d]'>Usa una clave de al menos 8 caracteres.</p>
            </div>
          </div>
          <div className='space-y-3'>
            <CampoCuenta autoComplete='current-password' etiqueta='Contraseña actual' onChange={setContrasenaActual} tipo='password' valor={contrasenaActual} />
            <CampoCuenta autoComplete='new-password' etiqueta='Nueva contraseña' onChange={setNuevaContrasena} tipo='password' valor={nuevaContrasena} />
            <CampoCuenta autoComplete='new-password' etiqueta='Confirmar nueva contraseña' onChange={setConfirmarContrasena} tipo='password' valor={confirmarContrasena} />
          </div>
          <button
            className='mt-3 h-10 cursor-pointer rounded-xl border border-[#08a5af] bg-white px-5 text-[11px] font-extrabold text-[#078f9d] transition hover:bg-[#effafa] disabled:cursor-wait disabled:opacity-60'
            disabled={guardandoContrasena || !contrasenaActual || !nuevaContrasena || !confirmarContrasena}
            type='submit'
          >
            {guardandoContrasena ? 'Actualizando…' : 'Actualizar contraseña'}
          </button>
          {(mensajeContrasena || errorContrasena) && (
            <p aria-live='polite' className={`mt-3 rounded-lg px-3 py-2 text-[10px] font-bold ${errorContrasena ? 'bg-[#fff0f1] text-[#c83a49]' : 'bg-[#eaf9f0] text-[#148347]'}`}>
              {errorContrasena || mensajeContrasena}
            </p>
          )}
        </form>
      </div>
    </section>
  )
}

function GestionCuentaComp({ variante = 'completa' }: GestionCuentaCompProps) {
  const { usuario } = useAuth()
  const [abierto, setAbierto] = useState(false)

  if (variante === 'completa') return <PanelGestionCuenta />

  return (
    <>
      <button
        className='flex w-full cursor-pointer items-center gap-3 rounded-2xl border border-[#d9e8ee] bg-gradient-to-r from-white to-[#f0fbfb] p-3 text-left shadow-[0_5px_15px_rgba(19,64,92,0.06)] transition hover:border-[#9bdadd]'
        onClick={() => setAbierto(true)}
        type='button'
      >
        <AvatarUsuarioComp clase='h-11 w-11 text-[12px]' foto={usuario?.fotoPerfil} nombre={usuario?.nombreCompleto || usuario?.nombre} />
        <span className='min-w-0 flex-1'>
          <strong className='block truncate text-[11px] font-extrabold text-[#0a2a70]'>Mi cuenta y seguridad</strong>
          <span className='mt-0.5 block text-[8px] font-medium text-[#667b97]'>Foto, datos de contacto y contraseña</span>
        </span>
        <IconoMedico className='h-4 w-4 text-[#079faa]' nombre='chevronDown' />
      </button>

      {abierto && (
        <div
          aria-label='Configuración de mi cuenta'
          aria-modal='true'
          className='fixed inset-0 z-[180] grid place-items-center overflow-y-auto bg-[#08264d]/45 p-3 backdrop-blur-[2px]'
          role='dialog'
        >
          <div className='my-auto max-h-[calc(100dvh-24px)] w-full max-w-[500px] overflow-y-auto rounded-[22px] sm:w-[clamp(400px,30vw,500px)]'>
            <PanelGestionCuenta onCerrar={() => setAbierto(false)} />
          </div>
        </div>
      )}
    </>
  )
}

export default GestionCuentaComp
