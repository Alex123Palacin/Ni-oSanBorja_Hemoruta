import type { DocumentoFichaPaciente } from '../../types/FichaPaciente'
import IconoMedico from '../IconoMedico'
import ModalFichaPacienteComp from './ModalFichaPacienteComp'

export interface VistaPreviaDocumentoPaciente {
  nombre: string
  tipoMime: string
  url: string
}

interface DocumentosPacienteModalCompProps {
  documentos: readonly DocumentoFichaPaciente[]
  error?: string
  nombrePaciente: string
  onCerrar: () => void
  onCerrarVistaPrevia: () => void
  onDescargar: (documento: DocumentoFichaPaciente) => void
  onVer: (documento: DocumentoFichaPaciente) => void
  procesando?: boolean
  procesandoId?: string
  vistaPrevia: VistaPreviaDocumentoPaciente | null
}

function DocumentosPacienteModalComp({
  documentos,
  error,
  nombrePaciente,
  onCerrar,
  onCerrarVistaPrevia,
  onDescargar,
  onVer,
  procesando,
  procesandoId,
  vistaPrevia,
}: DocumentosPacienteModalCompProps) {
  return (
    <ModalFichaPacienteComp
      descripcion={`Archivos enviados por la familia y documentos médicos de ${nombrePaciente}.`}
      onCerrar={onCerrar}
      titulo='Documentos del paciente'
    >
      {vistaPrevia ? (
        <section>
          <div className='mb-3 flex items-center justify-between gap-3'>
            <button className='inline-flex h-9 items-center gap-2 rounded-lg border border-[#d6e1ec] bg-white px-3 text-[10px] font-bold text-[#38517f]' onClick={onCerrarVistaPrevia} type='button'>
              <IconoMedico className='h-4 w-4' nombre='arrowLeft' /> Volver a documentos
            </button>
            <strong className='min-w-0 truncate text-[11px] text-[#0a2b79]'>{vistaPrevia.nombre}</strong>
          </div>
          {vistaPrevia.tipoMime.startsWith('image/') ? (
            <div className='grid min-h-[360px] place-items-center overflow-hidden rounded-xl border border-[#dce5ee] bg-[#f2f6f9] p-3'>
              <img alt={`Vista previa de ${vistaPrevia.nombre}`} className='max-h-[58dvh] max-w-full object-contain' src={vistaPrevia.url} />
            </div>
          ) : (
            <iframe className='h-[min(58dvh,560px)] w-full rounded-xl border border-[#dce5ee] bg-white' src={vistaPrevia.url} title={`Vista previa de ${vistaPrevia.nombre}`} />
          )}
        </section>
      ) : (
        <>
          {procesando && <div className='grid min-h-48 place-items-center' role='status'><span className='h-8 w-8 animate-spin rounded-full border-4 border-[#d8f1f3] border-t-[#08aabb]' /></div>}
          {!procesando && error && <p className='rounded-xl border border-[#ffd9d9] bg-[#fff6f6] p-4 text-[11px] font-semibold text-[#bd3544]' role='alert'>{error}</p>}
          {!procesando && !error && documentos.length === 0 && (
            <div className='grid min-h-52 place-items-center rounded-2xl border border-dashed border-[#cbdce7] bg-white text-center'>
              <div><IconoMedico className='mx-auto h-10 w-10 text-[#7fa6bb]' nombre='file' /><p className='mt-3 text-[12px] font-extrabold text-[#173478]'>Sin documentos cargados</p></div>
            </div>
          )}
          {!procesando && !error && documentos.length > 0 && (
            <ul className='grid gap-3 sm:grid-cols-2'>
              {documentos.map((documento) => (
                <li className='rounded-2xl border border-[#dce5ee] bg-white p-4 shadow-[0_3px_10px_rgba(18,52,91,.04)]' key={documento.id ?? documento.nombre}>
                  <div className='flex items-start gap-3'>
                    <span className='grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#fff2e9] text-[#f17224]'><IconoMedico className='h-6 w-6' nombre='file' /></span>
                    <div className='min-w-0 flex-1'><strong className='block truncate text-[11px] text-[#0a2b79]'>{documento.nombre}</strong><p className='mt-1 text-[9px] text-[#6a7d99]'>{documento.fecha || 'Sin fecha'} · {documento.formato}</p><span className={`mt-2 inline-block rounded-full px-2 py-0.5 text-[8px] font-extrabold ${documento.estado === 'PENDIENTE' ? 'bg-[#fff4df] text-[#ae7111]' : 'bg-[#e8f7ed] text-[#178348]'}`}>{documento.estado === 'PENDIENTE' ? 'Pendiente de revisión' : 'Disponible'}</span></div>
                  </div>
                  <div className='mt-4 grid grid-cols-2 gap-2'>
                    <button className='inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-[#b8dce7] text-[9px] font-bold text-[#078ca2] disabled:opacity-50' disabled={!documento.archivoDisponible || procesandoId === documento.id} onClick={() => onVer(documento)} type='button'><IconoMedico className='h-4 w-4' nombre='eye' />Ver</button>
                    <button className='inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-[#079eab] text-[9px] font-bold text-white disabled:opacity-50' disabled={!documento.archivoDisponible || procesandoId === documento.id} onClick={() => onDescargar(documento)} type='button'><IconoMedico className='h-4 w-4' nombre='download' />Descargar</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </ModalFichaPacienteComp>
  )
}

export default DocumentosPacienteModalComp
