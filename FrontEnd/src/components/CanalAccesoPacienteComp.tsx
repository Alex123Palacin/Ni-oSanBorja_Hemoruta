import type { CanalActivacion } from '../types/NuevoPaciente'
import IconoMedico from './IconoMedico'

interface CanalAccesoPacienteCompProps {
  compacto?: boolean
  descripcionApp?: string
  descripcionWhatsApp?: string
  etiqueta?: string
  onCambiar: (canal: CanalActivacion) => void
  valor: CanalActivacion
}

const CANALES: Array<{
  canal: CanalActivacion
  icono: 'smartphone' | 'whatsapp'
  tono: string
}> = [
  { canal: 'WhatsApp', icono: 'whatsapp', tono: 'bg-[#dcf8e7] text-[#18a957]' },
  { canal: 'App móvil', icono: 'smartphone', tono: 'bg-[#e4f1ff] text-[#1579e8]' },
]

function CanalAccesoPacienteComp({
  descripcionApp = 'La familia continuará el registro desde la app HemoRuta Pediátrica.',
  descripcionWhatsApp = 'La familia continuará el registro mediante WhatsApp.',
  compacto = false,
  etiqueta = 'Canal principal de acceso',
  onCambiar,
  valor,
}: CanalAccesoPacienteCompProps) {
  return (
    <fieldset>
      <legend className='mb-2 text-[10px] font-extrabold text-[#173478]'>{etiqueta}</legend>
      <div className={`grid gap-3 ${compacto ? '' : 'sm:grid-cols-2'}`}>
        {CANALES.map(({ canal, icono, tono }) => {
          const activo = valor === canal
          return (
            <label
              className={`relative flex cursor-pointer items-start gap-3 rounded-xl border transition focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-[#08aabb] ${compacto ? 'min-h-[86px] p-3' : 'min-h-[102px] p-3.5'} ${
                activo
                  ? canal === 'WhatsApp'
                    ? 'border-[#54c894] bg-[#f8fffb] shadow-[0_3px_12px_rgba(18,159,83,.08)]'
                    : 'border-[#65b8ef] bg-[#f8fcff] shadow-[0_3px_12px_rgba(21,121,232,.08)]'
                  : 'border-[#dbe5ee] bg-white hover:border-[#bdd4e2] hover:bg-[#fbfdff]'
              }`}
              key={canal}
            >
              <input
                checked={activo}
                className='mt-1 h-4 w-4 shrink-0 accent-[#1289e8]'
                name='canalActivacion'
                onChange={() => onCambiar(canal)}
                type='radio'
              />
              <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-full ${tono}`}>
                <IconoMedico className='h-7 w-7' nombre={icono} strokeWidth={1.8} />
              </span>
              <span className='min-w-0 text-[9px] leading-[14px] text-[#3c5680]'>
                <strong className='mb-1 block text-[12px] text-[#173478]'>{canal}</strong>
                {canal === 'WhatsApp' ? descripcionWhatsApp : descripcionApp}
              </span>
              {activo && (
                <span className='absolute right-2.5 top-2.5 grid h-5 w-5 place-items-center rounded-full bg-[#0ca350] text-white'>
                  <IconoMedico className='h-3 w-3' nombre='check' strokeWidth={3} />
                </span>
              )}
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}

export default CanalAccesoPacienteComp
