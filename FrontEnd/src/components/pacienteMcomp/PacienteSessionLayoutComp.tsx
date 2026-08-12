import { Outlet, useLocation } from 'react-router-dom'

import useAuth from '../../auth/useAuth'
import CerrarSesionComp from '../CerrarSesionComp'
import AsistentePacienteComp from './AsistentePacienteComp'

function PacienteSessionLayoutComp() {
  const { usuario } = useAuth()
  const location = useLocation()
  const rutasProtegidas = new Set([
    '/paciente/inicio',
    '/paciente/medicamento',
    '/paciente/sintomas',
    '/paciente/tratamiento',
    '/paciente/documentos',
  ])
  const mostrarHerramientasPaciente =
    usuario?.rol === 'PACIENTE' && rutasProtegidas.has(location.pathname)

  return (
    <>
      <Outlet />
      {mostrarHerramientasPaciente && (
        <>
          <CerrarSesionComp rutaIngreso='/paciente/login' variante='flotantePaciente' />
          <AsistentePacienteComp />
        </>
      )}
    </>
  )
}

export default PacienteSessionLayoutComp
