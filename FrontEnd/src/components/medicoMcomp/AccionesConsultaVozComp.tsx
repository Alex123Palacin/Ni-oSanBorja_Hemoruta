import IconoMedico from '../IconoMedico'

interface AccionesConsultaVozCompProps {
  deshabilitado?: boolean
  editando?: boolean
  guardando?: boolean
  mensajeAccion: string
  notaAsistencia: string
  onCancelar: () => void
  onEditar: () => void
  onGuardar: () => void
}

function AccionesConsultaVozComp({
  deshabilitado = false,
  editando = false,
  guardando = false,
  mensajeAccion,
  notaAsistencia,
  onCancelar,
  onEditar,
  onGuardar,
}: AccionesConsultaVozCompProps) {
  return (
    <footer className='mt-3 flex w-full flex-col gap-3 rounded-xl bg-white sm:-mx-5 sm:w-[calc(100%+40px)] sm:flex-row sm:items-center'>
      <div className='flex min-h-9 min-w-0 flex-1 items-center gap-2 rounded-lg border border-[#d7e8f7] bg-[#eff7ff] px-3 text-[8px] font-medium leading-[12px] text-[#365989]'>
        <IconoMedico className='h-5 w-5 shrink-0 text-[#277bd9]' nombre='info' strokeWidth={1.8} />
        {notaAsistencia}
      </div>

      <div className='flex flex-wrap justify-end gap-2'>
        <button
          className='flex h-9 min-w-[150px] cursor-pointer items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#08aabc] to-[#078da9] px-4 text-[10px] font-extrabold text-white shadow-sm transition hover:brightness-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#08aabb] disabled:cursor-not-allowed disabled:opacity-55'
          disabled={deshabilitado || guardando}
          onClick={onGuardar}
          type='button'
        >
          <IconoMedico className='h-5 w-5' nombre='save' strokeWidth={1.8} />
          {guardando ? 'Guardando...' : 'Guardar consulta'}
        </button>
        <button
          className='flex h-9 min-w-[136px] cursor-pointer items-center justify-center gap-2 rounded-lg border border-[#d8e2ec] bg-white px-4 text-[10px] font-bold text-[#36558d] transition hover:bg-[#f8fbfd] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#08aabb] disabled:cursor-not-allowed disabled:opacity-50'
          disabled={deshabilitado || editando}
          onClick={onEditar}
          type='button'
        >
          <IconoMedico className='h-5 w-5 text-[#315da1]' nombre='edit' strokeWidth={1.8} />
          {editando ? 'Contenido editable' : 'Editar contenido'}
        </button>
        <button
          className='h-9 min-w-[90px] cursor-pointer rounded-lg border border-[#d8e2ec] bg-white px-4 text-[10px] font-bold text-[#36558d] transition hover:bg-[#f8fbfd] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#08aabb]'
          onClick={onCancelar}
          type='button'
        >
          Cancelar
        </button>
      </div>
      <p aria-live='polite' className='sr-only'>{mensajeAccion}</p>
    </footer>
  )
}

export default AccionesConsultaVozComp
