import type {
  DetalleHistorialPaciente,
  DocumentoHistorialPaciente,
  EpisodioHistorialPaciente,
  FiltroHistorial,
  ReporteSintomasHistorialPaciente,
  TipoDetalleHistorial,
} from '../types/HistoriaPaciente'
import IconoMedico, { type NombreIconoMedico } from './IconoMedico'

interface ConfiguracionDetalle {
  color: string
  fondo: string
  icono: NombreIconoMedico
}

const CONFIGURACION_DETALLE: Record<TipoDetalleHistorial, ConfiguracionDetalle> = {
  medicacion: { color: 'text-[#f28a13]', fondo: 'bg-[#fff1df]', icono: 'pill' },
  tratamiento: { color: 'text-[#8e54e9]', fondo: 'bg-[#f1e9ff]', icono: 'ivBag' },
}

const MENSAJES_VACIOS: Record<FiltroHistorial, string> = {
  consultas: 'Este paciente aún no tiene consultas registradas.',
  documentos: 'No hay documentos registrados en este historial.',
  medicacion: 'Este paciente aún no tiene medicación registrada en su historial.',
  sintomas: 'Este paciente aún no ha reportado síntomas.',
  todo: 'Este paciente aún no tiene eventos clínicos registrados.',
  tratamientos: 'Este paciente aún no tiene tratamientos registrados.',
}

interface ResultadosDocPaciCompProps {
  documentos?: readonly DocumentoHistorialPaciente[]
  episodios: readonly EpisodioHistorialPaciente[]
  filtro: FiltroHistorial
  onDescargarDocumento?: (documento: DocumentoHistorialPaciente) => void
  onVerDocumento?: (documento: DocumentoHistorialPaciente) => void
  procesandoDocumentoId?: string
  reportesSintomas?: readonly ReporteSintomasHistorialPaciente[]
}

type EntradaHistorial =
  | { fechaHoraIso: string; tipo: 'consulta'; valor: EpisodioHistorialPaciente }
  | { fechaHoraIso: string; tipo: 'documento'; valor: DocumentoHistorialPaciente }
  | { fechaHoraIso: string; tipo: 'sintomas'; valor: ReporteSintomasHistorialPaciente }

function LineaDetalle({ linea }: { linea: string }) {
  const separador = linea.indexOf(':')
  if (separador === -1) return <p>{linea}</p>

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
      <span aria-hidden='true' className='absolute left-[5px] top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full border border-[#9fb1c4] bg-white' />
      <time className='pt-0.5 text-[8px] font-semibold leading-[12px] text-[#4f668d] sm:text-[9px]' dateTime={detalle.fechaHoraIso}>
        {detalle.fecha}<br />{detalle.hora}
      </time>
      <span className={`grid h-8 w-8 place-items-center rounded-full sm:h-9 sm:w-9 ${configuracion.fondo} ${configuracion.color}`}>
        <IconoMedico className='h-[18px] w-[18px] sm:h-5 sm:w-5' nombre={configuracion.icono} />
      </span>
      <div className='min-w-0 text-[8px] leading-[12px] text-[#405881] sm:text-[9px] sm:leading-[13px]'>
        <h4 className={`text-[10px] font-extrabold leading-[14px] sm:text-[11px] ${configuracion.color}`}>{detalle.titulo}</h4>
        <p>{detalle.descripcion}</p>
        {detalle.lineas.map((linea, indice) => <LineaDetalle key={`${detalle.id}-${indice}`} linea={linea} />)}
      </div>
    </div>
  )
}

function TarjetaConsulta({ episodio, filtro }: { episodio: EpisodioHistorialPaciente; filtro: FiltroHistorial }) {
  const tipoDetalle = filtro === 'tratamientos' ? 'tratamiento' : filtro === 'medicacion' ? 'medicacion' : null
  const detalles = filtro === 'consultas'
    ? []
    : tipoDetalle
      ? episodio.detalles.filter((detalle) => detalle.tipo === tipoDetalle)
      : episodio.detalles

  return (
    <article className='relative border-b border-[#dfe7ef] px-3 py-3 last:border-b-0 sm:px-4'>
      <div className='grid grid-cols-[70px_18px_minmax(0,1fr)] gap-2 xl:grid-cols-[90px_22px_minmax(330px,430px)_minmax(180px,1fr)_110px]'>
        <time className='text-[9px] font-semibold leading-[13px] text-[#173a79] xl:text-[10px]' dateTime={episodio.fechaHoraIso}>{episodio.fecha}<br />{episodio.hora}</time>
        <span className='relative flex justify-center'><span className='mt-1 h-[13px] w-[13px] rounded-full border-[3px] border-[#079db1] bg-white' />{detalles.length > 0 && <span aria-hidden='true' className='absolute bottom-[-13px] top-4 w-px bg-[#b8c8d7]' />}</span>
        <div className='flex min-w-0 items-start gap-3'>
          <span className='grid h-[38px] w-[38px] shrink-0 place-items-center rounded-full bg-[#dff5f6] text-[#079db1]'><IconoMedico className='h-6 w-6' nombre='stethoscope' /></span>
          <div className='text-[10px] leading-[14px] text-[#405881]'><h3 className='text-[12px] font-extrabold leading-4 text-[#078fa5]'>{episodio.titulo}</h3><p>{episodio.descripcion}</p></div>
        </div>
        <div className='col-start-3 text-[9px] leading-[13px] text-[#405881] xl:col-start-auto'><strong className='block text-[10px] text-[#173a79]'>{episodio.medico}</strong>{episodio.especialidad}</div>
        <span className='col-start-3 inline-flex h-[26px] w-fit items-center gap-2 rounded-lg bg-[#e1f7e7] px-3 text-[9px] font-bold text-[#15953b] xl:col-start-auto'><span aria-hidden='true' className='h-2 w-2 rounded-full bg-[#22bc45]' />{episodio.estado}</span>
      </div>
      {detalles.length > 0 && <div className='relative ml-[88px] mt-2 border-l border-[#b8c8d7] xl:ml-[109px]'>{detalles.map((detalle) => <DetalleResultado detalle={detalle} key={detalle.id} />)}</div>}
    </article>
  )
}

function TarjetaSintomas({ reporte }: { reporte: ReporteSintomasHistorialPaciente }) {
  const alerta = reporte.intensidad === 'FUERTE'
  const moderado = reporte.intensidad === 'MODERADA'
  const color = alerta ? 'text-[#ef4149]' : moderado ? 'text-[#ed9414]' : 'text-[#159953]'
  const fondo = alerta ? 'bg-[#fff0f1]' : moderado ? 'bg-[#fff6e8]' : 'bg-[#e9f8ef]'

  return (
    <article className='border-b border-[#dfe7ef] px-3 py-3 last:border-b-0 sm:px-4'>
      <div className='grid grid-cols-[70px_18px_minmax(0,1fr)] gap-2 xl:grid-cols-[90px_22px_minmax(0,1fr)_180px_110px]'>
        <time className='text-[9px] font-semibold leading-[13px] text-[#173a79] xl:text-[10px]' dateTime={reporte.fechaHoraIso}>{reporte.fecha}<br />{reporte.hora}</time>
        <span className='flex justify-center'><span className={`mt-1 h-[13px] w-[13px] rounded-full border-[3px] bg-white ${alerta ? 'border-[#ef4149]' : moderado ? 'border-[#ed9414]' : 'border-[#20b760]'}`} /></span>
        <div className='flex min-w-0 items-start gap-3'>
          <span className={`grid h-[38px] w-[38px] shrink-0 place-items-center rounded-full ${fondo} ${color}`}><IconoMedico className='h-6 w-6' nombre={alerta ? 'frown' : moderado ? 'meh' : 'smile'} /></span>
          <div className='min-w-0 text-[9px] leading-[14px] text-[#405881]'>
            <h3 className={`text-[12px] font-extrabold ${color}`}>Síntomas reportados</h3>
            <div className='mt-1 flex flex-wrap gap-1.5'>{reporte.sintomas.map((sintoma) => <span className='rounded-full border border-[#dce6ed] bg-[#f8fbfd] px-2 py-0.5 font-bold text-[#24477f]' key={sintoma.id}>{sintoma.nombre}</span>)}</div>
            {reporte.descripcion && <p className='mt-1'>{reporte.descripcion}</p>}
          </div>
        </div>
        <div className='col-start-3 text-[9px] leading-[14px] text-[#52698f] xl:col-start-auto'><strong className='block text-[#173a79]'>{reporte.reportadoPor}</strong>{reporte.duracion} · {reporte.evolucion}</div>
        <span className={`col-start-3 inline-flex h-[26px] w-fit items-center rounded-lg px-3 text-[9px] font-bold xl:col-start-auto ${fondo} ${color}`}>{reporte.intensidad === 'MODERADA' ? 'Moderada' : reporte.intensidad[0] + reporte.intensidad.slice(1).toLowerCase()}</span>
      </div>
    </article>
  )
}

function TarjetaDocumento({ documento, onDescargar, onVer, procesando }: { documento: DocumentoHistorialPaciente; onDescargar?: () => void; onVer?: () => void; procesando: boolean }) {
  return (
    <article className='border-b border-[#dfe7ef] px-3 py-3 last:border-b-0 sm:px-4'>
      <div className='grid grid-cols-[70px_18px_minmax(0,1fr)] items-start gap-2 xl:grid-cols-[90px_22px_minmax(0,1fr)_160px_190px]'>
        <time className='text-[9px] font-semibold leading-[13px] text-[#173a79] xl:text-[10px]' dateTime={documento.fechaHoraIso}>{documento.fecha}<br />{documento.hora}</time>
        <span className='flex justify-center'><span className='mt-1 h-[13px] w-[13px] rounded-full border-[3px] border-[#7357e8] bg-white' /></span>
        <div className='flex min-w-0 items-start gap-3'>
          <span className='grid h-[38px] w-[38px] shrink-0 place-items-center rounded-full bg-[#efeafe] text-[#7357e8]'><IconoMedico className='h-5 w-5' nombre='file' /></span>
          <div className='min-w-0 text-[9px] leading-[14px] text-[#405881]'><h3 className='truncate text-[12px] font-extrabold text-[#6547d7]'>{documento.nombre}</h3><p>{documento.descripcion || 'Documento incorporado a la ficha del paciente.'}</p></div>
        </div>
        <div className='col-start-3 text-[9px] leading-[14px] text-[#52698f] xl:col-start-auto'><strong className='block text-[#173a79]'>{documento.formato}</strong>{documento.origen}</div>
        <div className='col-start-3 flex flex-wrap gap-2 xl:col-start-auto'>
          <button className='inline-flex h-8 items-center gap-1.5 rounded-lg border border-[#b9dce5] px-3 text-[9px] font-bold text-[#078ca2] disabled:opacity-50' disabled={!documento.archivoDisponible || procesando} onClick={onVer} type='button'><IconoMedico className='h-4 w-4' nombre='eye' />{procesando ? 'Abriendo…' : 'Ver'}</button>
          <button className='inline-flex h-8 items-center gap-1.5 rounded-lg border border-[#d6e1ec] px-3 text-[9px] font-bold text-[#38517f] disabled:opacity-50' disabled={!documento.archivoDisponible || procesando} onClick={onDescargar} type='button'><IconoMedico className='h-4 w-4' nombre='download' />Descargar</button>
        </div>
      </div>
    </article>
  )
}

function ResultadosDocPaciComp({ documentos = [], episodios, filtro, onDescargarDocumento, onVerDocumento, procesandoDocumentoId, reportesSintomas = [] }: ResultadosDocPaciCompProps) {
  const episodiosFiltrados = filtro === 'tratamientos' || filtro === 'medicacion'
    ? episodios.filter((episodio) => episodio.detalles.some((detalle) => detalle.tipo === (filtro === 'tratamientos' ? 'tratamiento' : 'medicacion')))
    : episodios
  const entradas: EntradaHistorial[] = [
    ...((filtro === 'todo' || filtro === 'consultas' || filtro === 'tratamientos' || filtro === 'medicacion') ? episodiosFiltrados.map((valor) => ({ fechaHoraIso: valor.fechaHoraIso, tipo: 'consulta' as const, valor })) : []),
    ...((filtro === 'todo' || filtro === 'documentos') ? documentos.map((valor) => ({ fechaHoraIso: valor.fechaHoraIso, tipo: 'documento' as const, valor })) : []),
    ...((filtro === 'todo' || filtro === 'sintomas') ? reportesSintomas.map((valor) => ({ fechaHoraIso: valor.fechaHoraIso, tipo: 'sintomas' as const, valor })) : []),
  ].sort((a, b) => new Date(b.fechaHoraIso).getTime() - new Date(a.fechaHoraIso).getTime())

  if (entradas.length === 0) {
    return <div aria-live='polite' className='grid min-h-52 place-items-center rounded-xl border border-[#dce5ee] bg-white px-4 text-center shadow-[0_3px_10px_rgba(18,52,91,0.05)]' role='status'><div className='text-[#60749a]'><IconoMedico className='mx-auto h-9 w-9 text-[#08aabb]' nombre={filtro === 'sintomas' ? 'smile' : 'file'} /><p className='mt-2 text-[11px] font-semibold'>{MENSAJES_VACIOS[filtro]}</p></div></div>
  }

  return (
    <section className='overflow-hidden rounded-xl border border-[#dce5ee] bg-white shadow-[0_3px_10px_rgba(18,52,91,0.06)]'>
      {entradas.map((entrada) => {
        if (entrada.tipo === 'consulta') return <TarjetaConsulta episodio={entrada.valor} filtro={filtro} key={`consulta-${entrada.valor.id}`} />
        if (entrada.tipo === 'sintomas') return <TarjetaSintomas key={`sintomas-${entrada.valor.id}`} reporte={entrada.valor} />
        return <TarjetaDocumento documento={entrada.valor} key={`documento-${entrada.valor.id}`} onDescargar={() => onDescargarDocumento?.(entrada.valor)} onVer={() => onVerDocumento?.(entrada.valor)} procesando={procesandoDocumentoId === entrada.valor.id} />
      })}
    </section>
  )
}

export default ResultadosDocPaciComp
