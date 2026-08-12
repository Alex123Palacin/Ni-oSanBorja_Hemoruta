import { NavLink } from 'react-router-dom'

import fondoNino from '../assets/FondoNiño4.png'
import logoHemoRuta from '../assets/iconoHemoRutaNoBg.png'
import IconoMedico from './IconoMedico'

const enlaces = [
  { icono: 'home' as const, ruta: '/admin/inicio', texto: 'Inicio' },
  { icono: 'users' as const, ruta: '/admin/UsuariosHospitalarios', texto: 'Usuarios hospitalarios' },
  { icono: 'plusCircle' as const, ruta: '/admin/CrearUs', texto: 'Nuevo usuario' },
]

function MenuAdmin() {
  return (
    <aside className='sticky top-0 hidden h-dvh w-[clamp(210px,18vw,250px)] shrink-0 flex-col overflow-y-auto border-r border-[#dce5ee] bg-white px-4 pb-5 pt-5 lg:flex'>
      <img alt='HemoRuta Pediátrica' className='h-auto w-[165px] object-contain' src={logoHemoRuta} />

      <div className='mt-4 flex items-center gap-3 border-b border-[#dce5ee] pb-4'>
        <span className='grid h-10 w-10 place-items-center rounded-xl bg-[#e8f8f8] text-[#0aaeb5]'>
          <IconoMedico className='h-6 w-6' nombre='building' />
        </span>
        <p className='text-[12px] font-extrabold leading-4 text-[#0b2b69]'>
          Hospital del Niño
          <br />
          San Borja
        </p>
      </div>

      <nav aria-label='Menú administrativo' className='mt-4 space-y-1'>
        {enlaces.map((enlace) => (
          <NavLink
            className={({ isActive }) =>
              `relative flex min-h-11 items-center gap-3 rounded-xl px-3 text-[11px] font-bold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#08aabb] ${
                isActive
                  ? 'bg-[#e9f8f8] text-[#029ca5] before:absolute before:bottom-0 before:left-0 before:top-0 before:w-1 before:rounded-r-full before:bg-[#06afb5]'
                  : 'text-[#60718e] hover:bg-[#f4fafb] hover:text-[#0a8f9b]'
              }`
            }
            key={enlace.ruta}
            to={enlace.ruta}
          >
            <IconoMedico className='h-5 w-5 shrink-0' nombre={enlace.icono} />
            {enlace.texto}
          </NavLink>
        ))}
      </nav>

      <div className='relative mt-auto min-h-[220px] overflow-hidden'>
        <img
          alt=''
          aria-hidden='true'
          className='absolute left-1/2 top-0 h-[235px] w-[215px] -translate-x-1/2 object-cover object-[50%_57%]'
          src={fondoNino}
        />
      </div>

      <div className='rounded-2xl border border-[#dce9ef] bg-[#f7fbfd] p-4 text-center text-[9px] leading-[15px] text-[#50698e]'>
        <IconoMedico className='mx-auto mb-2 h-7 w-7 text-[#08a4b3]' nombre='shield' />
        El administrador visualiza datos administrativos y demográficos, sin información clínica.
      </div>
    </aside>
  )
}

export default MenuAdmin
