import type {
  DetalleMedicoAdministrativoApi,
  DetalleUsuarioHospitalarioApi,
} from '../../api/admin/AdminApi'
import IconoMedico, { type NombreIconoMedico } from '../IconoMedico'

interface DetalleMedicoAdminCompProps {
  detalle: DetalleMedicoAdministrativoApi
  usuario: DetalleUsuarioHospitalarioApi
}

interface GraficoLineaCompProps {
  datos: DetalleMedicoAdministrativoApi['consultasPorSemana']
}

function formatearFecha(fecha: string | null) {
  if (!fecha) return 'Sin registro'
  const valor = new Date(fecha)
  if (Number.isNaN(valor.getTime())) return fecha
  return new Intl.DateTimeFormat('es-PE', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(valor)
}

function nombreConTitulo(nombre: string) {
  return /^(dr|dra)\./i.test(nombre.trim()) ? nombre : `Dr. ${nombre}`
}

function GraficoLineaComp({ datos }: GraficoLineaCompProps) {
  const valores = datos.length > 0 ? datos : [{ semanaDesde: '', total: 0 }]
  const maximo = Math.max(1, ...valores.map((item) => item.total))
  const ancho = 420
  const alto = 145
  const margenX = 28
  const margenY = 20
  const anchoUtil = ancho - margenX * 2
  const altoUtil = alto - margenY * 2
  const puntos = valores
    .map((item, indice) => {
      const x =
        valores.length === 1
          ? ancho / 2
          : margenX + (indice / (valores.length - 1)) * anchoUtil
      const y = margenY + altoUtil - (item.total / maximo) * altoUtil
      return `${x},${y}`
    })
    .join(' ')

  return (
    <div className='min-w-0 flex-1'>
      <p className='mb-1 text-[11px] font-bold text-[#18366f]'>Consultas por semana</p>
      <svg
        aria-label='Gráfico de consultas por semana'
        className='h-[150px] w-full overflow-visible'
        preserveAspectRatio='none'
        role='img'
        viewBox={`0 0 ${ancho} ${alto}`}
      >
        {[0, 1, 2, 3, 4].map((linea) => {
          const y = margenY + (linea / 4) * altoUtil
          return (
            <line
              key={linea}
              stroke='#dfe8f0'
              strokeDasharray='3 4'
              strokeWidth='1'
              x1={margenX}
              x2={ancho - margenX}
              y1={y}
              y2={y}
            />
          )
        })}
        <polyline
          fill='none'
          points={puntos}
          stroke='#1688ed'
          strokeLinecap='round'
          strokeLinejoin='round'
          strokeWidth='3'
          vectorEffect='non-scaling-stroke'
        />
        {valores.map((item, indice) => {
          const x =
            valores.length === 1
              ? ancho / 2
              : margenX + (indice / (valores.length - 1)) * anchoUtil
          const y = margenY + altoUtil - (item.total / maximo) * altoUtil
          return (
            <g key={`${item.semanaDesde}-${indice}`}>
              <circle cx={x} cy={y} fill='#1688ed' r='4.5' />
              <text
                fill='#18366f'
                fontSize='10'
                fontWeight='700'
                textAnchor='middle'
                x={x}
                y={Math.max(11, y - 9)}
              >
                {item.total}
              </text>
              <text
                fill='#71819b'
                fontSize='9'
                textAnchor='middle'
                x={x}
                y={alto - 2}
              >
                Sem {indice + 1}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}

function DetalleMedicoAdminComp({ detalle, usuario }: DetalleMedicoAdminCompProps) {
  const datosRegistrados: Array<{
    etiqueta: string
    icono: NombreIconoMedico
    valor: string
  }> = [
    { etiqueta: 'Nombre completo', icono: 'user', valor: usuario.nombreCompleto },
    { etiqueta: 'DNI', icono: 'idCard', valor: usuario.documento || 'No registrado' },
    { etiqueta: 'Correo institucional', icono: 'mail', valor: usuario.correo || 'No registrado' },
    { etiqueta: 'Teléfono', icono: 'phone', valor: usuario.telefono || 'No registrado' },
    { etiqueta: 'Perfil', icono: 'stethoscope', valor: 'Médico' },
    { etiqueta: 'Especialidad', icono: 'activity', valor: detalle.especialidad || 'No registrada' },
    {
      etiqueta: 'N.º de colegiatura',
      icono: 'clipboard',
      valor: detalle.numeroColegiatura || 'No registrado',
    },
    { etiqueta: 'Fecha de registro', icono: 'calendar', valor: formatearFecha(usuario.creadoEn) },
  ]
  const distribucion = [
    { etiqueta: 'Activos', total: detalle.pacientesActivos, tono: 'bg-[#0aaeb5]' },
    { etiqueta: 'Asignados', total: detalle.pacientesAsignados, tono: 'bg-[#2f83ef]' },
    { etiqueta: 'Principales', total: detalle.pacientesPrincipales, tono: 'bg-[#7a45d3]' },
  ]
  const maximoDistribucion = Math.max(1, ...distribucion.map((item) => item.total))

  function descargarReporte() {
    const filas = [
      ['REPORTE ADMINISTRATIVO DEL MÉDICO'],
      ['Nombre', usuario.nombreCompleto],
      ['DNI', usuario.documento || 'No registrado'],
      ['Correo', usuario.correo || 'No registrado'],
      ['Teléfono', usuario.telefono || 'No registrado'],
      ['Especialidad', detalle.especialidad || 'No registrada'],
      ['Colegiatura', detalle.numeroColegiatura || 'No registrada'],
      ['Pacientes activos', String(detalle.pacientesActivos)],
      ['Pacientes asignados', String(detalle.pacientesAsignados)],
      ['Consultas este mes', String(detalle.consultasEsteMes)],
    ]
    const contenido = filas
      .map((fila) => fila.map((celda) => `"${celda.replaceAll('"', '""')}"`).join(','))
      .join('\n')
    const url = URL.createObjectURL(
      new Blob([`\uFEFF${contenido}`], { type: 'text/csv;charset=utf-8' }),
    )
    const enlace = document.createElement('a')
    enlace.href = url
    enlace.download = `reporte-${usuario.documento || 'medico'}.csv`
    enlace.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className='space-y-4'>
      <section className='grid gap-4 xl:grid-cols-[0.94fr_1.06fr]'>
        <article className='rounded-2xl border border-[#d7e2eb] bg-white p-5 shadow-[0_5px_18px_rgba(18,52,91,0.05)] sm:p-6'>
          <div className='flex flex-col gap-5 sm:flex-row sm:items-center'>
            <span className='grid h-[118px] w-[118px] shrink-0 place-items-center overflow-hidden rounded-full border border-[#cce4e8] bg-gradient-to-b from-[#e0f7f4] to-[#caedf0] text-[66px] shadow-inner'>
              <span aria-hidden='true' className='translate-y-2'>👨🏻‍⚕️</span>
            </span>
            <div className='min-w-0 flex-1'>
              <div className='flex flex-wrap items-center gap-2'>
                <h2 className='text-[clamp(21px,2vw,29px)] font-black tracking-[-0.03em] text-[#09286c]'>
                  {nombreConTitulo(usuario.nombreCompleto)}
                </h2>
                <span className='rounded-full bg-[#e8f8ec] px-2.5 py-1 text-[8px] font-extrabold text-[#19964c]'>
                  {usuario.estado}
                </span>
              </div>

              <dl className='mt-4 grid gap-3 text-[10px] text-[#566c90]'>
                {[
                  { etiqueta: 'DNI', icono: 'idCard' as const, valor: usuario.documento || 'No registrado' },
                  { etiqueta: 'Correo institucional', icono: 'mail' as const, valor: usuario.correo || 'No registrado' },
                  { etiqueta: 'Teléfono', icono: 'phone' as const, valor: usuario.telefono || 'No registrado' },
                  { etiqueta: 'Perfil', icono: 'user' as const, valor: 'Médico' },
                ].map((fila) => (
                  <div className='grid grid-cols-[20px_110px_1fr] items-center gap-2' key={fila.etiqueta}>
                    <IconoMedico className='h-4 w-4 text-[#34507e]' nombre={fila.icono} />
                    <dt className='font-semibold'>{fila.etiqueta}</dt>
                    <dd className='min-w-0 break-words font-bold text-[#243d69]'>{fila.valor}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </article>

        <article className='flex min-h-[250px] flex-col gap-4 rounded-2xl border border-[#d7e2eb] bg-white p-5 shadow-[0_5px_18px_rgba(18,52,91,0.05)] md:flex-row'>
          <div className='grid shrink-0 grid-cols-2 gap-3 md:w-[170px] md:grid-cols-1'>
            <div className='rounded-xl border border-[#dbe5ee] bg-[#fbfdff] p-4'>
              <span className='text-[10px] font-semibold text-[#425778]'>Pacientes activos</span>
              <strong className='mt-1 block text-3xl font-black text-[#09286c]'>{detalle.pacientesActivos}</strong>
              <span className='mt-2 block text-[8px] font-bold text-[#14934d]'>
                {detalle.pacientesAsignados} pacientes asignados
              </span>
            </div>
            <div className='rounded-xl border border-[#dbe5ee] bg-[#fbfdff] p-4'>
              <span className='text-[10px] font-semibold text-[#425778]'>Consultas este mes</span>
              <strong className='mt-1 block text-3xl font-black text-[#09286c]'>{detalle.consultasEsteMes}</strong>
              <span className='mt-2 block text-[8px] font-bold text-[#14934d]'>
                {detalle.pacientesPrincipales} asignaciones principales
              </span>
            </div>
          </div>
          <GraficoLineaComp datos={detalle.consultasPorSemana} />
        </article>
      </section>

      <section className='grid gap-4 xl:grid-cols-[0.8fr_1.2fr]'>
        <article className='rounded-2xl border border-[#d7e2eb] bg-white p-5 shadow-[0_5px_18px_rgba(18,52,91,0.05)]'>
          <h2 className='flex items-center gap-2 text-sm font-extrabold text-[#078f9e]'>
            <IconoMedico className='h-5 w-5' nombre='user' />
            Datos registrados
          </h2>
          <dl className='mt-3 divide-y divide-dashed divide-[#dbe4ec]'>
            {datosRegistrados.map((fila) => (
              <div className='grid min-h-10 grid-cols-[20px_130px_1fr] items-center gap-2 py-2 text-[10px]' key={fila.etiqueta}>
                <IconoMedico className='h-3.5 w-3.5 text-[#6e7f99]' nombre={fila.icono} />
                <dt className='font-semibold text-[#526884]'>{fila.etiqueta}</dt>
                <dd className='min-w-0 break-words text-right font-bold text-[#30466c]'>{fila.valor}</dd>
              </div>
            ))}
          </dl>
        </article>

        <article className='grid overflow-hidden rounded-2xl border border-[#d7e2eb] bg-white shadow-[0_5px_18px_rgba(18,52,91,0.05)] md:grid-cols-[1fr_0.72fr]'>
          <div className='p-5 md:border-r md:border-[#e1e8ef]'>
            <h2 className='text-[12px] font-extrabold text-[#33496e]'>Distribución de pacientes asignados</h2>
            <div className='mt-6 space-y-5'>
              {distribucion.map((item) => (
                <div key={item.etiqueta}>
                  <div className='mb-1.5 flex items-center justify-between text-[9px] font-bold text-[#607493]'>
                    <span>{item.etiqueta}</span>
                    <span>{item.total}</span>
                  </div>
                  <div className='h-3 overflow-hidden rounded-full bg-[#eef3f7]'>
                    <span
                      className={`block h-full rounded-full ${item.tono}`}
                      style={{ width: `${Math.max(3, (item.total / maximoDistribucion) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <p className='mt-6 rounded-xl bg-[#f0f7ff] px-3 py-2 text-[8px] font-semibold leading-4 text-[#466188]'>
              La información mostrada proviene de las asignaciones y consultas registradas en el sistema.
            </p>
          </div>

          <div className='flex flex-col items-center justify-between border-t border-[#e1e8ef] p-5 md:border-t-0'>
            <div className='w-full text-center'>
              <h2 className='text-[12px] font-extrabold text-[#33496e]'>Nivel de reseñas</h2>
              <svg aria-label='No hay reseñas registradas' className='mx-auto mt-2 h-[108px] w-[210px]' role='img' viewBox='0 0 220 120'>
                <path d='M20 105a90 90 0 0 1 45-78' fill='none' stroke='#ef2f34' strokeWidth='28' />
                <path d='M65 27a90 90 0 0 1 45-12' fill='none' stroke='#ff7f12' strokeWidth='28' />
                <path d='M110 15a90 90 0 0 1 45 12' fill='none' stroke='#f8c51c' strokeWidth='28' />
                <path d='M155 27a90 90 0 0 1 45 78' fill='none' stroke='#39a948' strokeWidth='28' />
                <circle cx='110' cy='104' fill='#0a3475' r='9' />
                <path d='m110 104 2-51 8 52Z' fill='#0a3475' transform='rotate(0 110 104)' />
              </svg>
              <p className='-mt-2 text-[9px] font-bold text-[#667892]'>Sin reseñas registradas</p>
            </div>
            <button
              className='mt-4 flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#08aeb5] to-[#008e9f] px-4 text-[11px] font-extrabold text-white shadow-sm transition hover:brightness-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#08aebb]'
              onClick={descargarReporte}
              type='button'
            >
              <IconoMedico className='h-5 w-5' nombre='download' />
              Descargar reporte
            </button>
          </div>
        </article>
      </section>
    </div>
  )
}

export default DetalleMedicoAdminComp
