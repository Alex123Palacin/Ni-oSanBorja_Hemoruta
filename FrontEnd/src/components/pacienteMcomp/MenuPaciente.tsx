import { NavLink } from 'react-router-dom'
import IconoMedico, { type NombreIconoMedico } from '../IconoMedico'

interface OpcionMenuPaciente {
  icono: NombreIconoMedico
  ruta: string
  texto: string
}

const OPCIONES_MENU: readonly OpcionMenuPaciente[] = [
  { icono: 'home', ruta: '/paciente/inicio', texto: 'Inicio' },
  { icono: 'pill', ruta: '/paciente/medicamento', texto: 'Medicación' },
  { icono: 'smile', ruta: '/paciente/sintomas', texto: 'Síntomas' },
  { icono: 'shield', ruta: '/paciente/tratamiento', texto: 'Tratamiento' },
  { icono: 'file', ruta: '/paciente/documentos', texto: 'Documentos' },
]

interface MenuPacienteProps {
  onSeleccionarInicio?: () => void
}

function MenuPaciente({ onSeleccionarInicio }: MenuPacienteProps) {
  return (
    <nav
      aria-label='Navegación principal del paciente'
      className='sticky bottom-0 z-40 h-[54px] w-full shrink-0 border-t border-[#dfe7ef] bg-white/95 shadow-[0_-3px_10px_rgba(21,55,94,0.06)] backdrop-blur-sm'
    >
      <div className='grid h-full grid-cols-5'>
        {OPCIONES_MENU.map((opcion) => (
          <NavLink
            className={({ isActive }) =>
              `relative flex min-w-0 flex-col items-center justify-center gap-0.5 px-0.5 pt-1 text-[7.5px] font-semibold transition focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-[#08aabb] ${
                isActive ? 'text-[#00a7ad]' : 'text-[#5d6f8e] hover:bg-[#f2fafb] hover:text-[#168d9d]'
              }`
            }
            end
            key={opcion.ruta}
            onClick={opcion.ruta === '/paciente/inicio' ? onSeleccionarInicio : undefined}
            to={opcion.ruta}
          >
            {({ isActive }) => (
              <>
                {isActive && <span aria-hidden='true' className='absolute left-1/2 top-0 h-[3px] w-10 -translate-x-1/2 rounded-b-full bg-[#00aeb2]' />}
                <IconoMedico className='h-[20px] w-[20px]' nombre={opcion.icono} strokeWidth={1.7} />
                <span className='truncate'>{opcion.texto}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}

export default MenuPaciente
