import IconoMedico from '../IconoMedico'
import CampoInicioPacienteComp from './CampoInicioPacienteComp'
import type {
  DatosPersonalesInicioPaciente,
  OpcionCampoInicioPaciente,
} from '../../types/InicioPaciente'

interface OpcionesDatosPersonalesPaciente {
  diagnosticos: readonly OpcionCampoInicioPaciente[]
  gruposSanguineos: readonly OpcionCampoInicioPaciente[]
  procedencias: readonly OpcionCampoInicioPaciente[]
  sexos: readonly OpcionCampoInicioPaciente[]
}

interface InicioDatosPersonalesCompProps {
  datos: DatosPersonalesInicioPaciente
  onCambiar: (campo: keyof DatosPersonalesInicioPaciente, valor: string) => void
  onContinuar: () => void
  onGuardarBorrador: () => void
  opciones: OpcionesDatosPersonalesPaciente
}

function InicioDatosPersonalesComp({
  datos,
  onCambiar,
  onContinuar,
  onGuardarBorrador,
  opciones,
}: InicioDatosPersonalesCompProps) {
  function enviarFormulario(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    onContinuar()
  }

  return (
    <section aria-labelledby='titulo-datos-personales' className='mt-2'>
      <div className='flex items-center gap-3 px-1'>
        <span className='shrink-0 text-[8px] font-extrabold text-[#079ca8]'>Paso 1 de 2</span>
        <div aria-label='Progreso del perfil: 50%' className='h-1.5 flex-1 overflow-hidden rounded-full bg-[#e8eef3]' role='progressbar' aria-valuemax={100} aria-valuemin={0} aria-valuenow={50}>
          <div className='h-full w-1/2 rounded-full bg-[#08aab1]' />
        </div>
      </div>

      <div className='mt-2 flex items-center gap-2 px-1'>
        <span className='grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#e9f9f8] text-[#04a9b0]'>
          <IconoMedico className='h-4 w-4' nombre='user' strokeWidth={1.7} />
        </span>
        <h2 id='titulo-datos-personales' className='text-[13px] font-extrabold tracking-[-0.02em] text-[#0a2b70]'>
          Datos personales del paciente
        </h2>
      </div>
      <p className='mt-1 px-1 text-[8px] font-medium leading-[12px] text-[#637594]'>
        Completa la información del menor. Estos datos serán enviados a la ficha del doctor para su evaluación.
      </p>

      <form
        className='mt-2 rounded-[14px] border border-[#e1e8ef] bg-white p-2.5 shadow-[0_4px_13px_rgba(23,55,96,0.06)]'
        onSubmit={enviarFormulario}
      >
        <div className='grid grid-cols-2 gap-x-2 gap-y-2'>
          <CampoInicioPacienteComp
            autoComplete='given-name'
            etiqueta='Nombres'
            id='inicio-nombres-paciente'
            onCambiar={(valor) => onCambiar('nombres', valor)}
            placeholder='Ingresa los nombres'
            requerido
            valor={datos.nombres}
          />
          <CampoInicioPacienteComp
            autoComplete='family-name'
            etiqueta='Apellidos'
            id='inicio-apellidos-paciente'
            onCambiar={(valor) => onCambiar('apellidos', valor)}
            placeholder='Ingresa los apellidos'
            requerido
            valor={datos.apellidos}
          />
          <CampoInicioPacienteComp
            etiqueta='Fecha de nacimiento'
            icono='calendar'
            id='inicio-fecha-nacimiento'
            onCambiar={(valor) => onCambiar('fechaNacimiento', valor)}
            placeholder='Seleccionar fecha'
            requerido
            tipo='date'
            valor={datos.fechaNacimiento}
          />
          <CampoInicioPacienteComp
            etiqueta='Sexo'
            icono='user'
            id='inicio-sexo-paciente'
            onCambiar={(valor) => onCambiar('sexo', valor)}
            opciones={opciones.sexos}
            placeholder='Seleccionar sexo'
            requerido
            valor={datos.sexo}
          />
          <CampoInicioPacienteComp
            etiqueta='DNI del menor'
            icono='idCard'
            id='inicio-dni-paciente'
            onCambiar={(valor) => onCambiar('dni', valor)}
            placeholder='Ingresar DNI'
            requerido
            valor={datos.dni}
          />
          <CampoInicioPacienteComp
            className='col-span-2'
            etiqueta='Diagnóstico principal'
            icono='stethoscope'
            id='inicio-diagnostico-paciente'
            onCambiar={(valor) => onCambiar('diagnosticoPrincipal', valor)}
            opciones={opciones.diagnosticos}
            placeholder='Seleccionar diagnóstico'
            requerido
            valor={datos.diagnosticoPrincipal}
          />
          <CampoInicioPacienteComp
            etiqueta='Grupo sanguíneo'
            icono='droplet'
            id='inicio-grupo-sanguineo'
            onCambiar={(valor) => onCambiar('grupoSanguineo', valor)}
            opciones={opciones.gruposSanguineos}
            placeholder='Seleccionar grupo'
            valor={datos.grupoSanguineo}
          />
          <CampoInicioPacienteComp
            etiqueta='Procedencia'
            icono='building'
            id='inicio-procedencia'
            onCambiar={(valor) => onCambiar('procedencia', valor)}
            opciones={opciones.procedencias}
            placeholder='Seleccionar procedencia'
            requerido
            valor={datos.procedencia}
          />
        </div>

        <button
          className='mt-2.5 flex h-[41px] w-full items-center justify-center gap-2 rounded-[9px] bg-gradient-to-r from-[#08b5b0] to-[#009ba8] text-[11px] font-extrabold text-white shadow-[0_5px_12px_rgba(0,157,168,0.18)] transition hover:brightness-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#079ca8]'
          type='submit'
        >
          Continuar
          <IconoMedico className='h-4 w-4' nombre='arrowRight' strokeWidth={1.9} />
        </button>
        <button
          className='mt-1.5 block min-h-6 w-full text-center text-[8.5px] font-bold text-[#079ca8] hover:underline focus-visible:outline-2 focus-visible:outline-[#079ca8]'
          onClick={onGuardarBorrador}
          type='button'
        >
          Guardar borrador
        </button>
      </form>
    </section>
  )
}

export default InicioDatosPersonalesComp
