import type {
  DetalleHistorialPaciente,
  EpisodioHistorialPaciente,
  FiltroHistorial,
  TipoDetalleHistorial,
} from '../types/HistoriaPaciente'
import IconoMedico from './IconoMedico'

interface ConfiguracionDetalle {
  color: string
  fondo: string
  icono: 'activity' | 'pill'
}

const CONFIGURACION_DETALLE: Record<TipoDetalleHistorial, ConfiguracionDetalle> = {
  medicacion: {
    color: 'text-[#f28a13]',
    fondo: 'bg-[#fff1df]',
    icono: 'pill',
  },
  tratamiento: {
    color: 'text-[#8e54e9]',
    fondo: 'bg-[#f1e9ff]',
    icono: 'activity',
  },
}

interface DetalleResultadoProps {
  detalle: DetalleHistorialPaciente
}

function LineaDetalle({ linea }: { linea: string }) {
  const separador = linea.indexOf(':')

  if (separador === -1) {
    return <p>{linea}</p>
  }

  return (
    <p>
      <strong>{linea.slice(0, separador + 1)}</strong>
      {linea.slice(separador + 1)}
    </p>
  )
}

function DetalleResultado({ detalle }: DetalleResultadoProps) {
  const configuracion = CONFIGURACION_DETALLE[detalle.tipo]

  return (
    <div className='relative grid grid-cols-[64px_30px_minmax(0,1fr)] gap-2 py-1 pl-6'>
      <span className='absolute left-[7px] top-1/2 h-px w-5 bg-[#c6d3df]' />
      <span className='absolute left-[5px] top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full border border-[#9fb1c4] bg-white' />
      <time className='text-[7px] font-semibold leading-[10px] text-[#4f668d]'>
        {detalle.fecha}
        <br />
        {detalle.hora}
      </time>
      <span className={`grid h-7 w-7 place-items-center rounded-full ${configuracion.fondo} ${configuracion.color}`}>
        <IconoMedico className='h-4 w-4' nombre={configuracion.icono} strokeWidth={1.9} />
      </span>
      <div className='min-w-0 text-[7px] leading-[10px] text-[#405881]'>
        <h4 className={`text-[9px] font-extrabold ${configuracion.color}`}>{detalle.titulo}</h4>
        <p>{detalle.descripcion}</p>
        {detalle.lineas.map((linea) => (
          <LineaDetalle key={linea} linea={linea} />
        ))}
      </div>
    </div>
  )
}

interface ResultadosDocPaciCompProps {
  episodios: EpisodioHistorialPaciente[]
  filtro: FiltroHistorial
}

function ResultadosDocPaciComp({ episodios, filtro }: ResultadosDocPaciCompProps) {
  const tipoDetalle = filtro === 'tratamientos' ? 'tratamiento' : filtro === 'medicacion' ? 'medicacion' : null
  const episodiosVisibles = filtro === 'documentos' ? [] : episodios

  if (episodiosVisibles.length === 0) {
    return (
      <div className='grid min-h-44 place-items-center rounded-xl border border-[#dce5ee] bg-white px-4 text-center'>
        <div className='text-[#60749a]'>
          <IconoMedico className='mx-auto h-8 w-8 text-[#08aabb]' nombre='file' />
          <p className='mt-2 text-[10px] font-semibold'>No hay documentos registrados en este historial.</p>
        </div>
      </div>
    )
  }

  return (
    <section className='overflow-hidden rounded-xl border border-[#dce5ee] bg-white shadow-[0_2px_8px_rgba(18,52,91,0.05)]'>
      {episodiosVisibles.map((episodio) => {
        const detalles =
          filtro === 'consultas'
            ? []
            : tipoDetalle
              ? episodio.detalles.filter((detalle) => detalle.tipo === tipoDetalle)
              : episodio.detalles

        return (
          <article className='border-b border-[#dfe7ef] px-3 py-2 last:border-b-0' key={episodio.id}>
            <div className='grid grid-cols-[66px_18px_minmax(0,1fr)] gap-2 md:grid-cols-[74px_18px_minmax(0,1fr)_145px_90px_24px]'>
              <time className='text-[8px] font-semibold leading-[12px] text-[#173a79]'>
                {episodio.fecha}
                <br />
                {episodio.hora}
              </time>
              <span className='relative flex justify-center'>
                <span className='mt-1 h-3 w-3 rounded-full border-[3px] border-[#079db1] bg-white' />
                {detalles.length > 0 && <span className='absolute bottom-[-12px] top-4 w-px bg-[#b8c8d7]' />}
              </span>
              <div className='flex min-w-0 items-start gap-2'>
                <span className='grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#dff5f6] text-[#079db1]'>
                  <IconoMedico className='h-5 w-5' nombre='stethoscope' strokeWidth={1.8} />
                </span>
                <div className='text-[8px] leading-[12px] text-[#405881]'>
                  <h3 className='text-[10px] font-extrabold text-[#078fa5]'>{episodio.titulo}</h3>
                  <p>{episodio.descripcion}</p>
                </div>
              </div>
              <div className='col-start-3 text-[8px] leading-[12px] text-[#405881] md:col-start-auto'>
                <strong className='block text-[#173a79]'>{episodio.medico}</strong>
                {episodio.especialidad}
              </div>
              <span className='col-start-3 inline-flex h-6 w-fit items-center gap-1.5 rounded-md bg-[#e1f7e7] px-3 text-[8px] font-bold text-[#15953b] md:col-start-auto'>
                <span className='h-1.5 w-1.5 rounded-full bg-[#22bc45]' />
                {episodio.estado}
              </span>
              <button
                aria-label={`Más acciones para la consulta del ${episodio.fecha}`}
                className='hidden h-6 w-6 cursor-pointer place-items-center rounded text-[#173a79] transition hover:bg-[#edf7f8] md:grid'
                type='button'
              >
                <IconoMedico className='h-4 w-4' nombre='moreVertical' strokeWidth={2.5} />
              </button>
            </div>

            {detalles.length > 0 && (
              <div className='relative ml-[74px] mt-1 border-l border-[#b8c8d7] md:ml-[83px]'>
                {detalles.map((detalle) => (
                  <DetalleResultado detalle={detalle} key={detalle.id} />
                ))}
              </div>
            )}
          </article>
        )
      })}
    </section>
  )
}

export default ResultadosDocPaciComp
