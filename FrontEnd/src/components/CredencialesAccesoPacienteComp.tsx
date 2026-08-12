import type { CredencialesTemporalesPaciente } from '../types/NuevoPaciente'
import IconoMedico from './IconoMedico'

interface CredencialesAccesoPacienteCompProps {
  credenciales: CredencialesTemporalesPaciente
  compacto?: boolean
}

function CredencialesAccesoPacienteComp({ credenciales, compacto = false }: CredencialesAccesoPacienteCompProps) {
  return (
    <section className={`rounded-xl border border-[#b9e5ed] bg-[#f4fcfe] ${compacto ? 'p-3' : 'p-4'}`}>
      <div className='flex items-start gap-2.5'>
        <span className='grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#dff6f8] text-[#079caf]'>
          <IconoMedico className='h-4 w-4' nombre='lock' strokeWidth={2} />
        </span>
        <div className='min-w-0 flex-1'>
          <h3 className='text-[11px] font-extrabold text-[#123278]'>Credenciales temporales de acceso</h3>
          <p className='mt-0.5 text-[8px] leading-[12px] text-[#50688f]'>
            Entrégalas a la familia de forma presencial. La contraseña debe cambiarse al iniciar sesión.
          </p>
        </div>
      </div>
      <dl className='mt-3 grid gap-2 sm:grid-cols-2'>
        <div className='rounded-lg border border-[#d2e8ee] bg-white px-3 py-2'>
          <dt className='text-[8px] font-bold uppercase tracking-wide text-[#607596]'>Usuario</dt>
          <dd className='mt-0.5 break-all text-[11px] font-extrabold text-[#123278]'>{credenciales.usuario}</dd>
        </div>
        <div className='rounded-lg border border-[#d2e8ee] bg-white px-3 py-2'>
          <dt className='text-[8px] font-bold uppercase tracking-wide text-[#607596]'>Contraseña temporal</dt>
          <dd className='mt-0.5 break-all font-mono text-[11px] font-extrabold text-[#123278]'>
            {credenciales.contrasenaTemporal}
          </dd>
        </div>
      </dl>
    </section>
  )
}

export default CredencialesAccesoPacienteComp
