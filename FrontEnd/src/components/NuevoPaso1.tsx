import type { FormEvent } from 'react'

import type {
  ActualizarFormulario,
  DatosPaciente,
  FormularioActivacion,
} from '../types/NuevoPaciente'
import IconoMedico, { type NombreIconoMedico } from './IconoMedico'
import CanalAccesoPacienteComp from './CanalAccesoPacienteComp'
import ResumenPacienteComp from './ResumenPacienteComp'

interface CampoFormularioProps {
  etiqueta: string
  icono: NombreIconoMedico
  id: string
  onChange: (valor: string) => void
  placeholder: string
  tipo?: 'email' | 'text'
  valor: string
  obligatorio?: boolean
  longitudMaxima?: number
  modoEntrada?: 'email' | 'numeric' | 'tel' | 'text'
}

function CampoFormulario({
  etiqueta,
  icono,
  id,
  longitudMaxima,
  modoEntrada,
  obligatorio = false,
  onChange,
  placeholder,
  tipo = 'text',
  valor,
}: CampoFormularioProps) {
  return (
    <label className='block' htmlFor={id}>
      <span className='mb-1.5 flex items-center gap-2 text-[10px] font-extrabold text-[#173478]'>
        <IconoMedico className='h-3.5 w-3.5 text-[#31549c]' nombre={icono} />
        {etiqueta}
      </span>
      <input
        className='h-9 w-full rounded-lg border border-[#d6e1ec] bg-white px-3 text-[11px] text-[#173478] outline-none transition placeholder:text-[#7588a7] focus:border-[#08aabb] focus:ring-3 focus:ring-[#08aabb]/10'
        id={id}
        inputMode={modoEntrada}
        maxLength={longitudMaxima}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        required={obligatorio}
        type={tipo}
        value={valor}
      />
    </label>
  )
}

interface NuevoPaso1Props {
  actualizarFormulario: ActualizarFormulario
  datos: DatosPaciente
  formulario: FormularioActivacion
  onCancelar: () => void
  onContinuar: () => void
  cargando?: boolean
  error?: string
}

function NuevoPaso1({
  actualizarFormulario,
  cargando = false,
  datos,
  error = '',
  formulario,
  onCancelar,
  onContinuar,
}: NuevoPaso1Props) {
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
            Solo necesitamos estos datos mínimos. La ficha quedará marcada como provisional hasta completar la
            información clínica y familiar.
          </p>

          <div className='mt-4 grid gap-x-6 gap-y-4 sm:grid-cols-2'>
            <CampoFormulario
              etiqueta='DNI del paciente'
              icono='idCard'
              id='dniPaciente'
              onChange={(valor) => actualizarFormulario('dni', valor)}
              placeholder='Ingresar DNI'
              valor={formulario.dni}
              obligatorio
              longitudMaxima={8}
              modoEntrada='numeric'
            />
            <CampoFormulario
              etiqueta='Nombre completo del paciente'
              icono='user'
              id='nombrePaciente'
              onChange={(valor) => actualizarFormulario('nombre', valor)}
              placeholder='Ej. Mateo Gabriel Flores'
              valor={formulario.nombre}
              obligatorio
            />
            <CampoFormulario
              etiqueta='Teléfono del tutor'
              icono='phone'
              id='telefonoTutor'
              onChange={(valor) => actualizarFormulario('telefono', valor)}
              placeholder='Ej. 987 654 321'
              valor={formulario.telefono}
              obligatorio
              longitudMaxima={20}
              modoEntrada='tel'
            />
            <CampoFormulario
              etiqueta='Correo electrónico'
              icono='mail'
              id='correoTutor'
              onChange={(valor) => actualizarFormulario('correo', valor)}
              placeholder='Ej. maria.flores@email.com'
              tipo='email'
              valor={formulario.correo}
              modoEntrada='email'
            />
          </div>

          <div className='mt-4'>
            <CanalAccesoPacienteComp
              descripcionApp='La familia podrá ingresar desde la app con sus credenciales temporales.'
              descripcionWhatsApp='El canal queda seleccionado para continuar el registro con la familia.'
              onCambiar={(canal) => actualizarFormulario('canal', canal)}
              valor={formulario.canal}
            />
          </div>

          {error && (
            <p className='mt-4 rounded-lg border border-[#ffc8cc] bg-[#fff5f6] px-3 py-2 text-[9px] font-semibold text-[#c93442]' role='alert'>
              {error}
            </p>
          )}
        </section>

        <ResumenPacienteComp
          datos={resumen}
          estado='Listo para registrar'
          notaDetalle='La ficha podrá completarse luego sin perder el vínculo con el médico.'
          notaTitulo='Se generará una ficha provisional y credenciales temporales de acceso.'
          titulo='Resumen del alta'
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
          className='flex h-9 min-w-[195px] cursor-pointer items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#08aabd] to-[#078eaa] px-6 text-[10px] font-bold text-white shadow-sm transition hover:brightness-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#08a9bb] disabled:cursor-wait disabled:opacity-65'
          disabled={cargando}
          type='submit'
        >
          <IconoMedico className='h-4 w-4' nombre='send' strokeWidth={1.8} />
          {cargando ? 'Creando paciente...' : 'Crear paciente y acceso'}
        </button>
      </div>
    </form>
  )
}

export default NuevoPaso1
