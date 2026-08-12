import type { DocumentoFichaPaciente } from '../../types/FichaPaciente'
import IconoMedico from '../IconoMedico'
import BotonSecundarioComp from './BotonSecundarioComp'

interface TarjetaDocumentosCompProps {
  documentos: readonly DocumentoFichaPaciente[]
  onDescargar?: (documento: DocumentoFichaPaciente) => void
  onVer?: (documento: DocumentoFichaPaciente) => void
  onVerTodos?: () => void
  procesandoId?: string
}

function TarjetaDocumentosComp({
  documentos,
  onDescargar,
  onVer,
  onVerTodos,
  procesandoId,
}: TarjetaDocumentosCompProps) {
  return (
    <article className='flex min-h-[166px] flex-col rounded-xl border border-[#dce5ee] bg-white p-4 shadow-[0_3px_10px_rgba(18,52,91,0.06)] md:col-span-2 xl:col-span-1'>
      <h2 className='text-[12px] font-extrabold text-[#f17224]'>Documentos recientes</h2>
      <ul className='mt-1 flex-1 divide-y divide-[#e3eaf1]'>
        {documentos.length === 0 && (
          <li className='flex h-[70px] items-center justify-center text-center text-[9px] font-medium text-[#74849e]'>
            Aún no hay documentos cargados para este paciente.
          </li>
        )}
        {documentos.map((documento) => (
          <li className='flex items-center gap-1' key={documento.id ?? documento.nombre}>
            <button
              className='flex h-[31px] min-w-0 flex-1 cursor-pointer items-center gap-2 rounded text-left text-[9px] text-[#3e5680] transition hover:bg-[#fff9f5] focus-visible:outline-2 focus-visible:outline-[#ff772c] disabled:cursor-default disabled:opacity-60'
              disabled={!documento.id || !documento.archivoDisponible || procesandoId === documento.id}
              onClick={() => onVer?.(documento)}
              type='button'
            >
              <IconoMedico className='h-[18px] w-[18px] shrink-0 text-[#ff772c]' nombre='file' />
              <span className='min-w-0 flex-1 truncate'>
                {documento.nombre} {documento.fecha && <span>{documento.fecha}</span>}
              </span>
              {documento.estado === 'PENDIENTE' && (
                <span className='rounded-full bg-[#fff4df] px-1.5 py-0.5 text-[6px] font-extrabold text-[#b27616]'>Nuevo</span>
              )}
              <span className='font-bold text-[#536a91]'>{procesandoId === documento.id ? 'Abriendo…' : documento.formato}</span>
              <IconoMedico className='h-3.5 w-3.5 -rotate-90 text-[#536a91]' nombre='chevronDown' />
            </button>
            {documento.id && documento.archivoDisponible && (
              <button
                aria-label={`Descargar ${documento.nombre}`}
                className='grid h-7 w-7 shrink-0 place-items-center rounded-md text-[#1687ba] transition hover:bg-[#eef9fb] focus-visible:outline-2 focus-visible:outline-[#08aabb] disabled:opacity-50'
                disabled={procesandoId === documento.id}
                onClick={() => onDescargar?.(documento)}
                type='button'
              >
                <IconoMedico className='h-3.5 w-3.5' nombre='download' strokeWidth={1.8} />
              </button>
            )}
          </li>
        ))}
      </ul>
      <BotonSecundarioComp onClick={onVerTodos}>Ver todos los documentos</BotonSecundarioComp>
    </article>
  )
}

export default TarjetaDocumentosComp
