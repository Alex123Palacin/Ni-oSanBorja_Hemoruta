import { Link } from 'react-router-dom'

import useAuth from '../../auth/useAuth'
import GestionCuentaComp from '../../components/GestionCuentaComp'
import HeaderAdminComp from '../../components/HeaderAdminComp'
import IconoMedico from '../../components/IconoMedico'

function InicioAdminPage() {
  const { usuario } = useAuth()

  return (
    <div className='min-h-dvh bg-[#f8fbfd] text-[#0b2b70]'>
        <HeaderAdminComp />
        <main className='mx-auto w-full max-w-[1180px] px-4 pb-24 pt-6 sm:px-6 lg:px-8'>
          <section className='relative overflow-hidden rounded-[24px] border border-[#dbe7ee] bg-gradient-to-r from-[#edfafa] via-white to-[#f0f5ff] px-6 py-7 shadow-[0_12px_35px_rgba(21,68,97,0.07)] sm:px-8'>
            <span aria-hidden='true' className='absolute -right-16 -top-20 h-64 w-64 rounded-full bg-[#2478e5]/10' />
            <div className='relative'>
              <p className='text-[11px] font-black uppercase tracking-[0.15em] text-[#079da8]'>Administración hospitalaria</p>
              <h1 className='mt-2 text-[clamp(27px,3vw,40px)] font-black tracking-[-0.04em] text-[#08286f]'>
                Bienvenido, {usuario?.nombre || 'administrador'}
              </h1>
              <p className='mt-2 max-w-[650px] text-[clamp(11px,1.1vw,14px)] font-medium leading-6 text-[#526b8d]'>
                Gestiona las cuentas del personal y de las familias, o actualiza la seguridad de tu propia cuenta.
              </p>
            </div>
          </section>

          <section className='mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3'>
            <Link className='group flex items-center gap-4 rounded-2xl border border-[#dce7ee] bg-white p-5 shadow-[0_8px_22px_rgba(23,57,92,0.05)] transition hover:border-[#8bd6da]' to='/admin/UsuariosHospitalarios'>
              <span className='grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#e9f9f9] text-[#079eaa] group-hover:bg-[#08aab3] group-hover:text-white'>
                <IconoMedico className='h-6 w-6' nombre='users' />
              </span>
              <span><strong className='block text-[14px] font-black text-[#0a2b70]'>Usuarios hospitalarios</strong><span className='mt-1 block text-[10px] text-[#687b98]'>Consulta y administra todas las cuentas.</span></span>
            </Link>
            <Link className='group flex items-center gap-4 rounded-2xl border border-[#dce7ee] bg-white p-5 shadow-[0_8px_22px_rgba(23,57,92,0.05)] transition hover:border-[#8bd6da]' to='/admin/CrearUs'>
              <span className='grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#edf4ff] text-[#2676e8] group-hover:bg-[#2676e8] group-hover:text-white'>
                <IconoMedico className='h-6 w-6' nombre='plusCircle' />
              </span>
              <span><strong className='block text-[14px] font-black text-[#0a2b70]'>Crear nueva cuenta</strong><span className='mt-1 block text-[10px] text-[#687b98]'>Registra administradores, médicos o pacientes.</span></span>
            </Link>
            <Link className='group flex items-center gap-4 rounded-2xl border border-[#dce7ee] bg-white p-5 shadow-[0_8px_22px_rgba(23,57,92,0.05)] transition hover:border-[#8bd6da]' to='/admin/clinica-dia'>
              <span className='grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#e9f9f9] text-[#079da8] group-hover:bg-[#079da8] group-hover:text-white'>
                <IconoMedico className='h-6 w-6' nombre='calendar' />
              </span>
              <span><strong className='block text-[14px] font-black text-[#0a2b70]'>Clínica de Día</strong><span className='mt-1 block text-[10px] text-[#687b98]'>Programa pacientes, turnos, camas y recordatorios.</span></span>
            </Link>
          </section>

          <div className='mt-5'>
            <GestionCuentaComp />
          </div>
        </main>
    </div>
  )
}

export default InicioAdminPage
