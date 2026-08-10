import { Link, useLocation } from 'react-router-dom'

import fondoNino from '../assets/FondoNiño4.png'
import logoHemoRuta from '../assets/iconoHemoRutaNoBg.png'
import IconoMedico, { type NombreIconoMedico } from './IconoMedico'

interface ItemMenu {
  activo: boolean
  contador?: number
  icono: NombreIconoMedico
  ruta: string
  texto: string
}

interface MenuMedicoCompProps {
  contadorSeguimiento?: number
  variante?: 'amplia' | 'normal' | 'seguimiento'
}

function MenuMedicoComp({ contadorSeguimiento, variante = 'normal' }: MenuMedicoCompProps) {
  const { pathname } = useLocation()
  const pacientesActivo = [
    '/doctor/pacientes',
    '/doctor/nuevoRegistro',
    '/doctor/ficha',
    '/doctor/consulta',
    '/doctor/historial',
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
      contador: contadorSeguimiento,
      icono: 'whatsapp',
      ruta: '/doctor/seguimiento',
      texto: 'Seguimiento',
    },
  ]

  return (
    <aside
      className={`sticky top-0 hidden h-screen flex-col overflow-y-auto border-r border-[#dbe5ee] bg-white pb-4 pt-4 lg:flex ${
        variante === 'amplia'
          ? 'w-[clamp(190px,17.9vw,236px)] min-w-[clamp(190px,17.9vw,236px)] px-[clamp(12px,1.2vw,16px)]'
          : variante === 'seguimiento'
            ? 'w-[clamp(196px,15.7vw,212px)] min-w-[clamp(196px,15.7vw,212px)] px-[clamp(12px,1.05vw,14px)]'
          : 'w-[190px] min-w-[190px] px-3'
      }`}
    >
      <div>
        <img
          alt='HemoRuta Pediátrica'
          className={`h-auto object-contain ${variante === 'seguimiento' ? 'w-[150px]' : 'w-[142px]'}`}
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
              <span>
                {item.texto}
                {item.contador !== undefined && ` ${item.contador}`}
              </span>
            </Link>
          ))}
        </nav>
      </div>

      <div className='mt-auto pt-5'>
        <div className={`flex items-end justify-center overflow-hidden ${variante === 'seguimiento' ? 'h-[184px]' : 'h-[174px]'}`}>
          <img
            alt='Niño de HemoRuta saludando'
            className={`object-cover ${variante === 'seguimiento' ? 'h-[184px] w-[184px]' : 'h-[174px] w-[174px]'}`}
            draggable={false}
            src={fondoNino}
          />
        </div>

        <div className='mt-2 flex gap-2 rounded-xl border border-[#dce8ef] bg-[#fbfeff] p-3'>
          <IconoMedico className='h-7 w-7 shrink-0 text-[#08aec0]' nombre='shield' strokeWidth={1.8} />
          <p className='text-center text-[9px] font-medium leading-[15px] text-[#2d468a]'>
            Este rol médico puede{' '}
            <strong className='text-[#079eae]'>visualizar y gestionar</strong> la información de los pacientes a
            su cargo.
          </p>
        </div>
      </div>
    </aside>
  )
}

export default MenuMedicoComp
