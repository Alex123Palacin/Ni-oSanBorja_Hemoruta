import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { obtenerMensajeErrorApi } from '../api/compartido/ClienteApi'
import type { RolUsuarioApi } from '../api/compartido/TiposApi'
import iconoHemoRuta from '../assets/iconoHemoRutaNoBg.png'
import useAuth from '../auth/useAuth'
import FormInicioComp, { type CredencialesPersonal } from '../components/FormInicioComp'

const RUTA_INICIAL: Record<Extract<RolUsuarioApi, 'ADMINISTRADOR' | 'MEDICO'>, string> = {
  ADMINISTRADOR: '/admin/inicio',
  MEDICO: '/doctor/inicio',
}

function LoginAdminPage() {
  const classNameTitle = 'text-3xl max-[1375px]:text-[40px] text-[50px] '
  const classNameDescription = 'max-[1375px]:text-3xl text-[25px]'
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { iniciarSesionPersonal } = useAuth()
  const ubicacion = useLocation()
  const navegar = useNavigate()

  async function iniciarSesion(credenciales: CredencialesPersonal) {
    setCargando(true)
    setError(null)

    try {
      const usuario = await iniciarSesionPersonal(credenciales)

      if (usuario.rol === 'PACIENTE') {
        setError('Esta cuenta debe ingresar desde el acceso para pacientes.')
        return
      }

      const origen = (ubicacion.state as { from?: { pathname?: string } } | null)?.from?.pathname
      const prefijoPermitido = usuario.rol === 'ADMINISTRADOR' ? '/admin/' : '/doctor/'
      navegar(origen?.startsWith(prefijoPermitido) ? origen : RUTA_INICIAL[usuario.rol], { replace: true })
    } catch (errorSesion) {
      setError(obtenerMensajeErrorApi(errorSesion))
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#F7F8FA]">
      <div className="max-[830px]:hidden w-[55%] bg-[url('assets/FondoNiño1.png')] bg-cover  min-h-screen bg-no-repeat bg-center pl-20 pt-10 min-[1250px]:pl-50 min-[1250px]:pt-20 flex flex-col gap-12 ">
        <div className="text-lg text-[#082767] font-normal sm:text-[27px] max-w-[350px]">
          <img src={iconoHemoRuta} alt="HemoRuta" />
          <p>Hospital del Niño San Borja</p>
        </div>
        <header className="flex  flex-col gap-8 max-w-[590px]">
          <h1
            className={
              "font-bold tracking-tight text-[#082767] " + classNameTitle
            }
          >
            Bienvenido al sistema <br /> de gestión hematológica
          </h1>
          <p className={"text-[#082767] font-normal " + classNameDescription}>
            Acompañamos cada paso del cuidado hematológico pediátrico con
            tecnología, seguridad y empatía.
          </p>
        </header>
      </div>
      <div className="flex-1 flex overflow-hidden h-screen items-center justify-center">
        <div className="flex-1 max-w-full scale-x-125 scale-y-150 max-[1600px]:scale-100">
          <FormInicioComp
            cargando={cargando}
            error={error}
            onIniciarSesion={iniciarSesion}
            onRecuperarCuenta={() => navegar('/recuperacion')}
          />
        </div>
      </div>
      
    </div>
  )
}

export default LoginAdminPage
