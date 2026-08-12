import IconoMedico, { type NombreIconoMedico } from '../IconoMedico'
import CampoInicioPacienteComp from './CampoInicioPacienteComp'
import type {
  DatosTutorInicioPaciente,
  OpcionCampoInicioPaciente,
  PreferenciaContactoPaciente,
} from '../../types/InicioPaciente'

interface OpcionPreferenciaContacto {
  icono: NombreIconoMedico
  texto: string
  valor: PreferenciaContactoPaciente
}

interface OpcionesDatosTutorPaciente {
  distritos: readonly OpcionCampoInicioPaciente[]
  horarios: readonly OpcionCampoInicioPaciente[]
  parentescos: readonly OpcionCampoInicioPaciente[]
  preferencias: readonly OpcionPreferenciaContacto[]
}

interface InicioDatosTutorCompProps {
  datos: DatosTutorInicioPaciente
  nombrePaciente: string
  onCambiar: (campo: keyof DatosTutorInicioPaciente, valor: string) => void
  onGuardarEnviar: () => void
  onVolver: () => void
  opciones: OpcionesDatosTutorPaciente
}

function InicioDatosTutorComp({
  datos,
  nombrePaciente,
  onCambiar,
  onGuardarEnviar,
  onVolver,
  opciones,
}: InicioDatosTutorCompProps) {
  function enviarFormulario(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    onGuardarEnviar()
  }

  return (
    <section aria-labelledby='titulo-datos-tutor' className='mt-2'>
      <div className='flex items-center gap-3 px-1'>
        <span className='shrink-0 text-[8px] font-extrabold text-[#079ca8]'>Paso 2 de 2</span>
        <div aria-label='Progreso del perfil: 100%' className='h-1.5 flex-1 overflow-hidden rounded-full bg-[#e8eef3]' role='progressbar' aria-valuemax={100} aria-valuemin={0} aria-valuenow={100}>
          <div className='h-full w-full rounded-full bg-[#08aab1]' />
        </div>
      </div>

      <div className='mt-2 flex items-center gap-2 px-1'>
        <span className='grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#e9f9f8] text-[#04a9b0]'>
          <IconoMedico className='h-4 w-4' nombre='users' strokeWidth={1.7} />
        </span>
        <h2 id='titulo-datos-tutor' className='text-[13px] font-extrabold tracking-[-0.02em] text-[#0a2b70]'>
          Datos del tutor y contacto familiar
        </h2>
      </div>
      <p className='mt-1 px-1 text-[8px] font-medium leading-[12px] text-[#637594]'>
        Completa la información del padre, madre o responsable. Estos datos se enviarán a la ficha del doctor.
      </p>

      <form className='mt-2' onSubmit={enviarFormulario}>
        <div className='rounded-[14px] border border-[#e1e8ef] bg-white p-2.5 shadow-[0_4px_13px_rgba(23,55,96,0.06)]'>
          <div className='grid grid-cols-5 gap-x-2 gap-y-2'>
            <CampoInicioPacienteComp
              autoComplete='name'
              className='col-span-3'
              etiqueta='Nombre completo del responsable'
              id='inicio-nombre-tutor'
              onCambiar={(valor) => onCambiar('nombreCompleto', valor)}
              placeholder='Ej. María Fernanda López Sánchez'
              requerido
              valor={datos.nombreCompleto}
            />
            <CampoInicioPacienteComp
              className='col-span-2'
              etiqueta='Parentesco'
              id='inicio-parentesco-tutor'
              onCambiar={(valor) => onCambiar('parentesco', valor)}
              opciones={opciones.parentescos}
              placeholder='Selecciona parentesco'
              requerido
              valor={datos.parentesco}
            />
          </div>

          <div className='mt-2 grid grid-cols-3 gap-2'>
            <CampoInicioPacienteComp
              etiqueta='DNI'
              icono='idCard'
              id='inicio-dni-tutor'
              onCambiar={(valor) => onCambiar('dni', valor)}
              placeholder='Ej. 45678912'
              requerido
              valor={datos.dni}
            />
            <CampoInicioPacienteComp
              autoComplete='tel'
              etiqueta='Teléfono principal'
              icono='phone'
              id='inicio-telefono-principal'
              onCambiar={(valor) => onCambiar('telefonoPrincipal', valor)}
              placeholder='Ej. 987 654 321'
              requerido
              tipo='tel'
              valor={datos.telefonoPrincipal}
            />
            <CampoInicioPacienteComp
              etiqueta='Teléfono alterno'
              icono='phone'
              id='inicio-telefono-alterno'
              onCambiar={(valor) => onCambiar('telefonoAlterno', valor)}
              placeholder='Ej. 912 345 678'
              tipo='tel'
              valor={datos.telefonoAlterno}
            />
          </div>

          <CampoInicioPacienteComp
            autoComplete='email'
            className='mt-2'
            etiqueta='Correo electrónico'
            icono='mail'
            id='inicio-correo-tutor'
            onCambiar={(valor) => onCambiar('correo', valor)}
            placeholder='Ej. maria.lopez@gmail.com'
            requerido
            tipo='email'
            valor={datos.correo}
          />

          <div className='mt-2 grid grid-cols-5 gap-2'>
            <CampoInicioPacienteComp
              autoComplete='street-address'
              className='col-span-3'
              etiqueta='Dirección'
              icono='home'
              id='inicio-direccion-tutor'
              onCambiar={(valor) => onCambiar('direccion', valor)}
              placeholder='Ej. Av. Javier Prado Este 1234, Dpto. 502'
              requerido
              valor={datos.direccion}
            />
            <CampoInicioPacienteComp
              className='col-span-2'
              etiqueta='Distrito'
              id='inicio-distrito-tutor'
              onCambiar={(valor) => onCambiar('distrito', valor)}
              opciones={opciones.distritos}
              placeholder='Selecciona distrito'
              requerido
              valor={datos.distrito}
            />
            <CampoInicioPacienteComp
              className='col-span-3'
              etiqueta='Persona autorizada adicional'
              icono='user'
              id='inicio-persona-autorizada'
              onCambiar={(valor) => onCambiar('personaAutorizada', valor)}
              placeholder='Ej. Abuela paterna, Tía Ana'
              valor={datos.personaAutorizada}
            />
            <CampoInicioPacienteComp
              className='col-span-2'
              etiqueta='Teléfono de emergencia'
              icono='phone'
              id='inicio-telefono-emergencia'
              onCambiar={(valor) => onCambiar('telefonoEmergencia', valor)}
              placeholder='Ej. 999 888 777'
              requerido
              tipo='tel'
              valor={datos.telefonoEmergencia}
            />
          </div>

          <fieldset className='mt-2'>
            <legend className='mb-1 text-[8px] font-bold text-[#17366f]'>
              Preferencia de contacto <span className='text-[#ff626d]'>*</span>
            </legend>
            <div className='grid grid-cols-3 gap-1.5'>
              {opciones.preferencias.map((opcion) => {
                const seleccionado = datos.preferenciaContacto === opcion.valor

                return (
                  <label
                    className={`relative flex h-[34px] cursor-pointer items-center justify-center gap-1 rounded-[7px] border text-[7.5px] font-bold transition ${
                      seleccionado
                        ? 'border-[#08b1b4] bg-[#edfbf8] text-[#079ca8]'
                        : 'border-[#dce5ed] bg-white text-[#5e7190] hover:border-[#8fdde0]'
                    }`}
                    key={opcion.valor}
                  >
                    <input
                      checked={seleccionado}
                      className='sr-only'
                      name='preferencia-contacto'
                      onChange={() => onCambiar('preferenciaContacto', opcion.valor)}
                      type='radio'
                      value={opcion.valor}
                    />
                    <IconoMedico className='h-3.5 w-3.5' nombre={opcion.icono} strokeWidth={1.7} />
                    {opcion.texto}
                    {seleccionado && <span className='absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full border-2 border-white bg-[#08aeb4]' />}
                  </label>
                )
              })}
            </div>
          </fieldset>

          <CampoInicioPacienteComp
            className='mt-2'
            etiqueta='Horario de contacto'
            icono='clock'
            id='inicio-horario-contacto'
            onCambiar={(valor) => onCambiar('horarioContacto', valor)}
            opciones={opciones.horarios}
            placeholder='Selecciona horario'
            requerido
            valor={datos.horarioContacto}
          />
        </div>

        <aside className='mt-2 flex items-start gap-2 rounded-[10px] border border-[#cfe6fb] bg-[#f0f7ff] px-2.5 py-2 text-[#234879]' role='note'>
          <IconoMedico className='mt-0.5 h-4 w-4 shrink-0 text-[#1687ec]' nombre='info' strokeWidth={1.8} />
          <p className='text-[7.5px] font-semibold leading-[11px]'>
            <strong className='block text-[#17366f]'>Esta información se sincronizará con la ficha médica de {nombrePaciente}.</strong>
            Podrás actualizarla cuando sea necesario desde su perfil.
          </p>
        </aside>

        <button
          className='mt-2 flex h-[41px] w-full items-center justify-center gap-2 rounded-[9px] bg-gradient-to-r from-[#08b5b0] to-[#009ba8] text-[10.5px] font-extrabold text-white shadow-[0_5px_12px_rgba(0,157,168,0.18)] transition hover:brightness-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#079ca8]'
          type='submit'
        >
          Guardar y enviar al doctor
          <IconoMedico className='h-4 w-4' nombre='arrowRight' strokeWidth={1.9} />
        </button>
        <button
          className='mt-1 block min-h-6 w-full text-[8.5px] font-bold text-[#079ca8] hover:underline focus-visible:outline-2 focus-visible:outline-[#079ca8]'
          onClick={onVolver}
          type='button'
        >
          Volver
        </button>
      </form>
    </section>
  )
}

export default InicioDatosTutorComp
