import type { DatosPaciente } from '../types/NuevoPaciente'
import IconoMedico, { type NombreIconoMedico } from './IconoMedico'

interface ResumenPacienteCompProps {
  datos: DatosPaciente
  estado: string
  notaDetalle: string
  notaTitulo: string
  titulo: string
}

function ResumenPacienteComp({ datos, estado, notaDetalle, notaTitulo, titulo }: ResumenPacienteCompProps) {
  const filas: Array<{ etiqueta: string; icono: NombreIconoMedico; valor: string }> = [
    { etiqueta: 'Paciente', icono: 'user', valor: datos.nombre },
    { etiqueta: 'DNI', icono: 'idCard', valor: datos.dni },
    { etiqueta: 'Tutor', icono: 'user', valor: datos.tutor },
    { etiqueta: 'Teléfono', icono: 'phone', valor: datos.telefono },
    { etiqueta: 'Correo', icono: 'mail', valor: datos.correo },
  ]

  return (
    <aside className='flex h-full flex-col rounded-xl border border-[#d9e9e2] bg-[#fcfffd] p-4 shadow-[0_1px_3px_rgba(12,55,91,0.04)]'>
      <h2 className='text-[14px] font-extrabold text-[#079447]'>{titulo}</h2>

      <dl className='mt-3 divide-y divide-[#e5edf3]'>
        {filas.map((fila) => (
          <div className='grid grid-cols-[92px_minmax(0,1fr)] items-center gap-2 py-2' key={fila.etiqueta}>
            <dt className='flex items-center gap-2 text-[10px] font-semibold text-[#405683]'>
              <IconoMedico className='h-3.5 w-3.5 text-[#3155a4]' nombre={fila.icono} />
              {fila.etiqueta}:
            </dt>
            <dd className='min-w-0 break-words text-[10px] font-bold leading-4 text-[#102f79]'>{fila.valor}</dd>
          </div>
        ))}

        <div className='grid grid-cols-[92px_minmax(0,1fr)] items-center gap-2 py-2'>
          <dt className='flex items-center gap-2 text-[10px] font-semibold text-[#405683]'>
            <IconoMedico
              className={`h-3.5 w-3.5 ${datos.canal === 'WhatsApp' ? 'text-[#16b858]' : 'text-[#147cf3]'}`}
              nombre={datos.canal === 'WhatsApp' ? 'whatsapp' : 'smartphone'}
            />
            Canal:
          </dt>
          <dd className='text-[10px] font-bold text-[#102f79]'>{datos.canal}</dd>
        </div>

        <div className='grid grid-cols-[92px_minmax(0,1fr)] items-center gap-2 py-2'>
          <dt className='flex items-center gap-2 text-[10px] font-semibold text-[#405683]'>
            <IconoMedico className='h-3.5 w-3.5 text-[#0cad50]' nombre='bell' />
            Estado:
          </dt>
          <dd>
            <span className='inline-flex items-center gap-1 rounded-full bg-[#dff6e6] px-2 py-1 text-[9px] font-bold text-[#098a3f]'>
              <IconoMedico className='h-3 w-3' nombre='check' strokeWidth={2.8} />
              {estado}
            </span>
          </dd>
        </div>
      </dl>

      <div className='mt-auto flex gap-2 rounded-xl border border-[#f5d48b] bg-[#fffaf0] p-3'>
        <span className='grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#fff0bf] text-[#ffb000]'>
          <IconoMedico className='h-4 w-4' nombre='star' strokeWidth={2} />
        </span>
        <p className='text-[9px] leading-[14px] text-[#3d5680]'>
          <strong className='mb-0.5 block text-[#183778]'>{notaTitulo}</strong>
          {notaDetalle}
        </p>
      </div>
    </aside>
  )
}

export default ResumenPacienteComp
