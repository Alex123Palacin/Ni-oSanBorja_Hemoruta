import IconoMedico from '../IconoMedico'

function EstadoVacioPanelComp() {
  return (
    <div className='flex h-full min-h-[420px] translate-y-5 flex-col items-center justify-center px-5 text-center'>
      <h2 className='text-[15px] font-extrabold text-[#082c80]'>Selecciona un paciente</h2>

      <div aria-hidden='true' className='relative my-7 h-[174px] w-[210px]'>
        <span className='absolute bottom-2 left-1 h-[72px] w-9 -rotate-12 rounded-[50%] bg-[#dff4ef]' />
        <span className='absolute bottom-2 left-8 h-12 w-4 rotate-[26deg] rounded-[50%] bg-[#a9ded2]' />
        <span className='absolute bottom-3 right-0 h-14 w-14 rounded-full bg-[#e7f3fb]' />
        <span className='absolute left-4 top-12 h-4 w-4 rounded-full bg-[#e7f1fa]' />
        <span className='absolute right-4 top-14 h-5 w-5 rounded-full bg-[#dff4ef]' />

        <span className='absolute left-1/2 top-3 h-[145px] w-[100px] -translate-x-1/2 rounded-[10px] border-[6px] border-[#b7d5eb] bg-white shadow-[0_7px_12px_rgba(47,88,130,0.08)]'>
          <span className='absolute -top-[14px] left-1/2 h-6 w-12 -translate-x-1/2 rounded-t-lg rounded-b-sm bg-[#5a6f9f]'>
            <span className='absolute left-1/2 top-1 h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-white/80' />
          </span>
          <span className='absolute left-3 top-8 h-10 w-10 rounded-lg bg-[#e8f5fb]'>
            <span className='absolute left-1/2 top-1.5 h-3 w-3 -translate-x-1/2 rounded-full bg-[#109caf]' />
            <span className='absolute bottom-1.5 left-1/2 h-3.5 w-6 -translate-x-1/2 rounded-t-full bg-[#109caf]' />
          </span>
          <span className='absolute right-3 top-10 h-1.5 w-7 rounded-full bg-[#d5e4ef]' />
          <span className='absolute right-3 top-[53px] h-1.5 w-5 rounded-full bg-[#e4edf4]' />
          <span className='absolute left-3 right-3 top-[84px] h-1.5 rounded-full bg-[#d5e4ef]' />
          <span className='absolute left-3 right-6 top-[99px] h-1.5 rounded-full bg-[#dce8f1]' />
          <span className='absolute left-3 right-8 top-[114px] h-1.5 rounded-full bg-[#e6eef5]' />
        </span>

        <span className='absolute bottom-0 right-5 grid h-[62px] w-[62px] place-items-center rounded-full border-[6px] border-[#526a9b] bg-white/95 text-[#526a9b] shadow-sm'>
          <IconoMedico className='h-8 w-8' nombre='search' strokeWidth={2.1} />
        </span>
      </div>

      <p className='max-w-[235px] text-[11px] font-medium leading-[18px] text-[#52688d]'>
        Elige un paciente para ver su seguimiento consolidado, adherencia, síntomas y documentos.
      </p>
    </div>
  )
}

export default EstadoVacioPanelComp
