import { useState } from 'react'

import type { CanalActivacion, CredencialesTemporalesPaciente, DatosPaciente } from '../types/NuevoPaciente'
import CanalAccesoPacienteComp from './CanalAccesoPacienteComp'
import CredencialesAccesoPacienteComp from './CredencialesAccesoPacienteComp'
import IconoMedico, { type NombreIconoMedico } from './IconoMedico'

interface FilaDetalle {
  etiqueta: string
  valor: string
}

interface GrupoDetalleProps {
  filas: FilaDetalle[]
  icono: NombreIconoMedico
  titulo: string
}

function GrupoDetalle({ filas, icono, titulo }: GrupoDetalleProps) {
  return (
    <section>
      <h4 className='flex items-center gap-2 text-[9px] font-extrabold text-[#079447]'>
        <IconoMedico className='h-3.5 w-3.5 text-[#3155a4]' nombre={icono} />
        {titulo}
        <span className='grid h-3.5 w-3.5 place-items-center rounded-full bg-[#0aab4c] text-white'>
          <IconoMedico className='h-2.5 w-2.5' nombre='check' strokeWidth={3} />
        </span>
      </h4>
      <dl className='mt-2 space-y-1.5'>
        {filas.map((fila) => (
          <div className='grid grid-cols-[76px_minmax(0,1fr)] gap-2 text-[8px] leading-[12px]' key={fila.etiqueta}>
            <dt className='font-semibold text-[#50688f]'>{fila.etiqueta}:</dt>
            <dd className='break-words font-bold text-[#173478]'>{fila.valor}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}

interface NuevoPaso3Props {
  credenciales: CredencialesTemporalesPaciente
  datos: DatosPaciente
  onFicha: () => void
  onSeguimiento: () => void
  onVolver: () => void
}

function NuevoPaso3({ credenciales, datos, onFicha, onSeguimiento, onVolver }: NuevoPaso3Props) {
  const [canalSeleccionado, setCanalSeleccionado] = useState<CanalActivacion>(datos.canal)
  const datosPersonales: FilaDetalle[] = [
    { etiqueta: 'Nombre', valor: datos.nombre },
    { etiqueta: 'DNI', valor: datos.dni },
    { etiqueta: 'Fecha de nacimiento', valor: datos.fechaNacimiento },
    { etiqueta: 'Diagnóstico', valor: datos.diagnostico },
    { etiqueta: 'Factor base', valor: datos.factorBase },
    { etiqueta: 'Peso', valor: datos.peso },
    { etiqueta: 'Grupo y Rh', valor: datos.grupoRh },
  ]
  const contactoFamiliar: FilaDetalle[] = [
    { etiqueta: 'Tutor', valor: datos.tutor },
    { etiqueta: 'Parentesco', valor: datos.parentesco },
    { etiqueta: 'DNI', valor: datos.dniTutor },
    { etiqueta: 'Teléfono', valor: datos.telefono },
    { etiqueta: 'Correo', valor: datos.correo },
    { etiqueta: 'Dirección', valor: datos.direccion },
    { etiqueta: 'Idioma preferido', valor: datos.idioma },
  ]
  const accesoHabilitado: FilaDetalle[] = [
    { etiqueta: 'Canal preferido', valor: canalSeleccionado },
    { etiqueta: 'Usuario', valor: credenciales.usuario },
    { etiqueta: 'Estado', valor: 'Activo' },
    { etiqueta: 'Fecha de activación', valor: datos.fechaActivacion },
    { etiqueta: 'Registrado por', valor: datos.registradoPor },
  ]

  return (
    <section className='space-y-3'>
      <div className='grid gap-3 lg:grid-cols-[minmax(0,2.2fr)_minmax(220px,0.8fr)]'>
        <div className='space-y-3'>
          <article className='flex items-center gap-4 rounded-xl border border-[#cfe8d8] bg-[#fcfffd] p-4'>
            <span className='relative grid h-16 w-16 shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#18bc5d] to-[#078c3f] text-white shadow-md'>
              <IconoMedico className='h-9 w-9' nombre='check' strokeWidth={3} />
              <span className='absolute -left-3 top-2 text-[#37c6ff]'>✦</span>
              <span className='absolute -right-3 -top-2 text-[#68d83a]'>✦</span>
              <span className='absolute -right-4 bottom-1 text-[#a351ff]'>✦</span>
              <span className='absolute -left-5 bottom-0 text-[#ffbd17]'>✦</span>
            </span>
            <div>
              <h2 className='text-[17px] font-extrabold text-[#079447]'>¡Paciente registrado correctamente!</h2>
              <p className='mt-1 text-[9px] leading-[14px] text-[#405a85]'>
                La ficha provisional y las credenciales quedaron creadas en una sola operación.
                <br />
                Ya puedes abrir la ficha real del paciente para continuar con su atención.
              </p>
            </div>
          </article>

          <article className='rounded-xl border border-[#dbe5ef] bg-white p-4 shadow-[0_1px_3px_rgba(18,52,91,0.04)]'>
            <h3 className='text-[12px] font-extrabold text-[#173478]'>Resumen completo del paciente</h3>
            <div className='mt-3 grid gap-5 md:grid-cols-3'>
              <GrupoDetalle filas={datosPersonales} icono='user' titulo='Datos personales del menor' />
              <GrupoDetalle filas={contactoFamiliar} icono='user' titulo='Contacto familiar' />
              <GrupoDetalle filas={accesoHabilitado} icono='activity' titulo='Canal habilitado' />
            </div>
          </article>

          <div className='flex items-start gap-2 rounded-lg border border-[#cfe5fb] bg-[#f2f8ff] p-3 text-[9px] leading-[14px] text-[#176bd1]'>
            <span className='grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[#1680ea] text-white'>
              <IconoMedico className='h-3.5 w-3.5' nombre='info' strokeWidth={2.1} />
            </span>
            Las futuras actualizaciones del módulo del paciente (síntomas, medicación, citas y documentos) se
            reflejarán automáticamente en la plataforma del médico.
          </div>
        </div>

        <aside className='rounded-xl border border-[#d9e9e2] bg-[#fcfffd] p-4'>
          <h2 className='text-[13px] font-extrabold text-[#079447]'>Acceso habilitado</h2>
          <p className='mt-2 text-[9px] leading-[13px] text-[#405a85]'>
            La familia ya puede ingresar con sus credenciales:
          </p>

          <div className='mt-3 space-y-3'>
            <CanalAccesoPacienteComp
              compacto
              descripcionApp='Acceso a medicación, síntomas, tratamiento, citas y documentos.'
              descripcionWhatsApp='Canal preferido para orientar y acompañar a la familia.'
              etiqueta='Canal preferido'
              onCambiar={setCanalSeleccionado}
              valor={canalSeleccionado}
            />
            <CredencialesAccesoPacienteComp compacto credenciales={credenciales} />
          </div>

          <div className='mt-3 flex gap-2 rounded-xl border border-[#f5d48b] bg-[#fffaf0] p-3'>
            <span className='grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#fff0bf] text-[#ffb000]'>
              <IconoMedico className='h-4 w-4' nombre='star' />
            </span>
            <p className='text-[8px] leading-[12px] text-[#3d5680]'>
              <strong className='block text-[#173478]'>Perfil provisional.</strong>
              Completa los datos faltantes cuando la familia los confirme.
            </p>
          </div>
        </aside>
      </div>

      <div className='flex flex-wrap items-center justify-between gap-3 pt-1'>
        <div className='flex flex-wrap gap-3'>
          <button
            className='flex h-9 cursor-pointer items-center gap-2 rounded-lg border border-[#d6e1ec] bg-white px-5 text-[9px] font-bold text-[#27447f] transition hover:bg-[#f7fafc] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#08a9bb]'
            onClick={onFicha}
            type='button'
          >
            <IconoMedico className='h-4 w-4' nombre='user' />
            Ir a la ficha del paciente
          </button>
          <button
            className='flex h-9 cursor-pointer items-center gap-2 rounded-lg border border-[#d6e1ec] bg-white px-5 text-[9px] font-bold text-[#27447f] transition hover:bg-[#f7fafc] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#08a9bb]'
            onClick={onSeguimiento}
            type='button'
          >
            <IconoMedico className='h-4 w-4' nombre='chart' />
            Ver seguimiento
          </button>
        </div>
        <button
          className='flex h-9 min-w-[215px] cursor-pointer items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#08aabd] to-[#078eaa] px-6 text-[10px] font-bold text-white shadow-sm transition hover:brightness-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#08a9bb]'
          onClick={onVolver}
          type='button'
        >
          <IconoMedico className='h-4 w-4' nombre='users' />
          Volver a pacientes
        </button>
      </div>
    </section>
  )
}

export default NuevoPaso3
