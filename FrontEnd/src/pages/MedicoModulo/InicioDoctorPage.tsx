import { Link } from 'react-router-dom'

import useAuth from '../../auth/useAuth'
import GestionCuentaComp from '../../components/GestionCuentaComp'
import HeaderDoctorMedicoComp from '../../components/HeaderDoctorMedicoComp'
import IconoMedico from '../../components/IconoMedico'
import MenuMedicoComp from '../../components/MenuMedicoComp'

const accesos = [
  { descripcion: 'Consulta y administra las fichas del hospital.', icono: 'users' as const, ruta: '/doctor/pacientes', titulo: 'Ver pacientes' },
  { descripcion: 'Revisa alertas, síntomas y adherencia.', icono: 'activity' as const, ruta: '/doctor/seguimiento', titulo: 'Seguimiento' },
  { descripcion: 'Registra y habilita una nueva cuenta.', icono: 'plusCircle' as const, ruta: '/doctor/nuevoRegistro', titulo: 'Nuevo paciente' },
]

function InicioDoctorPage() {
  const { usuario } = useAuth()
  const nombre = usuario?.nombreCompleto || usuario?.nombre || 'Médico'

  return (
    <div className='flex min-h-dvh bg-[#f8fbfd] text-[#0b2b70]'>
      <MenuMedicoComp />
      <div className='min-w-0 flex-1'>
        <HeaderDoctorMedicoComp especialidad={usuario?.especialidad || 'Hematología pediátrica'} nombre={nombre} variante='amplia' />
        <main className='mx-auto w-full max-w-[1220px] px-4 pb-24 pt-6 sm:px-6 xl:px-8'>
          <section className='relative overflow-hidden rounded-[24px] border border-[#dce8ee] bg-gradient-to-r from-[#eafafa] via-white to-[#edf4ff] px-6 py-7 shadow-[0_12px_35px_rgba(21,68,97,0.07)] sm:px-8'>
            <span aria-hidden='true' className='absolute -right-16 -top-20 h-64 w-64 rounded-full bg-[#0aabb4]/10' />
            <div className='relative max-w-[720px]'>
              <p className='text-[11px] font-black uppercase tracking-[0.15em] text-[#079da8]'>Panel médico</p>
              <h1 className='mt-2 text-[clamp(27px,3vw,40px)] font-black tracking-[-0.04em] text-[#08286f]'>
                Hola, {usuario?.nombre || 'doctor'}
              </h1>
              <p className='mt-2 max-w-[620px] text-[clamp(11px,1.1vw,14px)] font-medium leading-6 text-[#526b8d]'>
                Accede a tus herramientas clínicas y administra tu cuenta desde un solo lugar.
              </p>
            </div>
          </section>

          <section className='mt-5 grid gap-3 md:grid-cols-3'>
            {accesos.map((acceso) => (
              <Link className='group rounded-2xl border border-[#dce7ee] bg-white p-5 shadow-[0_8px_22px_rgba(23,57,92,0.05)] transition hover:-translate-y-0.5 hover:border-[#8bd6da]' key={acceso.ruta} to={acceso.ruta}>
                <span className='grid h-11 w-11 place-items-center rounded-2xl bg-[#e9f9f9] text-[#079eaa] transition group-hover:bg-[#08aab3] group-hover:text-white'>
                  <IconoMedico className='h-6 w-6' nombre={acceso.icono} />
                </span>
                <h2 className='mt-3 text-[14px] font-black text-[#0a2b70]'>{acceso.titulo}</h2>
                <p className='mt-1 text-[10px] font-medium leading-4 text-[#687b98]'>{acceso.descripcion}</p>
              </Link>
            ))}
          </section>

          <div className='mt-5'>
            <GestionCuentaComp />
          </div>
        </main>
      </div>
    </div>
  )
}

export default InicioDoctorPage
