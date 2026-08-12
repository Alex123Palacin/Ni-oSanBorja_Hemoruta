import type { DetalleUsuarioHospitalarioApi } from '../../api/admin/AdminApi'
import IconoMedico, { type NombreIconoMedico } from '../IconoMedico'

interface DetalleCuentaAdminCompProps {
  usuario: DetalleUsuarioHospitalarioApi
}

function formatearFecha(fecha: string | null) {
  if (!fecha) return 'Sin registro'
  const valor = new Date(fecha)
  if (Number.isNaN(valor.getTime())) return fecha
  return new Intl.DateTimeFormat('es-PE', { dateStyle: 'medium', timeStyle: 'short' }).format(valor)
}

function DetalleCuentaAdminComp({ usuario }: DetalleCuentaAdminCompProps) {
  const iniciales = `${usuario.nombre.charAt(0)}${usuario.apellidos.charAt(0)}`.toUpperCase() || 'US'
  const filas: Array<{ etiqueta: string; icono: NombreIconoMedico; valor: string }> = [
    { etiqueta: 'DNI', icono: 'idCard', valor: usuario.documento || 'No registrado' },
    { etiqueta: 'Correo', icono: 'mail', valor: usuario.correo || 'No registrado' },
    { etiqueta: 'Teléfono', icono: 'phone', valor: usuario.telefono || 'No registrado' },
    { etiqueta: 'Último acceso', icono: 'clock', valor: formatearFecha(usuario.ultimoAccesoEn) },
  ]

  return (
    <article className='rounded-2xl border border-[#dbe5ed] bg-white p-5 shadow-[0_5px_18px_rgba(18,52,91,0.05)] sm:p-6'>
      <div className='flex flex-col gap-5 sm:flex-row sm:items-center'>
        <span className='grid h-24 w-24 shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#dcf7f5] to-[#dceeff] text-2xl font-black text-[#078f9e]'>
          {iniciales}
        </span>
        <div className='min-w-0 flex-1'>
          <div className='flex flex-wrap items-center gap-2'>
            <h2 className='text-[clamp(20px,2vw,27px)] font-extrabold text-[#082767]'>{usuario.nombreCompleto}</h2>
            <span className='rounded-full bg-[#e8f7ec] px-3 py-1 text-[9px] font-extrabold text-[#19954e]'>
              {usuario.estado}
            </span>
          </div>
          <p className='mt-1 text-[11px] font-semibold text-[#6b7c98]'>Cuenta {usuario.rol.toLowerCase()}</p>
          <dl className='mt-5 grid gap-3 sm:grid-cols-2'>
            {filas.map((fila) => (
              <div className='flex min-w-0 items-start gap-3 rounded-xl bg-[#f8fbfd] p-3' key={fila.etiqueta}>
                <IconoMedico className='mt-0.5 h-4 w-4 shrink-0 text-[#079fad]' nombre={fila.icono} />
                <div className='min-w-0'>
                  <dt className='text-[9px] font-bold text-[#71819b]'>{fila.etiqueta}</dt>
                  <dd className='mt-0.5 break-words text-[11px] font-semibold text-[#263f6d]'>{fila.valor}</dd>
                </div>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </article>
  )
}

export default DetalleCuentaAdminComp
