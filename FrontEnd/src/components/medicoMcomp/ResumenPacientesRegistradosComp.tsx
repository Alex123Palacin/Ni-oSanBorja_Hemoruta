import IconoPacientesRegistradosComp from './IconoPacientesRegistradosComp'

interface ResumenPacientesRegistradosCompProps {
  totalPacientes: number
}

function ResumenPacientesRegistradosComp({ totalPacientes }: ResumenPacientesRegistradosCompProps) {
  return (
    <section
      aria-label={`${totalPacientes} pacientes del hospital`}
      className='mt-5 flex h-[108px] w-[320px] max-w-full items-center gap-5 rounded-xl border border-[#d8e8ef] bg-gradient-to-r from-[#f7fcfd] to-[#f3fafc] px-5 shadow-[0_2px_6px_rgba(18,52,91,0.04)]'
    >
      <span className='grid h-[68px] w-[68px] shrink-0 place-items-center rounded-full bg-[#ddf4f5] text-[#079daf]'>
        <IconoPacientesRegistradosComp />
      </span>
      <div>
        <span className='block text-[11px] font-bold text-[#079daf]'>Pacientes del hospital</span>
        <strong className='block text-[32px] font-extrabold leading-9 text-[#0a2b79]'>{totalPacientes}</strong>
        <span className='text-[9px] font-medium text-[#50658a]'>Total disponible para atención</span>
      </div>
    </section>
  )
}

export default ResumenPacientesRegistradosComp
