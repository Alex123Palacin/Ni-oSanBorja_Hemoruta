import IconoMedico from '../IconoMedico'

interface NotaDocumentosPacienteCompProps {
  descripcion: string
  titulo: string
}

function NotaDocumentosPacienteComp({ descripcion, titulo }: NotaDocumentosPacienteCompProps) {
  return (
    <aside className='relative flex min-h-[55px] items-center overflow-hidden rounded-[11px] border border-[#d8e7f4] bg-[#f2f8ff] px-2.5 py-2 pr-[52px]' role='note'>
      <span className='grid h-7 w-7 shrink-0 place-items-center rounded-full border border-[#86b9e9] bg-white text-[#2475d2]'>
        <IconoMedico className='h-4 w-4' nombre='info' strokeWidth={1.8} />
      </span>
      <div className='ml-2 min-w-0'>
        <strong className='block text-[7.5px] font-extrabold text-[#17366f]'>{titulo}</strong>
        <p className='mt-0.5 text-[6.5px] font-medium leading-[9px] text-[#526d92]'>{descripcion}</p>
      </div>
      <span className='absolute -bottom-1 right-2 grid h-[39px] w-[34px] place-items-center rounded-[55%_55%_48%_48%] bg-[#08adb4] text-white shadow-[0_3px_8px_rgba(0,151,162,0.2)]'>
        <IconoMedico className='h-[23px] w-[23px]' nombre='droplet' strokeWidth={1.45} />
      </span>
    </aside>
  )
}

export default NotaDocumentosPacienteComp
