import { Link, useParams } from 'react-router-dom'

import DetalleCuentaAdminComp from '../../components/adminMcomp/DetalleCuentaAdminComp'
import DetalleMedicoAdminComp from '../../components/adminMcomp/DetalleMedicoAdminComp'
import FichaPacienteAdminComp from '../../components/adminMcomp/FichaPacienteAdminComp'
import IconoMedico from '../../components/IconoMedico'
import useAuth from '../../auth/useAuth'
import useDetalleUsuarioAdmin from '../../hooks/useDetalleUsuarioAdmin'

function DetalleUsuarioHospitalarioPage() {
  const { usuarioId } = useParams<{ usuarioId: string }>()
  const { cargando, detalle, error, recargar } = useDetalleUsuarioAdmin(usuarioId)
  const { usuario: administrador } = useAuth()

  return (
    <div className='min-h-dvh bg-[#fbfdff] text-[#0b2b69]'>
        <header className='flex min-h-[54px] items-center justify-end border-b border-[#dce5ee] bg-white px-4 sm:px-6 lg:px-8'>
          <div className='flex items-center gap-2'>
            <span className='grid h-10 w-10 place-items-center overflow-hidden rounded-full border-2 border-[#d8e5ed] bg-gradient-to-b from-[#f5d7c8] to-[#efb494] text-[11px] font-black text-[#087f91]'>
              {administrador?.fotoPerfil ? (
                <img alt={`Foto de ${administrador.nombre}`} className='h-full w-full object-cover' src={administrador.fotoPerfil} />
              ) : (
                <span aria-hidden='true'>{(administrador?.nombre || 'A').charAt(0).toUpperCase()}</span>
              )}
            </span>
            <span className='hidden min-w-0 sm:block'>
              <strong className='block max-w-48 truncate text-[11px] font-extrabold text-[#09286c]'>
                {administrador?.nombre || 'Administrador general'}
              </strong>
              <span className='block text-[8px] font-semibold text-[#657895]'>Administrador general</span>
            </span>
            <IconoMedico className='h-4 w-4 text-[#173b91]' nombre='chevronDown' />
          </div>
        </header>

        <main className='mx-auto w-full max-w-[1280px] px-4 pb-24 pt-4 sm:px-6 lg:px-8'>
          <Link
            className='mb-3 inline-flex items-center gap-2 text-[10px] font-bold text-[#0798a6] transition hover:text-[#066f80]'
            to='/admin/UsuariosHospitalarios'
          >
            <IconoMedico className='h-4 w-4' nombre='arrowLeft' />
            Usuarios hospitalarios
          </Link>
          <div className='flex flex-wrap items-start justify-between gap-4'>
            <div>
              <h1 className='text-[clamp(25px,2.5vw,36px)] font-black tracking-[-0.035em] text-[#082767]'>
                Detalle de usuario hospitalario
              </h1>
              <p className='mt-1 text-[11px] text-[#657894]'>
                Información detallada y estado de activación de la cuenta del usuario.
              </p>
            </div>
            <Link
              className='flex h-10 items-center gap-2 rounded-xl bg-gradient-to-r from-[#09afb1] to-[#00999f] px-4 text-[10px] font-bold text-white shadow-sm transition hover:brightness-105'
              to='/admin/CrearUs'
            >
              <IconoMedico className='h-4 w-4' nombre='plusCircle' />
              Nuevo usuario
            </Link>
          </div>

          {cargando && (
            <section aria-live='polite' className='mt-6 grid min-h-80 place-items-center rounded-2xl border border-[#dce5ee] bg-white' role='status'>
              <div className='text-center'>
                <span className='mx-auto block h-10 w-10 animate-spin rounded-full border-4 border-[#daf2f4] border-t-[#08aabb]' />
                <p className='mt-3 text-xs font-semibold text-[#50698e]'>Cargando usuario…</p>
              </div>
            </section>
          )}

          {!cargando && error && (
            <section className='mt-6 rounded-2xl border border-[#f0cbd1] bg-[#fff8f8] p-7 text-center' role='alert'>
              <IconoMedico className='mx-auto h-9 w-9 text-[#d34454]' nombre='alertTriangle' />
              <h2 className='mt-3 text-sm font-extrabold text-[#8d2634]'>No se pudo cargar el usuario</h2>
              <p className='mt-1 text-[11px] text-[#855763]'>{error}</p>
              <div className='mt-4 flex flex-wrap justify-center gap-3'>
                <button
                  className='h-9 cursor-pointer rounded-xl bg-[#0a9fac] px-4 text-[10px] font-bold text-white'
                  onClick={recargar}
                  type='button'
                >
                  Reintentar
                </button>
                <Link className='grid h-9 place-items-center rounded-xl border border-[#d8e2ea] bg-white px-4 text-[10px] font-bold text-[#345078]' to='/admin/UsuariosHospitalarios'>
                  Volver al listado
                </Link>
              </div>
            </section>
          )}

          {!cargando && detalle?.tipoDetalle === 'MEDICO' && detalle.detalleMedico && (
            <div className='mt-6'>
              <DetalleMedicoAdminComp detalle={detalle.detalleMedico} usuario={detalle.usuario} />
            </div>
          )}

          {!cargando && detalle && detalle.tipoDetalle !== 'MEDICO' && (
            <div className='mt-6 space-y-4'>
              <DetalleCuentaAdminComp usuario={detalle.usuario} />

              {detalle.tipoDetalle === 'PACIENTE' && <FichaPacienteAdminComp pacientes={detalle.pacientes} />}

              {detalle.tipoDetalle === 'ADMINISTRADOR' && (
                <section className='rounded-2xl border border-[#dbe5ed] bg-white p-6 shadow-[0_5px_18px_rgba(18,52,91,0.05)]'>
                  <h2 className='flex items-center gap-2 text-sm font-extrabold text-[#082767]'>
                    <IconoMedico className='h-5 w-5 text-[#8a50d0]' nombre='shield' />
                    Permisos administrativos
                  </h2>
                  <p className='mt-3 max-w-2xl text-[11px] leading-5 text-[#627592]'>
                    Esta cuenta administra usuarios y datos operativos. Desde esta interfaz no se muestran diagnósticos, tratamientos ni seguimiento clínico de pacientes.
                  </p>
                </section>
              )}
            </div>
          )}
        </main>
    </div>
  )
}

export default DetalleUsuarioHospitalarioPage
