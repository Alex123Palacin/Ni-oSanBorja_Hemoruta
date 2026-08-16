import { NavLink, useLocation } from 'react-router-dom'

import fondoNino from '../assets/FondoNiño4.png'
import logoHemoRuta from '../assets/iconoHemoRutaNoBg.png'

const enlaces = [
  {
    icono: 'M4 10 12 4l8 6v9a1 1 0 0 1-1 1h-5v-6h-4v6H5a1 1 0 0 1-1-1v-9Z',
    ruta: '/admin/inicio',
    texto: 'Inicio',
  },
  {
    icono:
      'M8.5 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM15.8 10a2.5 2.5 0 1 0 0-5M3.5 19v-1.2c0-3 2.1-4.8 5-4.8s5 1.8 5 4.8V19h-10ZM14 13.6c3.6-.6 6.5.9 6.5 4.2V19h-4',
    ruta: '/admin/UsuariosHospitalarios',
    texto: 'Usuarios hospitalarios',
  },
  {
    icono: 'M6 3v3m12-3v3M4 9h16M5 5h14a1 1 0 0 1 1 1v14H4V6a1 1 0 0 1 1-1Zm3 8h3m2 0h3m-8 4h3m2 0h3',
    ruta: '/admin/clinica-dia',
    texto: 'Clínica de Día',
  },
]

function MenuAdmin() {
  const { pathname } = useLocation()

  function esRutaActiva(ruta: string, activaDelEnlace: boolean) {
    if (activaDelEnlace) return true
    if (ruta !== '/admin/UsuariosHospitalarios') return false
    return ['/admin/CrearUs', '/admin/confirmacion', '/admin/detalleUs'].some((prefijo) =>
      pathname.startsWith(prefijo),
    )
  }

  return (
    <aside className='sticky top-0 hidden h-dvh w-[250px] shrink-0 flex-col overflow-y-auto border-r border-[#dce5ee] bg-white lg:flex'>
      <div className='px-6 pb-4 pt-6'>
        <img alt='HemoRuta Pediátrica' className='w-[165px] object-contain' src={logoHemoRuta} />

        <div className='mt-5 flex items-center gap-3'>
          <div className='grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-[#e8f8f8] text-[#0aaeb5]'>
            <svg aria-hidden='true' className='h-7 w-7' fill='none' viewBox='0 0 24 24'>
              <path
                d='M5 21V7.5h14V21M8 7.5V4h8v3.5M8.5 11h2M13.5 11h2M8.5 14.5h2M13.5 14.5h2M10 21v-3.5h4V21'
                stroke='currentColor'
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth='1.7'
              />
            </svg>
          </div>
          <div className='text-[14px] font-bold leading-[1.45] text-[#0b2b69]'>
            <p>Hospital del Niño</p>
            <p>San Borja</p>
          </div>
        </div>
      </div>

      <div className='mx-5 h-px bg-[#dce5ee]' />

      <nav aria-label='Menú administrativo' className='mt-3 px-3'>
        {enlaces.map((enlace) => (
          <NavLink
            className={({ isActive }) => {
              const activa = esRutaActiva(enlace.ruta, isActive)
              return `relative mt-1 flex h-12 w-full items-center gap-4 rounded-xl px-4 text-left text-sm transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#08aabb] ${
                activa
                  ? 'bg-[#e9f8f8] font-semibold text-[#029ca5] before:absolute before:bottom-0 before:left-0 before:top-0 before:w-[4px] before:rounded-r-full before:bg-[#06afb5]'
                  : 'font-medium text-[#5d6f91] hover:bg-[#f4fafb]'
              }`
            }}
            key={enlace.ruta}
            to={enlace.ruta}
          >
            <svg aria-hidden='true' className='h-5 w-5 shrink-0' fill='none' viewBox='0 0 24 24'>
              <path
                d={enlace.icono}
                stroke='currentColor'
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth='1.7'
              />
            </svg>
            {enlace.texto}
          </NavLink>
        ))}
      </nav>

      <div className='relative mt-2 min-h-[240px] flex-1 overflow-hidden'>
        <img
          alt=''
          aria-hidden='true'
          className='absolute left-1/2 top-1 h-[240px] w-[220px] -translate-x-1/2 object-cover object-[50%_57%]'
          src={fondoNino}
        />
      </div>

      <div className='mx-4 mb-5 flex gap-3 rounded-2xl border border-[#cfe9eb] bg-gradient-to-br from-[#f4fcfc] to-[#eff8fa] p-4'>
        <div className='grid h-10 w-10 shrink-0 place-items-center text-[#08aeb5]'>
          <svg aria-hidden='true' className='h-9 w-9' fill='none' viewBox='0 0 24 24'>
            <path
              d='M12 3.5 19 6v5.5c0 4.4-2.75 7.55-7 9-4.25-1.45-7-4.6-7-9V6l7-2.5Z'
              stroke='currentColor'
              strokeLinejoin='round'
              strokeWidth='1.7'
            />
            <path
              d='M9.5 11.8 11.3 13.6 14.8 10'
              stroke='currentColor'
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth='1.7'
            />
          </svg>
        </div>
        <p className='text-[11px] leading-[1.55] text-[#30486e]'>
          El administrador gestiona cuentas y programación operativa, sin acceso a la historia clínica completa.
        </p>
      </div>
    </aside>
  )
}

export default MenuAdmin
