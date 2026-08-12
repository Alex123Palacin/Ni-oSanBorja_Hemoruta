import { Outlet } from 'react-router-dom'

import CerrarSesionComp from '../CerrarSesionComp'

function DoctorSessionLayoutComp() {
  return (
    <>
      <Outlet />
      <div className='lg:hidden'>
        <CerrarSesionComp rutaIngreso='/login' variante='flotanteDoctor' />
      </div>
    </>
  )
}

export default DoctorSessionLayoutComp
