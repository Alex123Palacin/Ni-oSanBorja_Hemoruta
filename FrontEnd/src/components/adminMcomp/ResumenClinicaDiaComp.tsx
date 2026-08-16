import type { TableroClinicaDiaApi } from '../../api/admin/ClinicaDiaAdminApi'
import IconoMedico, { type NombreIconoMedico } from '../IconoMedico'

interface ResumenClinicaDiaCompProps {
  resumen: TableroClinicaDiaApi['resumen']
}

const tarjetas: Array<{
  campo: keyof TableroClinicaDiaApi['resumen']
  descripcion: string
  icono: NombreIconoMedico
  titulo: string
  tono: string
}> = [
  {
    campo: 'solicitudesPendientes',
    descripcion: 'Solicitudes por programar',
    icono: 'clipboard',
    titulo: 'Pacientes pendientes',
    tono: 'bg-[#edf7ff] text-[#1978d2]',
  },
  {
    campo: 'camasDisponibles',
    descripcion: 'De 8 camas totales',
    icono: 'building',
    titulo: 'Camas disponibles hoy',
    tono: 'bg-[#eafaf7] text-[#079f91]',
  },
  {
    campo: 'programadasFecha',
    descripcion: 'Atenciones incluidas en agenda',
    icono: 'calendar',
    titulo: 'Horarios programados',
    tono: 'bg-[#f2efff] text-[#7554ca]',
  },
  {
    campo: 'recordatoriosPendientes',
    descripcion: 'Mensajes pendientes de registro',
    icono: 'whatsapp',
    titulo: 'Recordatorios WhatsApp',
    tono: 'bg-[#edf9ef] text-[#14a650]',
  },
]

function ResumenClinicaDiaComp({ resumen }: ResumenClinicaDiaCompProps) {
  return (
    <section aria-label='Resumen de Clínica de Día' className='grid gap-3 sm:grid-cols-2 xl:grid-cols-4'>
      {tarjetas.map((tarjeta) => (
        <article
          className='flex min-h-[88px] items-center gap-3 rounded-2xl border border-[#dce7ee] bg-white px-4 py-3 shadow-[0_8px_22px_rgba(18,55,89,0.05)]'
          key={tarjeta.campo}
        >
          <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-full ${tarjeta.tono}`}>
            <IconoMedico className='h-5 w-5' nombre={tarjeta.icono} />
          </span>
          <span className='min-w-0'>
            <strong className='block text-[23px] font-black leading-none tracking-[-0.04em] text-[#09286d]'>
              {tarjeta.campo === 'camasDisponibles' ? 8 : resumen[tarjeta.campo]}
            </strong>
            <span className='mt-1.5 block text-[10px] font-extrabold leading-4 text-[#173b76]'>
              {tarjeta.titulo}
            </span>
            <span className='block text-[9px] font-medium leading-4 text-[#72829a]'>
              {tarjeta.descripcion}
            </span>
          </span>
        </article>
      ))}
    </section>
  )
}

export default ResumenClinicaDiaComp
