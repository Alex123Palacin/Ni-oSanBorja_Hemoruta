import type {
  DetalleHistorialPaciente,
  EpisodioHistorialPaciente,
  FiltroHistorial,
  TipoDetalleHistorial,
} from '../types/HistoriaPaciente'
import IconoMedico, { type NombreIconoMedico } from './IconoMedico'

interface ConfiguracionDetalle {
  color: string
  fondo: string
  icono: NombreIconoMedico
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
    icono: 'ivBag',
  },
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

function DetalleResultado({ detalle }: { detalle: DetalleHistorialPaciente }) {
  const configuracion = CONFIGURACION_DETALLE[detalle.tipo]

  return (
    <div className='relative grid grid-cols-[64px_32px_minmax(0,1fr)] gap-2 py-1.5 pl-6 sm:grid-cols-[68px_36px_minmax(0,1fr)]'>
      <span aria-hidden='true' className='absolute left-[7px] top-1/2 h-px w-[17px] bg-[#bccbd9]' />
      <span
        aria-hidden='true'
        className='absolute left-[5px] top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full border border-[#9fb1c4] bg-white'
      />
      <time
        className='pt-0.5 text-[8px] font-semibold leading-[12px] text-[#4f668d] sm:text-[9px] sm:leading-[13px]'
        dateTime={detalle.fechaHoraIso}
      >
        {detalle.fecha}
        <br />
        {detalle.hora}
      </time>
      <span
        className={`grid h-8 w-8 place-items-center rounded-full sm:h-9 sm:w-9 ${configuracion.fondo} ${configuracion.color}`}
      >
        <IconoMedico className='h-[18px] w-[18px] sm:h-5 sm:w-5' nombre={configuracion.icono} strokeWidth={1.9} />
      </span>
      <div className='min-w-0 text-[8px] leading-[12px] text-[#405881] sm:text-[9px] sm:leading-[13px]'>
        <h4 className={`text-[10px] font-extrabold leading-[14px] sm:text-[11px] ${configuracion.color}`}>
          {detalle.titulo}
        </h4>
        <p>{detalle.descripcion}</p>
        {detalle.lineas.map((linea, indice) => (
          <LineaDetalle key={`${detalle.id}-${indice}`} linea={linea} />
        ))}
      </div>
    </div>
  )
}

interface ResultadosDocPaciCompProps {
  episodios: readonly EpisodioHistorialPaciente[]
  filtro: FiltroHistorial
}

function ResultadosDocPaciComp({ episodios, filtro }: ResultadosDocPaciCompProps) {
  const tipoDetalle = filtro === 'tratamientos' ? 'tratamiento' : filtro === 'medicacion' ? 'medicacion' : null
  const episodiosVisibles = filtro === 'documentos' ? [] : episodios

  if (episodiosVisibles.length === 0) {
    return (
      <div
        aria-live='polite'
        className='grid min-h-52 place-items-center rounded-xl border border-[#dce5ee] bg-white px-4 text-center shadow-[0_3px_10px_rgba(18,52,91,0.05)]'
        role='status'
      >
        <div className='text-[#60749a]'>
          <IconoMedico className='mx-auto h-9 w-9 text-[#08aabb]' nombre='file' />
          <p className='mt-2 text-[11px] font-semibold'>No hay documentos registrados en este historial.</p>
        </div>
      </div>
    )
  }

  return (
    <section className='overflow-hidden rounded-xl border border-[#dce5ee] bg-white shadow-[0_3px_10px_rgba(18,52,91,0.06)]'>
      {episodiosVisibles.map((episodio) => {
        const detalles =
          filtro === 'consultas'
            ? []
            : tipoDetalle
              ? episodio.detalles.filter((detalle) => detalle.tipo === tipoDetalle)
              : episodio.detalles

        return (
          <article
            className={`${detalles.length > 0 ? 'xl:min-h-[230px]' : ''} relative border-b border-[#dfe7ef] px-3 py-3 last:border-b-0 sm:px-4`}
            key={episodio.id}
          >
            <div className='grid grid-cols-[70px_18px_minmax(0,1fr)] gap-2 xl:grid-cols-[90px_22px_minmax(330px,430px)_minmax(180px,1fr)_110px_28px]'>
              <time
                className='text-[9px] font-semibold leading-[13px] text-[#173a79] xl:text-[10px] xl:leading-[15px]'
                dateTime={episodio.fechaHoraIso}
              >
                {episodio.fecha}
                <br />
                {episodio.hora}
              </time>
              <span className='relative flex justify-center'>
                <span className='mt-1 h-[13px] w-[13px] rounded-full border-[3px] border-[#079db1] bg-white' />
                {detalles.length > 0 && (
                  <span aria-hidden='true' className='absolute bottom-[-13px] top-4 w-px bg-[#b8c8d7]' />
                )}
              </span>
              <div className='flex min-w-0 items-start gap-3'>
                <span className='grid h-[38px] w-[38px] shrink-0 place-items-center rounded-full bg-[#dff5f6] text-[#079db1]'>
                  <IconoMedico className='h-6 w-6' nombre='stethoscope' strokeWidth={1.8} />
                </span>
                <div className='text-[10px] leading-[14px] text-[#405881]'>
                  <h3 className='text-[12px] font-extrabold leading-4 text-[#078fa5]'>{episodio.titulo}</h3>
                  <p>{episodio.descripcion}</p>
                </div>
              </div>
              <div className='col-start-3 text-[9px] leading-[13px] text-[#405881] xl:col-start-auto'>
                <strong className='block text-[10px] text-[#173a79]'>{episodio.medico}</strong>
                {episodio.especialidad}
              </div>
              <span className='col-start-3 inline-flex h-[26px] w-fit items-center gap-2 rounded-lg bg-[#e1f7e7] px-3 text-[9px] font-bold text-[#15953b] xl:col-start-auto'>
                <span aria-hidden='true' className='h-2 w-2 rounded-full bg-[#22bc45]' />
                {episodio.estado}
              </span>
              <button
                aria-label={`Más acciones para la consulta del ${episodio.fecha}`}
                className='absolute right-4 top-3 grid h-7 w-7 cursor-pointer place-items-center rounded-lg text-[#173a79] transition hover:bg-[#edf7f8] focus-visible:outline-2 focus-visible:outline-[#08aabb] xl:static'
                type='button'
              >
                <IconoMedico className='h-[18px] w-[18px]' nombre='moreVertical' strokeWidth={2.5} />
              </button>
            </div>

            {detalles.length > 0 && (
              <div className='relative ml-[88px] mt-2 border-l border-[#b8c8d7] xl:ml-[109px]'>
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
