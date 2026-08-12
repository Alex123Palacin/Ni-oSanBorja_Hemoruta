import { useEffect, useState } from 'react'

import {
  listarPacientesMedicoApi,
  type PacienteMedicoListaApi,
} from '../../api/medico/MedicoApi'
import { obtenerMensajeErrorApi } from '../../api/compartido/ClienteApi'
import HeaderDoctorMedicoComp from '../../components/HeaderDoctorMedicoComp'
import MenuMedicoComp from '../../components/MenuMedicoComp'
import FiltrosGestionPacientesComp from '../../components/medicoMcomp/FiltrosGestionPacientesComp'
import ResumenPacientesRegistradosComp from '../../components/medicoMcomp/ResumenPacientesRegistradosComp'
import TablaPacientesComp from '../../components/medicoMcomp/TablaPacientesComp'
import useRedirrecion from '../../hooks/Redirrecion'
import useGestionarPacientes from '../../hooks/useGestionarPacientes'
import type { EstadoPaciente, Paciente, TipoBusqueda } from '../../types/GestionarPacientes'
import { BtnCrear } from '../../ui/BotonUi'
import type { OpcionComboBox } from '../../ui/ComboBoxUI'

const DOCTORA = {
  especialidad: 'Hematología Pediátrica',
  nombre: 'Dra. Valeria Ruiz',
}

const CLAVE_PACIENTE_SELECCIONADO = 'hemoruta.medico.pacienteId'

const OPCIONES_DIAGNOSTICO: OpcionComboBox[] = [
  { etiqueta: 'Todos los diagnósticos', valor: 'todos' },
  { etiqueta: 'Anemia aplásica', valor: 'Anemia aplásica' },
  { etiqueta: 'Hemofilia A severa', valor: 'Hemofilia A severa' },
  { etiqueta: 'Leucemia linfoblástica aguda', valor: 'Leucemia linfoblástica aguda (LLA)' },
  { etiqueta: 'Linfoma de Hodgkin', valor: 'Linfoma de Hodgkin' },
  { etiqueta: 'Talasemia beta mayor', valor: 'Talasemia beta mayor' },
]

const OPCIONES_ESTADO: OpcionComboBox[] = [
  { etiqueta: 'Todos los estados', valor: 'todos' },
  { etiqueta: 'Hoy', valor: 'Hoy' },
  { etiqueta: 'Evaluado', valor: 'Evaluado' },
  { etiqueta: 'Programado', valor: 'Programado' },
]

const CAMPOS_BUSQUEDA = [
  { etiqueta: 'DNI', valor: 'dni' },
  { etiqueta: 'Nombre del paciente', valor: 'nombre' },
] as const satisfies readonly { etiqueta: string; valor: TipoBusqueda }[]

const COLUMNAS = [
  'Paciente',
  'DNI',
  'Tutor responsable',
  'Diagnóstico principal',
  'Próxima cita',
  'Estado',
  'Acciones',
] as const

const COLORES_AVATAR = ['bg-[#dff5ef]', 'bg-[#fff0dd]', 'bg-[#dff4f7]', 'bg-[#ffe7df]'] as const

function obtenerEstadoPaciente(estadoCita: string, proximaCitaEn: string | null): EstadoPaciente {
  if (proximaCitaEn) {
    const fechaCita = new Date(proximaCitaEn)
    const hoy = new Date()
    if (
      fechaCita.getFullYear() === hoy.getFullYear() &&
      fechaCita.getMonth() === hoy.getMonth() &&
      fechaCita.getDate() === hoy.getDate()
    ) {
      return 'Hoy'
    }
  }

  return ['ATENDIDA', 'COMPLETADA', 'EVALUADA'].includes(estadoCita.toUpperCase())
    ? 'Evaluado'
    : 'Programado'
}

function formatearProximaCita(proximaCitaEn: string | null) {
  if (!proximaCitaEn) return { fechaCita: 'Sin cita', horaCita: '' }

  const fecha = new Date(proximaCitaEn)
  if (Number.isNaN(fecha.getTime())) return { fechaCita: 'Sin cita', horaCita: '' }

  return {
    fechaCita: new Intl.DateTimeFormat('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(fecha),
    horaCita: new Intl.DateTimeFormat('es-PE', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(fecha),
  }
}

function adaptarPacienteApi(paciente: PacienteMedicoListaApi, indice: number): Paciente {
  const cita = formatearProximaCita(paciente.proximaCitaEn)

  return {
    avatar: (paciente.edad ?? 0) % 2 === 0 ? '👦🏽' : '👧🏽',
    colorAvatar: COLORES_AVATAR[indice % COLORES_AVATAR.length],
    diagnostico: paciente.diagnosticoPrincipal?.nombre ?? 'Sin diagnóstico registrado',
    dni: paciente.dni || '—',
    edad: paciente.edad,
    estado: obtenerEstadoPaciente(paciente.estadoCita, paciente.proximaCitaEn),
    fechaCita: cita.fechaCita,
    horaCita: cita.horaCita,
    id: paciente.id,
    nombre: paciente.nombre,
    parentescoTutor: paciente.tutor?.parentesco ?? 'Sin parentesco',
    tutor: paciente.tutor?.nombre ?? 'Sin tutor registrado',
  }
}

function GestionarPacientesPage() {
  const redirigir = useRedirrecion()
  const [pacientes, setPacientes] = useState<Paciente[]>([])
  const [totalPacientes, setTotalPacientes] = useState(0)
  const [cargando, setCargando] = useState(true)
  const [errorCarga, setErrorCarga] = useState('')
  const [intentoCarga, setIntentoCarga] = useState(0)

  useEffect(() => {
    let estaMontado = true

    async function cargarPacientes() {
      setCargando(true)
      setErrorCarga('')

      try {
        const respuesta = await listarPacientesMedicoApi({ tamanoPagina: 100 })
        if (!estaMontado) return
        setPacientes(respuesta.resultados.map(adaptarPacienteApi))
        setTotalPacientes(respuesta.paginacion.total)
      } catch (error) {
        if (!estaMontado) return
        setPacientes([])
        setTotalPacientes(0)
        setErrorCarga(obtenerMensajeErrorApi(error))
      } finally {
        if (estaMontado) setCargando(false)
      }
    }

    void cargarPacientes()
    return () => {
      estaMontado = false
    }
  }, [intentoCarga])

  const {
    busqueda,
    diagnostico,
    estado,
    limpiarFiltros,
    pacientesFiltrados,
    setBusqueda,
    setDiagnostico,
    setEstado,
    setTipoBusqueda,
    tipoBusqueda,
  } = useGestionarPacientes(pacientes)

  function verFichaPaciente(paciente: Paciente) {
    window.sessionStorage.setItem(CLAVE_PACIENTE_SELECCIONADO, paciente.id)
    redirigir('/doctor/ficha')
  }

  return (
    <div className='flex min-h-dvh bg-[#fbfdff] font-sans'>
      <MenuMedicoComp />

      <div className='min-w-0 flex-1'>
        <HeaderDoctorMedicoComp
          especialidad={DOCTORA.especialidad}
          nombre={DOCTORA.nombre}
          variante='amplia'
        />

        <main className='min-h-[calc(100dvh-54px)] px-4 pb-3 pt-5 sm:px-6 xl:px-8'>
          <div className='mx-auto w-full max-w-[1220px]'>
            <div className='flex flex-col gap-3 px-1 sm:flex-row sm:items-start sm:justify-between'>
              <div className='min-w-0'>
                <h1 className='text-[clamp(28px,2.45vw,32px)] font-extrabold leading-[1.08] tracking-[-0.035em] text-[#0a2b79]'>
                  Pacientes
                </h1>
                <p className='mt-1 text-[clamp(11px,.92vw,13px)] font-medium leading-5 text-[#50658a]'>
                  Gestiona y consulta la ficha longitudinal de los pacientes hematológicos pediátricos.
                </p>
              </div>
              <BtnCrear ruta='/doctor/nuevoRegistro' tamano='compacto' texto='Nuevo paciente' />
            </div>

            {!cargando && !errorCarga && (
              <ResumenPacientesRegistradosComp totalPacientes={totalPacientes} />
            )}

            {cargando && (
              <div
                aria-live='polite'
                className='mt-5 grid h-[108px] w-[320px] max-w-full place-items-center rounded-xl border border-[#d8e8ef] bg-[#f7fcfd] px-5 text-[12px] font-semibold text-[#526a91]'
                role='status'
              >
                Cargando pacientes…
              </div>
            )}

            {!cargando && errorCarga && (
              <div
                className='mt-5 flex min-h-[108px] w-[420px] max-w-full flex-col items-start justify-center gap-3 rounded-xl border border-[#f1c9c9] bg-[#fff7f7] px-5 py-4 text-[12px] text-[#9a3434]'
                role='alert'
              >
                <p>No fue posible cargar los pacientes. {errorCarga}</p>
                <button
                  className='rounded-lg border border-[#d69a9a] bg-white px-3 py-1.5 font-bold transition hover:bg-[#fff0f0]'
                  onClick={() => setIntentoCarga((actual) => actual + 1)}
                  type='button'
                >
                  Reintentar
                </button>
              </div>
            )}

            <FiltrosGestionPacientesComp
              busqueda={busqueda}
              camposBusqueda={CAMPOS_BUSQUEDA}
              diagnostico={diagnostico}
              estado={estado}
              onCambiarBusqueda={setBusqueda}
              onCambiarDiagnostico={setDiagnostico}
              onCambiarEstado={setEstado}
              onCambiarTipoBusqueda={setTipoBusqueda}
              onLimpiarFiltros={limpiarFiltros}
              opcionesDiagnostico={OPCIONES_DIAGNOSTICO}
              opcionesEstado={OPCIONES_ESTADO}
              tipoBusqueda={tipoBusqueda}
            />

            {!cargando && !errorCarga && totalPacientes > 0 && (
              <TablaPacientesComp
                columnas={COLUMNAS}
                onVerFicha={verFichaPaciente}
                pacientes={pacientesFiltrados}
                totalPacientes={totalPacientes}
              />
            )}

            {!cargando && !errorCarga && totalPacientes === 0 && (
              <section className='mt-2.5 grid min-h-44 place-items-center rounded-xl border border-[#dce5ee] bg-white px-6 text-center shadow-[0_5px_16px_rgba(18,52,91,0.08)]'>
                <div>
                  <p className='text-[13px] font-bold text-[#173679]'>Aún no hay pacientes registrados</p>
                  <p className='mt-1 text-[11px] text-[#617493]'>Los pacientes creados aparecerán en esta lista.</p>
                </div>
              </section>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

export default GestionarPacientesPage
