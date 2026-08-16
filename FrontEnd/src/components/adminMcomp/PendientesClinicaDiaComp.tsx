import type {
  EstadoSolicitudClinicaDiaApi,
  PrioridadClinicaDiaApi,
  SolicitudClinicaDiaApi,
} from '../../api/admin/ClinicaDiaAdminApi'
import IconoMedico from '../IconoMedico'
import { nombreBreveClinicaDia } from '../../utils/nombreClinicaDia'

interface PendientesClinicaDiaCompProps {
  busqueda: string
  cargando: boolean
  estado: EstadoSolicitudClinicaDiaApi | ''
  onCambiarBusqueda: (valor: string) => void
  onCambiarEstado: (valor: EstadoSolicitudClinicaDiaApi | '') => void
  onCambiarPrioridad: (valor: PrioridadClinicaDiaApi | '') => void
  onCambiarProcedencia: (valor: string) => void
  onProgramar: (solicitud: SolicitudClinicaDiaApi) => void
  pendientes: SolicitudClinicaDiaApi[]
  prioridad: PrioridadClinicaDiaApi | ''
  procedencia: string
  procedencias: string[]
}

function clasePrioridad(prioridad: PrioridadClinicaDiaApi) {
  if (prioridad === 'ALTA') return 'bg-[#fff0f1] text-[#d3414e]'
  if (prioridad === 'MEDIA') return 'bg-[#fff6e7] text-[#c77918]'
  return 'bg-[#eaf8ef] text-[#178b4c]'
}

function PendientesClinicaDiaComp({
  busqueda,
  cargando,
  estado,
  onCambiarBusqueda,
  onCambiarEstado,
  onCambiarPrioridad,
  onCambiarProcedencia,
  onProgramar,
  pendientes,
  prioridad,
  procedencia,
  procedencias,
}: PendientesClinicaDiaCompProps) {
  return (
    <section className='rounded-2xl border border-[#dce7ee] bg-white shadow-[0_8px_22px_rgba(18,55,89,0.05)]'>
      <header className='px-4 pb-2.5 pt-3'>
        <div className='flex flex-wrap items-end justify-between gap-3'>
          <div>
            <h2 className='text-[14px] font-black text-[#0a2b70]'>Pacientes pendientes de programación</h2>
            <p className='mt-0.5 text-[9px] font-medium text-[#71829a]'>Prioriza y asigna cada solicitud a un horario disponible.</p>
          </div>
          <span className='rounded-full bg-[#eef8ff] px-3 py-1.5 text-[9px] font-black text-[#2676c9]'>{pendientes.length} resultados</span>
        </div>

        <div className='mt-3 grid gap-2 md:grid-cols-2 xl:grid-cols-[minmax(180px,1fr)_120px_130px_120px]'>
          <label className='relative block'>
            <span className='sr-only'>Buscar paciente pendiente</span>
            <IconoMedico className='pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#71839d]' nombre='search' />
            <input
              className='h-9 w-full rounded-lg border border-[#d6e2e9] bg-white pl-9 pr-3 text-[9px] font-medium text-[#173777] outline-none transition placeholder:text-[#9aa8b9] focus:border-[#0aaab3] focus:ring-3 focus:ring-[#0aaab3]/10'
              onChange={(evento) => onCambiarBusqueda(evento.target.value)}
              placeholder='Buscar paciente, DNI o código...'
              type='search'
              value={busqueda}
            />
          </label>
          <label className='relative'>
            <span className='sr-only'>Filtrar por prioridad</span>
            <select className='h-9 w-full cursor-pointer appearance-none rounded-lg border border-[#d6e2e9] bg-white px-3 pr-8 text-[9px] font-bold text-[#425c7e] outline-none focus:border-[#0aaab3]' onChange={(evento) => onCambiarPrioridad(evento.target.value as PrioridadClinicaDiaApi | '')} value={prioridad}>
              <option value=''>Toda prioridad</option>
              <option value='ALTA'>Prioridad alta</option>
              <option value='MEDIA'>Prioridad media</option>
              <option value='BAJA'>Prioridad baja</option>
            </select>
            <IconoMedico className='pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#71839d]' nombre='chevronDown' />
          </label>
          <label className='relative'>
            <span className='sr-only'>Filtrar por procedencia</span>
            <select className='h-9 w-full cursor-pointer appearance-none rounded-lg border border-[#d6e2e9] bg-white px-3 pr-8 text-[9px] font-bold text-[#425c7e] outline-none focus:border-[#0aaab3]' onChange={(evento) => onCambiarProcedencia(evento.target.value)} value={procedencia}>
              <option value=''>Toda procedencia</option>
              {procedencias.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
            <IconoMedico className='pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#71839d]' nombre='chevronDown' />
          </label>
          <label className='relative'>
            <span className='sr-only'>Filtrar por estado</span>
            <select className='h-9 w-full cursor-pointer appearance-none rounded-lg border border-[#d6e2e9] bg-white px-3 pr-8 text-[9px] font-bold text-[#425c7e] outline-none focus:border-[#0aaab3]' onChange={(evento) => onCambiarEstado(evento.target.value as EstadoSolicitudClinicaDiaApi | '')} value={estado}>
              <option value=''>Todos los estados</option>
              <option value='PENDIENTE'>Pendiente</option>
              <option value='PROGRAMADA'>Programada</option>
              <option value='CONFIRMADA'>Confirmada</option>
              <option value='COMPLETADA'>Completada</option>
              <option value='CANCELADA'>Cancelada</option>
            </select>
            <IconoMedico className='pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#71839d]' nombre='chevronDown' />
          </label>
        </div>
      </header>

      <div className='overflow-x-auto border-t border-[#e5edf2]'>
        <table className='w-full min-w-[700px] border-collapse'>
          <thead className='bg-[#f7fafc] text-left text-[8.5px] font-black uppercase tracking-[0.04em] text-[#59708f]'>
            <tr>
              <th className='px-3 py-2.5'>Paciente</th>
              <th className='px-2 py-2.5'>Procedencia</th>
              <th className='px-2 py-2.5'>Duración</th>
              <th className='px-2 py-2.5'>Prioridad</th>
              <th className='px-2 py-2.5'>Teléfono</th>
              <th className='px-2 py-2.5'>Estado</th>
              <th className='px-3 py-2.5 text-right'>Acción</th>
            </tr>
          </thead>
          <tbody className='divide-y divide-[#e8eef2]'>
            {cargando && pendientes.length === 0 ? (
              <tr><td className='px-4 py-10 text-center text-[10px] font-semibold text-[#75869c]' colSpan={7}><span className='mx-auto mb-2 block h-6 w-6 animate-spin rounded-full border-2 border-[#cae8ea] border-t-[#08aab3]' />Cargando solicitudes...</td></tr>
            ) : pendientes.length === 0 ? (
              <tr><td className='px-4 py-10 text-center text-[10px] font-semibold text-[#75869c]' colSpan={7}><IconoMedico className='mx-auto mb-2 h-7 w-7 text-[#9db0c2]' nombre='check' />No hay pacientes que coincidan con los filtros.</td></tr>
            ) : pendientes.map((solicitud) => (
              <tr className='text-[9px] font-medium text-[#476181] transition hover:bg-[#fbfefe]' key={solicitud.id}>
                <td className='px-4 py-2.5'>
                  <strong className='block max-w-[170px] truncate text-[10px] font-extrabold text-[#143574]'>{nombreBreveClinicaDia(solicitud.nombreCompleto)}</strong>
                </td>
                <td className='px-2 py-2.5'><span className='flex items-center gap-1.5'><IconoMedico className='h-3.5 w-3.5 text-[#2585cf]' nombre={solicitud.origen === 'IMPORTACION' ? 'file' : 'edit'} />{solicitud.procedencia}</span></td>
                <td className='px-2 py-2.5'><span className='rounded-lg bg-[#f1f5f8] px-2 py-1 font-extrabold text-[#455f7f]'>{solicitud.duracionMinutos} min</span></td>
                <td className='px-2 py-2.5'><span className={`rounded-full px-2.5 py-1 text-[8px] font-black ${clasePrioridad(solicitud.prioridad)}`}>{solicitud.prioridad}</span></td>
                <td className='px-2 py-2.5'><span className='flex items-center gap-1.5 whitespace-nowrap'><IconoMedico className='h-3.5 w-3.5 text-[#079da8]' nombre='phone' />{solicitud.telefono || 'Sin registro'}</span></td>
                <td className='px-2 py-2.5'><span className='rounded-full bg-[#fff6e7] px-2.5 py-1 text-[8px] font-black text-[#c47716]'>{solicitud.estado}</span></td>
                <td className='px-3 py-2.5 text-right'>
                  <button className='h-8 cursor-pointer rounded-lg border border-[#0aa9b3] px-3 text-[9px] font-black text-[#079da8] transition hover:bg-[#08aab3] hover:text-white disabled:cursor-not-allowed disabled:border-[#d6e0e7] disabled:text-[#9aa8b8]' disabled={solicitud.estado !== 'PENDIENTE'} onClick={() => onProgramar(solicitud)} type='button'>Programar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export default PendientesClinicaDiaComp
