import { Link } from 'react-router-dom'
import IconoMedico, { type NombreIconoMedico } from './IconoMedico'

export interface ItemMenuActivacionCuenta {
  activo: boolean
  icono: NombreIconoMedico
  id: string
  ruta: string
  texto: string
}

export interface IdentidadActivacionCuenta {
  hospital: string
  imagenPaciente: string
  imagenPacienteAlt: string
  lemaHospital: string
  logo: string
  logoAlt: string
  sedeHospital: string
}

interface MenuActivacionCuentaCompProps {
  identidad: IdentidadActivacionCuenta
  items: readonly ItemMenuActivacionCuenta[]
}

function OpcionMenuActivacion({ item, compacta = false }: { compacta?: boolean; item: ItemMenuActivacionCuenta }) {
  return (
    <Link
      aria-current={item.activo ? 'page' : undefined}
      className={`relative flex items-center transition focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-[#08aabb] ${
        compacta
          ? `min-w-0 flex-col justify-center gap-0.5 px-1 py-1 text-[8px] font-bold ${
              item.activo ? 'text-[#009dab]' : 'text-[#536a8e]'
            }`
          : `h-10 gap-3 rounded-lg px-3 text-[11px] font-bold ${
              item.activo
                ? 'bg-[#eaf8fa] text-[#069fad]'
                : 'text-[#24458c] hover:bg-[#f3fafb] hover:text-[#069fad]'
            }`
      }`}
      to={item.ruta}
    >
      {item.activo && !compacta && (
        <span aria-hidden='true' className='absolute bottom-1 left-0 top-1 w-1 rounded-r-full bg-[#08aec0]' />
      )}
      {item.activo && compacta && (
        <span aria-hidden='true' className='absolute left-1/2 top-0 h-[3px] w-9 -translate-x-1/2 rounded-b-full bg-[#08aec0]' />
      )}
      <IconoMedico className={compacta ? 'h-5 w-5' : 'h-5 w-5 shrink-0'} nombre={item.icono} strokeWidth={1.85} />
      <span className='max-w-full truncate'>{item.texto}</span>
    </Link>
  )
}

function MenuActivacionCuentaComp({ identidad, items }: MenuActivacionCuentaCompProps) {
  return (
    <>
      <aside className='sticky top-0 hidden h-dvh w-[clamp(142px,17.5vw,190px)] min-w-[clamp(142px,17.5vw,190px)] flex-col overflow-y-auto border-r border-[#dce6ee] bg-white px-3 pb-0 pt-3 md:flex'>
        <div>
          <img
            alt={identidad.logoAlt}
            className='h-auto w-full max-w-[138px] object-contain'
            draggable={false}
            src={identidad.logo}
          />
          <p className='mt-1 text-[9px] font-medium leading-3 text-[#596f91]'>
            {identidad.hospital} {identidad.sedeHospital}
          </p>

          <nav aria-label='Navegación de activación de cuenta' className='mt-4 space-y-1'>
            {items.map((item) => (
              <OpcionMenuActivacion item={item} key={item.id} />
            ))}
          </nav>
        </div>

        <div className='mt-auto pt-4'>
          <div className='flex items-center gap-2 px-1'>
            <span className='grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[#e9f8fa] text-[#09a9b7]'>
              <IconoMedico className='h-6 w-6' nombre='building' strokeWidth={1.8} />
            </span>
            <p className='min-w-0 text-[9px] font-extrabold leading-3 text-[#0b2d78]'>
              {identidad.hospital}
              <br />
              {identidad.sedeHospital}
              <small className='mt-0.5 block truncate text-[5.5px] font-medium text-[#657895]'>
                {identidad.lemaHospital}
              </small>
            </p>
          </div>

          <div className='mt-2 flex h-[clamp(128px,25vh,190px)] items-start justify-center overflow-hidden bg-white'>
            <img
              alt={identidad.imagenPacienteAlt}
              className='h-auto w-[min(100%,175px)] max-w-none object-cover object-top'
              draggable={false}
              src={identidad.imagenPaciente}
            />
          </div>
        </div>
      </aside>

      <nav
        aria-label='Navegación móvil de activación de cuenta'
        className='fixed inset-x-0 bottom-0 z-50 grid h-16 grid-cols-3 border-t border-[#dce6ee] bg-white/95 shadow-[0_-4px_16px_rgba(15,46,85,0.08)] backdrop-blur md:hidden'
      >
        {items.map((item) => (
          <OpcionMenuActivacion compacta item={item} key={item.id} />
        ))}
      </nav>
    </>
  )
}

export default MenuActivacionCuentaComp
