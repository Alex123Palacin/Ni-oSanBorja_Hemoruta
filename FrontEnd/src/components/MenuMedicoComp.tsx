import { Link, useLocation } from 'react-router-dom'

import fondoNino from '../assets/FondoNiño4.png'
import logoHemoRuta from '../assets/iconoHemoRutaNoBg.png'
import CerrarSesionComp from './CerrarSesionComp'
import IconoMedico, { type NombreIconoMedico } from './IconoMedico'

interface ItemMenu {
  activo: boolean
  icono: NombreIconoMedico
  ruta: string
  texto: string
}

function MenuMedicoComp() {
  const { pathname } = useLocation()
  const pacientesActivo = [
    '/doctor/pacientes',
    '/doctor/ficha',
    '/doctor/consulta',
    '/doctor/historial',
    '/doctor/activacion',
  ].some((ruta) => pathname.startsWith(ruta))
  const seguimientoActivo = ['/doctor/seguimiento', '/doctor/visualizar'].some((ruta) =>
    pathname.startsWith(ruta),
  )

  const items: ItemMenu[] = [
    {
      activo: pathname === '/doctor/inicio' || pathname === '/doctor/dashboard',
      icono: 'home',
      ruta: '/doctor/inicio',
      texto: 'Inicio',
    },
    {
      activo: pacientesActivo,
      icono: 'users',
      ruta: '/doctor/pacientes',
      texto: 'Pacientes',
    },
    {
      activo: seguimientoActivo,
      icono: 'whatsapp',
      ruta: '/doctor/seguimiento',
      texto: 'Seguimiento',
    },
  ]

  return (
    <aside
      aria-label='Menú del médico'
      className='sticky top-0 hidden h-screen w-[clamp(210px,17.9vw,236px)] min-w-[clamp(210px,17.9vw,236px)] flex-col overflow-y-auto border-r border-[#dbe5ee] bg-white px-[clamp(13px,1.2vw,16px)] pb-4 pt-4 lg:flex'
    >
      <div>
        <img
          alt='HemoRuta Pediátrica'
          className='h-auto w-[158px] object-contain'
          draggable={false}
          src={logoHemoRuta}
        />

        <div className='mt-3 flex items-center gap-2 border-b border-[#e2eaf1] pb-4'>
          <span className='grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[#e8f8fb] text-[#09adbb]'>
            <IconoMedico className='h-6 w-6' nombre='building' strokeWidth={1.9} />
          </span>
          <p className='text-[12px] font-extrabold leading-4 text-[#092b79]'>
            Hospital del Niño
            <br />
            San Borja
          </p>
        </div>

        <nav aria-label='Menú del médico' className='mt-2 space-y-1'>
          {items.map((item) => (
            <Link
              aria-current={item.activo ? 'page' : undefined}
              className={`group relative flex h-10 items-center gap-3 rounded-lg px-3 text-[11px] font-bold transition ${
                item.activo
                  ? 'bg-[#e8f7fa] text-[#079caf]'
                  : 'text-[#234391] hover:bg-[#f3fafb] hover:text-[#079caf]'
              }`}
              key={item.texto}
              to={item.ruta}
            >
              {item.activo && (
                <span
                  aria-hidden='true'
                  className='absolute bottom-1 left-0 top-1 w-1 rounded-r-full bg-[#08aec0]'
                />
              )}
              <IconoMedico className='h-5 w-5 shrink-0' nombre={item.icono} strokeWidth={1.9} />
              <span>{item.texto}</span>
            </Link>
          ))}
        </nav>
      </div>

      <div className='mt-auto pt-5'>
        <div className='flex h-[184px] items-end justify-center overflow-hidden'>
          <img
            alt='Niño de HemoRuta saludando'
            className='h-[184px] w-[184px] object-cover'
            draggable={false}
            src={fondoNino}
          />
        </div>

        <div className='mt-2 flex gap-2 rounded-xl border border-[#dce8ef] bg-[#fbfeff] p-3'>
          <IconoMedico className='h-7 w-7 shrink-0 text-[#08aec0]' nombre='shield' strokeWidth={1.8} />
          <p className='text-center text-[9px] font-medium leading-[15px] text-[#2d468a]'>
            El personal médico puede{' '}
            <strong className='text-[#079eae]'>visualizar y gestionar</strong> la información compartida de los
            pacientes del hospital.
          </p>
        </div>
        <CerrarSesionComp rutaIngreso='/login' variante='menuMedico' />
      </div>
    </aside>
  )
}

export default MenuMedicoComp
