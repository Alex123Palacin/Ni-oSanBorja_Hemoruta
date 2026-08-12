import { useId, type ChangeEvent, type FormEvent } from 'react'

import IconoMedico from '../IconoMedico'

export type TipoDocumentoPacienteFormulario =
  | 'INFORME_MEDICO'
  | 'LABORATORIO'
  | 'OTRO'

export interface OpcionTipoDocumentoPaciente {
  etiqueta: string
  tipo: TipoDocumentoPacienteFormulario
  valor: string
}

export interface BorradorDocumentoPaciente {
  archivo: File | null
  descripcion: string
  fechaDocumento: string
  opcionTipo: string
}

interface CargaDocumentosPacienteCompProps {
  borrador: BorradorDocumentoPaciente
  error?: string
  guardando?: boolean
  onCambiar: (cambio: Partial<BorradorDocumentoPaciente>) => void
  onGuardar: () => void
  opcionesTipo: readonly OpcionTipoDocumentoPaciente[]
}

const FORMATOS_PERMITIDOS = '.pdf,.png,.jpg,.jpeg,image/png,image/jpeg,application/pdf'

function CargaDocumentosPacienteComp({
  borrador,
  error = '',
  guardando = false,
  onCambiar,
  onGuardar,
  opcionesTipo,
}: CargaDocumentosPacienteCompProps) {
  const idArchivo = useId()
  const idCamara = useId()
  const idDescripcion = useId()
  const idFecha = useId()

  function seleccionarArchivo(evento: ChangeEvent<HTMLInputElement>) {
    onCambiar({ archivo: evento.target.files?.[0] ?? null })
    evento.target.value = ''
  }

  function enviarFormulario(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    onGuardar()
  }

  return (
    <form
      className='rounded-[13px] border border-[#e2e9ef] bg-white p-2.5 shadow-[0_3px_12px_rgba(16,53,94,0.05)]'
      onSubmit={enviarFormulario}
    >
      <fieldset disabled={guardando}>
        <legend className='sr-only'>Seleccionar y guardar un documento</legend>

        <div className='rounded-[11px] border border-dashed border-[#9adfe1] bg-[#fbfefe] p-2'>
          <div className='grid grid-cols-2 gap-2'>
            <label
              className='flex h-[69px] cursor-pointer items-center justify-center gap-2 rounded-[10px] border border-[#b9dce7] bg-[#f4fbfd] px-2 text-[#008fa1] transition hover:border-[#00a9b2] hover:bg-[#eefafb] focus-within:outline-2 focus-within:outline-[#08aabb]'
              htmlFor={idCamara}
            >
              <IconoMedico className='h-8 w-8 shrink-0' nombre='scan' strokeWidth={1.7} />
              <span className='text-[8px] font-extrabold leading-[13px]'>Escanear<br />documento</span>
              <input
                accept='image/*'
                capture='environment'
                className='sr-only'
                id={idCamara}
                onChange={seleccionarArchivo}
                type='file'
              />
            </label>

            <label
              className='flex h-[69px] cursor-pointer items-center justify-center gap-2 rounded-[10px] border border-[#b9dce7] bg-[#f4f9ff] px-2 text-[#096ed4] transition hover:border-[#4da3ea] hover:bg-[#eef6ff] focus-within:outline-2 focus-within:outline-[#167bd9]'
              htmlFor={idArchivo}
            >
              <span className='grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#0877dc] text-white'>
                <IconoMedico className='h-[19px] w-[19px]' nombre='upload' strokeWidth={2.1} />
              </span>
              <span className='text-[8px] font-extrabold leading-[13px]'>Subir PDF<br />o imagen</span>
              <input
                accept={FORMATOS_PERMITIDOS}
                className='sr-only'
                id={idArchivo}
                onChange={seleccionarArchivo}
                type='file'
              />
            </label>
          </div>

          <p
            className={`mt-1.5 truncate text-center text-[6.8px] font-semibold ${
              borrador.archivo ? 'text-[#087f8c]' : 'text-[#70829b]'
            }`}
            title={borrador.archivo?.name}
          >
            {borrador.archivo?.name ?? 'PDF, PNG o JPG de hasta 15 MB'}
          </p>
        </div>

        <div className='mt-2.5'>
          <p className='text-[7px] font-bold text-[#476080]'>Tipo de documento</p>
          <div className='mt-1.5 grid grid-cols-4 gap-1.5'>
            {opcionesTipo.map((opcion) => {
              const seleccionado = borrador.opcionTipo === opcion.valor

              return (
                <button
                  aria-pressed={seleccionado}
                  className={`min-h-[31px] rounded-[7px] border px-1 text-[6.5px] font-semibold transition focus-visible:outline-2 focus-visible:outline-[#08aabb] ${
                    seleccionado
                      ? 'border-[#18b6bf] bg-[#effcfc] text-[#008c9d]'
                      : 'border-[#d6e0ea] bg-white text-[#4f6382] hover:border-[#8ed8dc]'
                  }`}
                  key={opcion.valor}
                  onClick={() => onCambiar({ opcionTipo: opcion.valor })}
                  type='button'
                >
                  {opcion.etiqueta}
                </button>
              )
            })}
          </div>
        </div>

        <div className='mt-2.5 grid grid-cols-[0.9fr_1.1fr] gap-2'>
          <label className='min-w-0' htmlFor={idFecha}>
            <span className='block text-[7px] font-bold text-[#476080]'>Fecha del resultado</span>
            <span className='mt-1.5 flex h-[37px] items-center rounded-[8px] border border-[#dce4ec] bg-white px-2 text-[#5e7391] focus-within:border-[#38b9c2] focus-within:ring-1 focus-within:ring-[#a9e5e7]'>
              <IconoMedico className='h-[14px] w-[14px] shrink-0' nombre='calendar' strokeWidth={1.6} />
              <input
                className='ml-1.5 min-w-0 flex-1 bg-transparent text-[6.7px] font-medium outline-none'
                id={idFecha}
                onChange={(evento) => onCambiar({ fechaDocumento: evento.target.value })}
                type='date'
                value={borrador.fechaDocumento}
              />
            </span>
          </label>

          <label className='min-w-0' htmlFor={idDescripcion}>
            <span className='block text-[7px] font-bold text-[#476080]'>Observación (opcional)</span>
            <input
              className='mt-1.5 h-[37px] w-full rounded-[8px] border border-[#dce4ec] bg-white px-2 text-[6.8px] font-medium text-[#17366f] outline-none placeholder:text-[#9aa9ba] focus:border-[#38b9c2] focus:ring-1 focus:ring-[#a9e5e7]'
              id={idDescripcion}
              maxLength={500}
              onChange={(evento) => onCambiar({ descripcion: evento.target.value })}
              placeholder='Escribe una nota...'
              type='text'
              value={borrador.descripcion}
            />
          </label>
        </div>

        {error && (
          <p className='mt-2 rounded-md bg-[#fff1f1] px-2 py-1 text-center text-[7px] font-semibold text-[#c43e45]' role='alert'>
            {error}
          </p>
        )}

        <button
          className='mt-2.5 flex h-[31px] w-full items-center justify-center gap-1.5 rounded-[8px] bg-gradient-to-r from-[#02a8ae] to-[#009da9] text-[8px] font-bold text-white shadow-[0_4px_10px_rgba(0,157,169,0.18)] transition hover:brightness-105 disabled:cursor-wait disabled:opacity-65 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#008c9b]'
          disabled={guardando}
          type='submit'
        >
          <IconoMedico className='h-[14px] w-[14px]' nombre='upload' strokeWidth={2} />
          {guardando ? 'Guardando...' : 'Guardar documento'}
        </button>
      </fieldset>
    </form>
  )
}

export default CargaDocumentosPacienteComp
