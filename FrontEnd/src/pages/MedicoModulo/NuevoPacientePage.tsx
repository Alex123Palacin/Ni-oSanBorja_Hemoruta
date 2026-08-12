import HeaderDoctorMedicoComp from '../../components/HeaderDoctorMedicoComp'
import MenuMedicoComp from '../../components/MenuMedicoComp'
import NuevoPaso1 from '../../components/NuevoPaso1'
import NuevoPaso2 from '../../components/NuevoPaso2'
import NuevoPaso3 from '../../components/NuevoPaso3'
import ProgresionComp from '../../components/ProgresionComp'
import { useProgreso } from '../../hooks/ProgresoNewpaso'
import useRedirrecion from '../../hooks/Redirrecion'
import useAltaPacienteMedico from '../../hooks/useAltaPacienteMedico'
import useFormularioNuevoPaciente from '../../hooks/useFormularioNuevoPaciente'
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
  correo: 'Por completar',
  diagnostico: 'Por completar',
  direccion: 'Por completar',
  dni: 'Por completar',
  dniTutor: 'Por completar',
  estado: 'Registro provisional',
  factorBase: 'Por completar',
  fechaActivacion: 'Registrado en HemoRuta',
  fechaNacimiento: 'Por completar',
  grupoRh: 'Por completar',
  historiaClinica: 'Se generará al guardar',
  idioma: 'Español',
  nombre: 'Por completar',
  parentesco: 'Por completar',
  peso: 'Por completar',
  registradoPor: 'Médico tratante',
  telefono: 'Por completar',
  tutor: 'Responsable por completar',
}

const FORMULARIO_INICIAL: FormularioActivacion = {
  canal: 'WhatsApp',
  correo: '',
  dni: '',
  nombre: '',
  telefono: '',
}

const CABECERAS: Record<PasoActivacion, { descripcion: string; titulo: string }> = {
  1: {
    descripcion: 'Registra los datos básicos para crear la ficha provisional y habilitar el acceso familiar.',
    titulo: 'Nuevo paciente',
  },
  2: {
    descripcion: 'La ficha y la cuenta ya fueron creadas. Conserva las credenciales temporales.',
    titulo: 'Paciente registrado',
  },
  3: {
    descripcion: 'El paciente ya forma parte de tu listado y puede abrirse en su ficha real.',
    titulo: 'Registro completado',
  },
}

const CLAVE_PACIENTE_SELECCIONADO = 'hemoruta.medico.pacienteId'

function NuevoPacientePage() {
  const { irAlSiguiente, paso } = useProgreso()
  const redirigir = useRedirrecion()
  const { cargando, error, registrar, resultado } = useAltaPacienteMedico()
  const cabecera = CABECERAS[paso]
  const { actualizarFormulario, datosActuales, formulario } = useFormularioNuevoPaciente({
    datosBase: DATOS_PACIENTE,
    formularioInicial: FORMULARIO_INICIAL,
  })
  const datosRegistrados: DatosPaciente = resultado
    ? {
        ...datosActuales,
        dni: resultado.paciente.dni,
        estado: resultado.paciente.estado,
        historiaClinica: resultado.paciente.historiaClinica,
        nombre: resultado.paciente.nombre,
      }
    : datosActuales

  async function registrarPaciente() {
    const alta = await registrar(formulario)
    if (!alta) return
    window.sessionStorage.setItem(CLAVE_PACIENTE_SELECCIONADO, alta.paciente.id)
    irAlSiguiente()
  }

  function abrirFicha() {
    if (!resultado) return
    window.sessionStorage.setItem(CLAVE_PACIENTE_SELECCIONADO, resultado.paciente.id)
    redirigir('/doctor/ficha')
  }

  function abrirSeguimiento() {
    if (!resultado) return
    window.sessionStorage.setItem(CLAVE_PACIENTE_SELECCIONADO, resultado.paciente.id)
    redirigir('/doctor/visualizar')
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
                  cargando={cargando}
                  error={error}
                  onCancelar={() => redirigir('/doctor/pacientes')}
                  onContinuar={registrarPaciente}
                />
              )}

              {paso === 2 && resultado && (
                <NuevoPaso2
                  credenciales={resultado.cuenta}
                  datos={datosRegistrados}
                  onAnterior={() => redirigir('/doctor/pacientes')}
                  onSiguiente={irAlSiguiente}
                />
              )}

              {paso === 3 && resultado && (
                <NuevoPaso3
                  credenciales={resultado.cuenta}
                  datos={datosRegistrados}
                  onFicha={abrirFicha}
                  onSeguimiento={abrirSeguimiento}
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
