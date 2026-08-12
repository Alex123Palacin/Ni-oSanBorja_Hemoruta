import IconoMedico from '../IconoMedico'

export type TonoDocumentoPaciente = 'imagen' | 'pdf'

export interface DocumentoRecientePaciente {
  archivoDisponible: boolean
  estado: string
  fecha: string
  fechaIso: string
  id: string
  nombre: string
  origen: string
  tono: TonoDocumentoPaciente
}

interface DocumentosRecientesPacienteCompProps {
  cargando?: boolean
  documentos: readonly DocumentoRecientePaciente[]
  onDescargar: (documento: DocumentoRecientePaciente) => void
  onVer: (documento: DocumentoRecientePaciente) => void
  procesandoId?: string | null
}

const ESTADOS_PENDIENTES = new Set(['PENDIENTE', 'SUBIENDO'])

function DocumentosRecientesPacienteComp({
  cargando = false,
  documentos,
  onDescargar,
  onVer,
  procesandoId = null,
}: DocumentosRecientesPacienteCompProps) {
  return (
    <section aria-labelledby='documentos-recientes-titulo'>
      <h2 className='text-[9px] font-extrabold text-[#12316c]' id='documentos-recientes-titulo'>
        Documentos recientes
      </h2>

      <div className='mt-1.5 space-y-1.5'>
        {cargando && documentos.length === 0 && (
          <div className='space-y-1.5' role='status'>
            <span className='sr-only'>Cargando documentos</span>
            {[0, 1, 2].map((indice) => (
              <div className='h-[48px] animate-pulse rounded-[10px] border border-[#e2e9f0] bg-white' key={indice} />
            ))}
          </div>
        )}

        {!cargando && documentos.length === 0 && (
          <div className='rounded-[10px] border border-dashed border-[#b9dfe4] bg-[#f7fcfd] px-3 py-5 text-center'>
            <IconoMedico className='mx-auto h-7 w-7 text-[#25aebb]' nombre='file' strokeWidth={1.5} />
            <p className='mt-1 text-[8px] font-bold text-[#17366f]'>Aún no hay documentos</p>
            <p className='mt-0.5 text-[6.8px] font-medium text-[#6a7d98]'>Sube el primer archivo para compartirlo con tu equipo médico.</p>
          </div>
        )}

        {documentos.map((documento) => {
          const pendiente = ESTADOS_PENDIENTES.has(documento.estado)
          const procesando = procesandoId === documento.id
          const accionDeshabilitada = !documento.archivoDisponible || procesando

          return (
            <article
              className='flex min-h-[48px] items-center rounded-[10px] border border-[#e1e8ef] bg-white px-2 py-1.5 shadow-[0_2px_7px_rgba(23,55,96,0.04)]'
              key={documento.id}
            >
              <span
                className={`grid h-[28px] w-[24px] shrink-0 place-items-center rounded-[5px] border text-[6px] font-black ${
                  documento.tono === 'pdf'
                    ? 'border-[#ffb7b0] bg-[#fff2f0] text-[#ef332a]'
                    : 'border-[#b7dfa7] bg-[#f0faec] text-[#4ba33c]'
                }`}
              >
                {documento.tono === 'pdf' ? 'PDF' : <IconoMedico className='h-4 w-4' nombre='file' strokeWidth={1.8} />}
              </span>

              <div className='ml-2 min-w-0 flex-1'>
                <h3 className='truncate text-[7.5px] font-extrabold text-[#17366f]' title={documento.nombre}>
                  {documento.nombre}
                </h3>
                <p className='mt-1 flex min-w-0 items-center gap-1 text-[6.2px] font-medium text-[#607594]'>
                  <IconoMedico className='h-[9px] w-[9px] shrink-0' nombre='calendar' strokeWidth={1.5} />
                  <time className='shrink-0' dateTime={documento.fechaIso}>{documento.fecha}</time>
                  <span aria-hidden='true'>·</span>
                  <span className={`truncate font-semibold ${pendiente ? 'text-[#d38716]' : 'text-[#279749]'}`}>
                    {pendiente ? 'Pendiente de revisión' : documento.origen}
                  </span>
                </p>
              </div>

              <div className='ml-1 flex shrink-0 items-center divide-x divide-[#e4eaf0]'>
                <button
                  className='inline-flex h-7 items-center gap-1 px-1.5 text-[6.7px] font-bold text-[#0879bf] transition hover:text-[#005d9a] disabled:cursor-not-allowed disabled:opacity-45 focus-visible:outline-2 focus-visible:outline-[#08aabb]'
                  disabled={accionDeshabilitada}
                  onClick={() => onVer(documento)}
                  title={documento.archivoDisponible ? 'Abrir documento' : 'Este registro no tiene un archivo adjunto'}
                  type='button'
                >
                  <IconoMedico className='h-[12px] w-[12px]' nombre='eye' strokeWidth={1.7} />
                  {procesando ? 'Abriendo' : 'Ver'}
                </button>
                <button
                  className='inline-flex h-7 items-center gap-1 px-1.5 text-[6.7px] font-bold text-[#0879bf] transition hover:text-[#005d9a] disabled:cursor-not-allowed disabled:opacity-45 focus-visible:outline-2 focus-visible:outline-[#08aabb]'
                  disabled={accionDeshabilitada}
                  onClick={() => onDescargar(documento)}
                  title={documento.archivoDisponible ? 'Descargar documento' : 'Este registro no tiene un archivo adjunto'}
                  type='button'
                >
                  <IconoMedico className='h-[12px] w-[12px]' nombre='download' strokeWidth={1.7} />
                  Descargar
                </button>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}

export default DocumentosRecientesPacienteComp
