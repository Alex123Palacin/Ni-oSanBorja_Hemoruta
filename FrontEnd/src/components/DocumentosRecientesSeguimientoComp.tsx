import type { DocumentoSeguimientoPaciente } from '../types/SeguimientoPaciente'
import IconoMedico from './IconoMedico'

interface DocumentosRecientesSeguimientoCompProps {
  documentos: DocumentoSeguimientoPaciente[]
  limite?: number
  onVerDocumento: (documento: DocumentoSeguimientoPaciente) => void
  onVerTodos: () => void
}

function DocumentosRecientesSeguimientoComp({
  documentos,
  limite = 2,
  onVerDocumento,
  onVerTodos,
}: DocumentosRecientesSeguimientoCompProps) {
  return (
    <section className='rounded-xl border border-[#dce5ee] bg-white p-3 shadow-[0_2px_8px_rgba(18,52,91,0.04)]'>
      <h2 className='text-[10px] font-extrabold text-[#102e78]'>Documentos recientes</h2>
      <ul className='mt-2 divide-y divide-[#e4ebf1]'>
        {documentos.slice(0, limite).map((documento) => (
          <li className='flex min-h-7 items-center gap-2 py-1 text-[7px] text-[#415982]' key={documento.id}>
            <IconoMedico className='h-4 w-4 shrink-0 text-[#7258de]' nombre='file' />
            <span className='min-w-0 flex-1 truncate font-bold'>{documento.nombre}</span>
            <time className='shrink-0 text-[#5c7092]'>{documento.fecha}</time>
            <span className={`shrink-0 rounded-full px-2 py-1 font-bold ${
              documento.origen === 'WhatsApp'
                ? 'bg-[#e6f8eb] text-[#17a950]'
                : 'bg-[#e8f3ff] text-[#277bd9]'
            }`}>
              {documento.origen === 'App móvil' ? 'App' : documento.origen}
            </span>
            <button
              aria-label={`Ver ${documento.nombre}`}
              className='grid h-5 w-5 shrink-0 cursor-pointer place-items-center rounded text-[#1595b5] transition hover:bg-[#eaf8fa] focus-visible:outline-2 focus-visible:outline-[#08aabb]'
              onClick={() => onVerDocumento(documento)}
              type='button'
            >
              <IconoMedico className='h-3.5 w-3.5' nombre='eye' />
            </button>
          </li>
        ))}
      </ul>
      <button
        className='mt-2 flex h-8 w-full cursor-pointer items-center justify-center rounded-lg border border-[#08aabb] bg-white text-[8px] font-bold text-[#26709e] transition hover:bg-[#effafb] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#08aabb]'
        onClick={onVerTodos}
        type='button'
      >
        Ver todos los documentos
      </button>
    </section>
  )
}

export default DocumentosRecientesSeguimientoComp
