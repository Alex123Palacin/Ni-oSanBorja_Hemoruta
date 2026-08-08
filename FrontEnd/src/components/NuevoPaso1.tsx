import type { FormEvent } from 'react'

import type {
  ActualizarFormulario,
  CanalActivacion,
  DatosPaciente,
  FormularioActivacion,
} from '../types/NuevoPaciente'
import IconoMedico, { type NombreIconoMedico } from './IconoMedico'
import ResumenPacienteComp from './ResumenPacienteComp'

interface CampoFormularioProps {
  etiqueta: string
  icono: NombreIconoMedico
  id: string
  onChange: (valor: string) => void
  placeholder: string
  tipo?: 'email' | 'text'
  valor: string
}

function CampoFormulario({ etiqueta, icono, id, onChange, placeholder, tipo = 'text', valor }: CampoFormularioProps) {
  return (
    <label className='block' htmlFor={id}>
      <span className='mb-1.5 flex items-center gap-2 text-[10px] font-extrabold text-[#173478]'>
        <IconoMedico className='h-3.5 w-3.5 text-[#31549c]' nombre={icono} />
        {etiqueta}
      </span>
      <input
        className='h-9 w-full rounded-lg border border-[#d6e1ec] bg-white px-3 text-[11px] text-[#173478] outline-none transition placeholder:text-[#7588a7] focus:border-[#08aabb] focus:ring-3 focus:ring-[#08aabb]/10'
        id={id}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        type={tipo}
        value={valor}
      />
    </label>
  )
}

interface OpcionCanalProps {
  activo: boolean
  canal: CanalActivacion
  descripcion: string
  onSeleccionar: (canal: CanalActivacion) => void
}

function OpcionCanal({ activo, canal, descripcion, onSeleccionar }: OpcionCanalProps) {
  const esWhatsApp = canal === 'WhatsApp'

  return (
    <label
      className={`flex min-h-[76px] cursor-pointer items-start gap-2.5 rounded-lg border p-3 transition ${
        activo ? 'border-[#08a9bb] bg-[#f8fefe]' : 'border-[#dbe5ee] bg-white hover:bg-[#f8fbfd]'
      }`}
    >
      <input
        checked={activo}
        className='mt-1 h-3.5 w-3.5 accent-[#098fdf]'
        name='canalActivacion'
        onChange={() => onSeleccionar(canal)}
        type='radio'
      />
      <span
        className={`grid h-9 w-9 shrink-0 place-items-center rounded-full ${
          esWhatsApp ? 'bg-[#19bd5b] text-white' : 'bg-[#e6f1ff] text-[#147cf3]'
        }`}
      >
        <IconoMedico className='h-6 w-6' nombre={esWhatsApp ? 'whatsapp' : 'smartphone'} strokeWidth={1.9} />
      </span>
      <span className='min-w-0 text-[9px] leading-[13px] text-[#36517f]'>
        <strong className='mb-0.5 block text-[11px] text-[#173478]'>{canal}</strong>
        {descripcion}
      </span>
    </label>
  )
}

interface NuevoPaso1Props {
  actualizarFormulario: ActualizarFormulario
  datos: DatosPaciente
  formulario: FormularioActivacion
  onCancelar: () => void
  onContinuar: () => void
}

function NuevoPaso1({ actualizarFormulario, datos, formulario, onCancelar, onContinuar }: NuevoPaso1Props) {
  const resumen: DatosPaciente = {
    ...datos,
    canal: formulario.canal,
    correo: formulario.correo || datos.correo,
    dni: formulario.dni || datos.dni,
    nombre: formulario.nombre || datos.nombre,
    telefono: formulario.telefono || datos.telefono,
  }

  function enviarFormulario(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onContinuar()
  }

  return (
    <form className='space-y-3' onSubmit={enviarFormulario}>
      <div className='grid gap-3 lg:grid-cols-[minmax(0,2.05fr)_minmax(245px,0.95fr)]'>
        <section className='rounded-xl border border-[#dbe5ef] bg-white p-5 shadow-[0_1px_3px_rgba(18,52,91,0.04)]'>
          <h2 className='text-[14px] font-extrabold text-[#123278]'>Datos básicos para activar al paciente</h2>
          <p className='mt-1 max-w-[620px] text-[9px] font-medium leading-[14px] text-[#526a91]'>
            Solo necesitamos estos datos mínimos. La información personal y familiar restante será completada
            por la familia desde WhatsApp o la app móvil.
          </p>

          <div className='mt-4 grid gap-x-6 gap-y-4 sm:grid-cols-2'>
            <CampoFormulario
              etiqueta='DNI del paciente'
              icono='idCard'
              id='dniPaciente'
              onChange={(valor) => actualizarFormulario('dni', valor)}
              placeholder='Ingresar DNI'
              valor={formulario.dni}
            />
            <CampoFormulario
              etiqueta='Nombre completo del paciente'
              icono='user'
              id='nombrePaciente'
              onChange={(valor) => actualizarFormulario('nombre', valor)}
              placeholder='Ej. Mateo Gabriel Flores'
              valor={formulario.nombre}
            />
            <CampoFormulario
              etiqueta='Teléfono del tutor'
              icono='phone'
              id='telefonoTutor'
              onChange={(valor) => actualizarFormulario('telefono', valor)}
              placeholder='Ej. 987 654 321'
              valor={formulario.telefono}
            />
            <CampoFormulario
              etiqueta='Correo electrónico'
              icono='mail'
              id='correoTutor'
              onChange={(valor) => actualizarFormulario('correo', valor)}
              placeholder='Ej. maria.flores@email.com'
              tipo='email'
              valor={formulario.correo}
            />
          </div>

          <fieldset className='mt-4'>
            <legend className='mb-2 text-[10px] font-extrabold text-[#173478]'>Canal principal de acceso</legend>
            <div className='grid gap-3 sm:grid-cols-2'>
              <OpcionCanal
                activo={formulario.canal === 'WhatsApp'}
                canal='WhatsApp'
                descripcion='La familia recibirá el enlace y continuará el registro por WhatsApp.'
                onSeleccionar={(canal) => actualizarFormulario('canal', canal)}
              />
              <OpcionCanal
                activo={formulario.canal === 'App móvil'}
                canal='App móvil'
                descripcion='La familia recibirá el enlace y continuará el registro desde la app móvil.'
                onSeleccionar={(canal) => actualizarFormulario('canal', canal)}
              />
            </div>
          </fieldset>

          <label className='mt-4 flex cursor-pointer items-start gap-2.5' htmlFor='enviarCopia'>
            <input
              checked={formulario.copiaCorreo}
              className='mt-0.5 h-4 w-4 accent-[#08a9bb]'
              id='enviarCopia'
              onChange={(event) => actualizarFormulario('copiaCorreo', event.target.checked)}
              type='checkbox'
            />
            <span className='text-[9px] leading-[14px] text-[#526a91]'>
              <strong className='block text-[10px] text-[#173478]'>Enviar copia al correo del tutor</strong>
              Se enviará un resumen con las instrucciones de activación.
            </span>
          </label>
        </section>

        <ResumenPacienteComp
          datos={resumen}
          estado='Listo para enviar'
          notaDetalle='Podrán agregar datos personales, familiares, historial médico y autorizaciones.'
          notaTitulo='La familia completará el resto del perfil desde WhatsApp o la app móvil.'
          titulo='Resumen de activación'
        />
      </div>

      <div className='flex flex-wrap items-center justify-between gap-3 pt-1'>
        <button
          className='flex h-9 min-w-[120px] cursor-pointer items-center justify-center gap-2 rounded-lg border border-[#d6e1ec] bg-white px-5 text-[10px] font-bold text-[#27447f] transition hover:bg-[#f7fafc] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#08a9bb]'
          onClick={onCancelar}
          type='button'
        >
          <IconoMedico className='h-4 w-4' nombre='x' strokeWidth={2} />
          Cancelar
        </button>
        <button
          className='flex h-9 min-w-[195px] cursor-pointer items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#08aabd] to-[#078eaa] px-6 text-[10px] font-bold text-white shadow-sm transition hover:brightness-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#08a9bb]'
          type='submit'
        >
          <IconoMedico className='h-4 w-4' nombre='send' strokeWidth={1.8} />
          Enviar activación
        </button>
      </div>
    </form>
  )
}

export default NuevoPaso1
