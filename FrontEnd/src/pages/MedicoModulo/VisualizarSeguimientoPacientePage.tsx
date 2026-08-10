import { useMemo, useState } from 'react'

import fondoPaciente from '../../assets/FondoNiño5.png'
import HeaderDoctorMedicoComp from '../../components/HeaderDoctorMedicoComp'
import MenuMedicoComp from '../../components/MenuMedicoComp'
import PanelLateralSeguimientoComp from '../../components/PanelLateralSeguimientoComp'
import PerfilSeguimientoPacienteComp from '../../components/PerfilSeguimientoPacienteComp'
import RegistrosSeguimientoComp from '../../components/RegistrosSeguimientoComp'
import useRedirrecion from '../../hooks/Redirrecion'
import type {
  FiltroDetalleSeguimiento,
  OpcionFiltroDetalle,
  PerfilSeguimientoPaciente,
  RegistroSeguimientoPaciente,
  ResumenPanelSeguimiento,
} from '../../types/SeguimientoPaciente'

const DOCTORA = {
  especialidad: 'Hematología Pediátrica',
  nombre: 'Dra. Valeria Ruiz',
}

const PERFIL_PACIENTE: PerfilSeguimientoPaciente = {
  adultoResponsable: 'María Flores López',
  diagnostico: 'Leucemia linfoblástica aguda (LLA)',
  edad: 8,
  estado: 'Activo',
  fechaProximaCita: '27/05/2025',
  historiaClinica: 'HC-2024-01568',
  horaProximaCita: '10:30 a. m.',
  imagen: fondoPaciente,
  nombre: 'Mateo Gabriel Flores',
  parentescoResponsable: 'Madre',
  semaforo: 'Verde',
  semaforoDescripcion: 'Sin síntomas significativos',
  ultimaSincronizacion: 'hoy 08:45 a. m.',
}

const FILTROS: OpcionFiltroDetalle[] = [
  { etiqueta: 'Todos', valor: 'todos' },
  { etiqueta: 'Medicación', valor: 'medicacion' },
  { etiqueta: 'Síntomas', valor: 'sintomas' },
  { etiqueta: 'Tratamiento', valor: 'tratamiento' },
  { etiqueta: 'Documento', valor: 'documento' },
]

const REGISTROS_SEGUIMIENTO: RegistroSeguimientoPaciente[] = [
  {
    estado: 'Cumplido',
    fecha: '20/05/2025',
    hora: '08:00 a. m.',
    id: 'medicacion-prednisona',
    origen: 'App móvil',
    resumen: 'Prednisona 10 mg confirmada',
    tipo: 'medicacion',
  },
  {
    estado: 'Alerta',
    fecha: '18/05/2025',
    hora: '09:00 a. m.',
    id: 'medicacion-omeprazol',
    origen: 'App móvil',
    resumen: 'Omeprazol 20 mg no tomada',
    tipo: 'medicacion',
  },
  {
    estado: 'En seguimiento',
    fecha: '17/05/2025',
    hora: '08:30 a. m.',
    id: 'medicacion-acido-folico',
    origen: 'WhatsApp',
    resumen: 'Ácido fólico tomado con retraso',
    tipo: 'medicacion',
  },
  {
    estado: 'Revisado',
    fecha: '16/05/2025',
    hora: '07:45 a. m.',
    id: 'medicacion-sulfato-ferroso',
    origen: 'App móvil',
    resumen: 'Sulfato ferroso confirmado',
    tipo: 'medicacion',
  },
  {
    estado: 'Alerta',
    fecha: '15/05/2025',
    hora: '06:15 p. m.',
    id: 'medicacion-no-disponible',
    origen: 'WhatsApp',
    resumen: 'No había medicamento disponible',
    tipo: 'medicacion',
  },
  {
    estado: 'Revisado',
    fecha: '20/05/2025',
    hora: '10:30 a. m.',
    id: 'sintoma-nauseas',
    origen: 'WhatsApp',
    resumen: 'Náuseas leves, sin fiebre',
    tipo: 'sintomas',
  },
  {
    estado: 'En seguimiento',
    fecha: '19/05/2025',
    hora: '09:15 a. m.',
    id: 'sintoma-sin-reporte',
    origen: 'App móvil',
    resumen: 'Sin síntomas reportados',
    tipo: 'sintomas',
  },
  {
    estado: 'Cerrado',
    fecha: '18/05/2025',
    hora: '07:45 p. m.',
    id: 'sintoma-dolor-abdominal',
    origen: 'WhatsApp',
    resumen: 'Dolor abdominal leve',
    tipo: 'sintomas',
  },
  {
    estado: 'Alerta',
    fecha: '17/05/2025',
    hora: '08:20 a. m.',
    id: 'sintoma-fiebre',
    origen: 'App móvil',
    resumen: 'Fiebre 38.2 °C reportada',
    tipo: 'sintomas',
  },
  {
    estado: 'Revisado',
    fecha: '16/05/2025',
    hora: '06:40 p. m.',
    id: 'sintoma-cansancio',
    origen: 'WhatsApp',
    resumen: 'Cansancio leve durante la tarde',
    tipo: 'sintomas',
  },
  {
    estado: 'Revisado',
    fecha: '20/05/2025',
    hora: '10:30 a. m.',
    id: 'tratamiento-lectura-indicaciones',
    origen: 'WhatsApp',
    resumen: 'Confirmó lectura de indicaciones médicas',
    tipo: 'tratamiento',
  },
  {
    estado: 'Cumplido',
    fecha: '20/05/2025',
    hora: '09:15 a. m.',
    id: 'tratamiento-continua',
    origen: 'App móvil',
    resumen: 'Continúa tratamiento actual según evaluación médica',
    tipo: 'tratamiento',
  },
  {
    estado: 'Revisado',
    fecha: '19/05/2025',
    hora: '06:00 p. m.',
    id: 'tratamiento-indicaciones-casa',
    origen: 'WhatsApp',
    resumen: 'Indicaciones para casa comprendidas por la familia',
    tipo: 'tratamiento',
  },
  {
    estado: 'Cumplido',
    fecha: '19/05/2025',
    hora: '03:15 p. m.',
    id: 'tratamiento-proximo-control',
    origen: 'App móvil',
    resumen: 'Próximo control registrado',
    tipo: 'tratamiento',
  },
  {
    estado: 'Registrado',
    fecha: '18/05/2025',
    hora: '09:00 a. m.',
    id: 'tratamiento-recomendado-medico',
    origen: 'Médico',
    resumen: 'Tratamiento recomendado por el médico',
    tipo: 'tratamiento',
  },
  {
    estado: 'Revisado',
    fecha: '20/05/2025',
    hora: '11:15 a. m.',
    id: 'documento-hemograma',
    origen: 'WhatsApp',
    resumen: 'Hemograma completo subido',
    tipo: 'documento',
  },
  {
    estado: 'Revisado',
    fecha: '19/05/2025',
    hora: '04:20 p. m.',
    id: 'documento-informe-medico',
    origen: 'App móvil',
    resumen: 'Informe médico escaneado',
    tipo: 'documento',
  },
  {
    estado: 'En seguimiento',
    fecha: '18/05/2025',
    hora: '09:40 a. m.',
    id: 'documento-resultados-laboratorio',
    origen: 'WhatsApp',
    resumen: 'Resultados laboratorio JPG',
    tipo: 'documento',
  },
  {
    estado: 'Revisado',
    fecha: '17/05/2025',
    hora: '06:35 p. m.',
    id: 'documento-perfil-hepatico',
    origen: 'App móvil',
    resumen: 'Perfil hepático PDF cargado',
    tipo: 'documento',
  },
  {
    estado: 'Alerta',
    fecha: '16/05/2025',
    hora: '08:10 a. m.',
    id: 'documento-datos-pendientes',
    origen: 'WhatsApp',
    resumen: 'Hemograma con datos pendientes de revisión',
    tipo: 'documento',
  },
]

const IDS_REGISTROS_TODOS = [
  'medicacion-prednisona',
  'sintoma-nauseas',
  'tratamiento-lectura-indicaciones',
  'documento-hemograma',
  'medicacion-omeprazol',
]

const REGISTROS_TODOS = IDS_REGISTROS_TODOS.flatMap((id) => {
  const registro = REGISTROS_SEGUIMIENTO.find((item) => item.id === id)
  return registro ? [registro] : []
})

const REGISTROS_POR_FILTRO: Record<FiltroDetalleSeguimiento, RegistroSeguimientoPaciente[]> = {
  documento: REGISTROS_SEGUIMIENTO.filter((registro) => registro.tipo === 'documento'),
  medicacion: REGISTROS_SEGUIMIENTO.filter((registro) => registro.tipo === 'medicacion'),
  sintomas: REGISTROS_SEGUIMIENTO.filter((registro) => registro.tipo === 'sintomas'),
  todos: REGISTROS_TODOS,
  tratamiento: REGISTROS_SEGUIMIENTO.filter((registro) => registro.tipo === 'tratamiento'),
}

const TOTAL_REGISTROS: Record<FiltroDetalleSeguimiento, number> = {
  documento: 5,
  medicacion: 5,
  sintomas: 5,
  todos: 32,
  tratamiento: 5,
}

const RESUMEN_SEGUIMIENTO: ResumenPanelSeguimiento = {
  adherenciaGeneral: 87,
  adherenciaMedicacion: 78,
  documentos: [
    { fecha: '20/05/2025', id: 'doc-hemograma', nombre: 'Hemograma completo', origen: 'WhatsApp' },
    { fecha: '19/05/2025', id: 'doc-informe', nombre: 'Informe médico escaneado', origen: 'App móvil' },
    { fecha: '18/05/2025', id: 'doc-laboratorio', nombre: 'Resultados laboratorio JPG', origen: 'WhatsApp' },
  ],
  documentosRecientes: [
    { fecha: '19/05/2025', id: 'doc-reciente-hemograma', nombre: 'Hemograma completo', origen: 'WhatsApp' },
    { fecha: '15/05/2025', id: 'doc-reciente-indicaciones', nombre: 'Indicaciones médicas', origen: 'App móvil' },
  ],
  dosisOmitida: {
    fecha: '18/05/2025',
    hora: '09:00 a. m.',
    medicamento: 'Omeprazol 20 mg',
  },
  indicacionesTratamiento: [
    'Continuar Prednisona 10 mg cada 24 h.',
    'Omeprazol 20 mg a la 1:00 p. m.',
    'Hemograma antes del próximo control.',
    'Mantener hidratación adecuada.',
    'Vigilar fiebre y signos de alarma.',
  ],
  medicamentoReciente: {
    fecha: '20/05/2025',
    hora: '08:00 a. m.',
    nombre: 'Prednisona 10 mg confirmada',
  },
  resumenDocumental: {
    alertas: 1,
    enSeguimiento: 2,
    revisados: 5,
    total: 8,
  },
  semaforo: 'Verde',
  semaforoDescripcion: 'Sin síntomas significativos',
  sintomaReciente: {
    conAlerta: 1,
    descripcion: 'Náuseas leves, sin fiebre',
    fecha: '20/05/2025',
    hora: '10:30 a. m.',
    sinSintomas: 1,
    totalReportes: 5,
  },
}

function VisualizarSeguimientoPacientePage() {
  const [busqueda, setBusqueda] = useState('')
  const [filtroActivo, setFiltroActivo] = useState<FiltroDetalleSeguimiento>('todos')
  const redirigir = useRedirrecion()

  const registrosVisibles = useMemo(() => {
    const termino = busqueda.trim().toLocaleLowerCase('es')

    if (!termino) {
      return REGISTROS_POR_FILTRO[filtroActivo]
    }

    return REGISTROS_POR_FILTRO[filtroActivo].filter((registro) =>
      [registro.fecha, registro.hora, registro.origen, registro.resumen, registro.estado]
        .join(' ')
        .toLocaleLowerCase('es')
        .includes(termino),
    )
  }, [busqueda, filtroActivo])

  function cambiarFiltro(filtro: FiltroDetalleSeguimiento) {
    setFiltroActivo(filtro)
    setBusqueda('')
  }

  function limpiarFiltros() {
    setBusqueda('')
    setFiltroActivo('todos')
  }

  const totalVisible = busqueda.trim() ? registrosVisibles.length : TOTAL_REGISTROS[filtroActivo]

  return (
    <div className='flex min-h-dvh bg-[#fbfdff]'>
      <MenuMedicoComp variante='seguimiento' />

      <div className='min-w-0 flex-1'>
        <HeaderDoctorMedicoComp
          especialidad={DOCTORA.especialidad}
          nombre={DOCTORA.nombre}
          notificaciones={5}
          variante='detalleSeguimiento'
        />

        <main className='min-h-[calc(100dvh-52px)] px-[clamp(16px,2vw,26px)] pb-2 pt-[18px]'>
          <div className='mx-auto w-full max-w-[1260px]'>
            <header>
              <h1 className='text-[clamp(25px,2.1vw,28px)] font-extrabold leading-[34px] tracking-[-0.035em] text-[#0a2b79]'>
                Seguimiento del paciente
              </h1>
              <p className='mt-0.5 text-[10px] font-medium leading-[14px] text-[#50658a]'>
                Información consolidada desde WhatsApp y la app móvil para seguimiento clínico.
              </p>
            </header>

            <div className='mt-4 grid items-start gap-3.5 xl:grid-cols-[minmax(0,1fr)_280px]'>
              <div className='min-w-0'>
                <PerfilSeguimientoPacienteComp perfil={PERFIL_PACIENTE} />
                <div className='mt-4'>
                  <RegistrosSeguimientoComp
                    busqueda={busqueda}
                    filtroActivo={filtroActivo}
                    filtros={FILTROS}
                    onCambiarBusqueda={setBusqueda}
                    onCambiarFiltro={cambiarFiltro}
                    onLimpiarFiltros={limpiarFiltros}
                    onVerRegistro={() => redirigir('/doctor/ficha')}
                    registros={registrosVisibles}
                    totalRegistros={totalVisible}
                  />
                </div>
              </div>

              <div className='min-w-0 xl:-mt-9 xl:sticky xl:top-16'>
                <PanelLateralSeguimientoComp
                  filtroActivo={filtroActivo}
                  onRegistrarAccion={() => redirigir('/doctor/consulta')}
                  onVerDocumento={() => redirigir('/doctor/ficha')}
                  onVerDocumentos={() => redirigir('/doctor/ficha')}
                  onVerFicha={() => redirigir('/doctor/ficha')}
                  onVerHistorial={() => redirigir('/doctor/historial')}
                  resumen={RESUMEN_SEGUIMIENTO}
                />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default VisualizarSeguimientoPacientePage
