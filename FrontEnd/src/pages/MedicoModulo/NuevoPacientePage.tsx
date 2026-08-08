import { useState } from 'react'

import HeaderDoctorMedicoComp from '../../components/HeaderDoctorMedicoComp'
import MenuMedicoComp from '../../components/MenuMedicoComp'
import NuevoPaso1 from '../../components/NuevoPaso1'
import NuevoPaso2 from '../../components/NuevoPaso2'
import NuevoPaso3 from '../../components/NuevoPaso3'
import ProgresionComp from '../../components/ProgresionComp'
import { useProgreso } from '../../hooks/ProgresoNewpaso'
import useRedirrecion from '../../hooks/Redirrecion'
import type {
  DatosPaciente,
  FormularioActivacion,
  PasoActivacion,
} from '../../types/NuevoPaciente'

const DOCTORA = {
  especialidad: 'Hematología Pediátrica',
  nombre: 'Dra. Valeria Ruiz',
}

const DATOS_PACIENTE: DatosPaciente = {
  canal: 'WhatsApp',
  canalesActivos: ['WhatsApp', 'App móvil'],
  correo: 'maria.flores@email.com',
  diagnostico: 'Hemofilia A moderada',
  direccion: 'Av. Javier Prado Este 1234, San Borja, Lima',
  dni: '74585684',
  dniTutor: '45678912',
  estado: 'Listo para enviar',
  factorBase: 'VIII: 2%',
  fechaActivacion: '24/05/2025 10:30 a. m.',
  fechaNacimiento: '12/05/2018 (6 años)',
  grupoRh: 'O+',
  idioma: 'Español',
  nombre: 'Mateo Gabriel Flores',
  parentesco: 'Madre',
  peso: '20.5 kg',
  registradoPor: 'Familia a través de WhatsApp',
  telefono: '+51 987 654 321',
  tutor: 'María Flores López',
}

const FORMULARIO_INICIAL: FormularioActivacion = {
  canal: 'WhatsApp',
  copiaCorreo: false,
  correo: '',
  dni: '',
  nombre: '',
  telefono: '',
}

const CABECERAS: Record<PasoActivacion, { descripcion: string; titulo: string }> = {
  1: {
    descripcion: 'Registra solo los datos básicos para activar el acceso por WhatsApp o la app móvil.',
    titulo: 'Activación de cuenta del paciente',
  },
  2: {
    descripcion: 'Registra solo los datos básicos para activar el acceso por app móvil y WhatsApp.',
    titulo: 'Activación de cuenta del paciente',
  },
  3: {
    descripcion: 'La familia completó exitosamente el registro a través de WhatsApp o la app móvil.',
    titulo: 'Cuenta activada',
  },
}

function NuevoPacientePage() {
  const [formulario, setFormulario] = useState<FormularioActivacion>(FORMULARIO_INICIAL)
  const { irAlAnterior, irAlSiguiente, paso } = useProgreso()
  const redirigir = useRedirrecion()
  const cabecera = CABECERAS[paso]
  const datosActuales: DatosPaciente = {
    ...DATOS_PACIENTE,
    canal: formulario.canal,
    correo: formulario.correo || DATOS_PACIENTE.correo,
    dni: formulario.dni || DATOS_PACIENTE.dni,
    nombre: formulario.nombre || DATOS_PACIENTE.nombre,
    telefono: formulario.telefono || DATOS_PACIENTE.telefono,
  }

  function actualizarFormulario<Campo extends keyof FormularioActivacion>(
    campo: Campo,
    valor: FormularioActivacion[Campo],
  ) {
    setFormulario((actual) => ({ ...actual, [campo]: valor }))
  }

  return (
    <div className='flex min-h-screen bg-[#fbfdff]'>
      <MenuMedicoComp />

      <div className='min-w-0 flex-1'>
        <HeaderDoctorMedicoComp especialidad={DOCTORA.especialidad} nombre={DOCTORA.nombre} />

        <main className='min-h-[calc(100vh-46px)] px-4 py-5 sm:px-6 xl:px-8'>
          <div className='mx-auto w-full max-w-[1220px]'>
            <header className='mb-3 px-2'>
              <h1 className='text-[22px] font-extrabold tracking-[-0.02em] text-[#082a79]'>{cabecera.titulo}</h1>
              <p className='mt-0.5 text-[10px] font-medium text-[#4f668d]'>{cabecera.descripcion}</p>
            </header>

            <ProgresionComp paso={paso} />

            <div className='mt-3'>
              {paso === 1 && (
                <NuevoPaso1
                  actualizarFormulario={actualizarFormulario}
                  datos={DATOS_PACIENTE}
                  formulario={formulario}
                  onCancelar={() => redirigir('/doctor/pacientes')}
                  onContinuar={irAlSiguiente}
                />
              )}

              {paso === 2 && (
                <NuevoPaso2 datos={datosActuales} onAnterior={irAlAnterior} onSiguiente={irAlSiguiente} />
              )}

              {paso === 3 && (
                <NuevoPaso3
                  datos={datosActuales}
                  onFicha={() => redirigir('/doctor/ficha')}
                  onSeguimiento={() => redirigir('/doctor/seguimiento')}
                  onVolver={() => redirigir('/doctor/pacientes')}
                />
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default NuevoPacientePage
