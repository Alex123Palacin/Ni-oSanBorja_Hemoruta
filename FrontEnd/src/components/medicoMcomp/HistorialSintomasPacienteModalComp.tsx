import type { ReporteSintomasPacienteMedicoApi } from '../../api/medico/MedicoApi'
import IconoMedico from '../IconoMedico'
import ModalFichaPacienteComp from './ModalFichaPacienteComp'

interface HistorialSintomasPacienteModalCompProps {
  error?: string
  nombrePaciente: string
  onCerrar: () => void
  procesando?: boolean
  reportes: readonly ReporteSintomasPacienteMedicoApi[]
}

function formatearFechaHora(fechaIso: string) {
  const fecha = new Date(fechaIso)
  if (Number.isNaN(fecha.getTime())) return 'Fecha no disponible'
  return new Intl.DateTimeFormat('es-PE', {
    dateStyle: 'medium',
    hour: '2-digit',
    hour12: true,
    minute: '2-digit',
  }).format(fecha)
}

function HistorialSintomasPacienteModalComp({
  error,
  nombrePaciente,
  onCerrar,
  procesando,
  reportes,
}: HistorialSintomasPacienteModalCompProps) {
  return (
    <ModalFichaPacienteComp
      descripcion={`Reportes enviados por la familia de ${nombrePaciente}, ordenados desde el más reciente.`}
      onCerrar={onCerrar}
      titulo='Historial de síntomas'
    >
      {procesando && (
        <div className='grid min-h-48 place-items-center' role='status'>
          <span className='h-8 w-8 animate-spin rounded-full border-4 border-[#d8f1f3] border-t-[#08aabb]' />
        </div>
      )}
      {!procesando && error && (
        <p className='rounded-xl border border-[#ffd9d9] bg-[#fff6f6] p-4 text-[11px] font-semibold text-[#bd3544]' role='alert'>{error}</p>
      )}
      {!procesando && !error && reportes.length === 0 && (
        <div className='grid min-h-52 place-items-center rounded-2xl border border-dashed border-[#cbdce7] bg-white text-center'>
          <div><IconoMedico className='mx-auto h-10 w-10 text-[#08aabb]' nombre='smile' /><p className='mt-3 text-[12px] font-extrabold text-[#173478]'>Sin reportes de síntomas</p><p className='mt-1 text-[9px] text-[#6a7d99]'>Los nuevos envíos aparecerán aquí automáticamente.</p></div>
        </div>
      )}
      {!procesando && !error && reportes.length > 0 && (
        <ol className='grid gap-3 sm:grid-cols-2'>
          {reportes.map((reporte) => {
            const alerta = reporte.intensidad === 'FUERTE'
            const moderado = reporte.intensidad === 'MODERADA'
            const color = alerta ? 'text-[#e33c47]' : moderado ? 'text-[#df8b12]' : 'text-[#168b4b]'
            const fondo = alerta ? 'bg-[#fff0f1]' : moderado ? 'bg-[#fff6e8]' : 'bg-[#eaf8ef]'
            return (
              <li className='rounded-2xl border border-[#dce5ee] bg-white p-4 shadow-[0_3px_10px_rgba(18,52,91,.04)]' key={reporte.id}>
                <div className='flex items-start gap-3'>
                  <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${fondo} ${color}`}><IconoMedico className='h-6 w-6' nombre={alerta ? 'frown' : moderado ? 'meh' : 'smile'} /></span>
                  <div className='min-w-0 flex-1'>
                    <div className='flex flex-wrap items-start justify-between gap-2'><strong className={`text-[11px] ${color}`}>{reporte.intensidadTexto}</strong><span className={`rounded-full px-2 py-0.5 text-[8px] font-extrabold ${fondo} ${color}`}>{reporte.estado === 'ALERTA' ? 'Alerta' : 'Recibido'}</span></div>
                    <time className='mt-1 block text-[8px] font-semibold text-[#6a7d99]' dateTime={reporte.observadoEn}>{formatearFechaHora(reporte.observadoEn)}</time>
                  </div>
                </div>
                <div className='mt-3 flex flex-wrap gap-1.5'>{reporte.sintomas.map((sintoma) => <span className='rounded-full border border-[#dce5ee] bg-[#f7fafc] px-2 py-1 text-[8px] font-bold text-[#29497e]' key={sintoma.id}>{sintoma.nombre}</span>)}</div>
                <dl className='mt-3 grid grid-cols-2 gap-2 rounded-xl bg-[#f7fafc] p-3 text-[8px] text-[#607394]'><div><dt className='font-bold text-[#173478]'>Duración</dt><dd>{reporte.duracionTexto}</dd></div><div><dt className='font-bold text-[#173478]'>Evolución</dt><dd>{reporte.evolucionTexto}</dd></div></dl>
                {reporte.descripcion && <p className='mt-3 text-[9px] leading-4 text-[#4d6388]'>{reporte.descripcion}</p>}
              </li>
            )
          })}
        </ol>
      )}
    </ModalFichaPacienteComp>
  )
}

export default HistorialSintomasPacienteModalComp
