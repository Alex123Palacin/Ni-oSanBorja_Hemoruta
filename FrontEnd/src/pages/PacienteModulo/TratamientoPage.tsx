import FondoNino from '../../assets/FondoNiño5.png'
import AdaptadoMobil from '../../components/pacienteMcomp/AdaptadoMobil'
import InformacionPacienteComp from '../../components/pacienteMcomp/InformacionPacienteComp'
import MenuPaciente from '../../components/pacienteMcomp/MenuPaciente'
import PerfilPacienteNiñoComp, {
  type DatosPerfilPacienteNino,
} from '../../components/pacienteMcomp/PerfilPacienteNiñoComp'
import TratateComp, {
  type ItemTratamientoPaciente,
} from '../../components/pacienteMcomp/TratateComp'
import type { RespuestaTratamientoPacienteApi } from '../../api/paciente/PacienteApi'
import useDatosInicioPacienteApi from '../../hooks/useDatosInicioPacienteApi'
import useTratamientoPacienteApi from '../../hooks/useTratamientoPacienteApi'
import { formatearEdadPaciente } from '../../utils/paciente'

const PACIENTE_SIN_CARGAR: DatosPerfilPacienteNino = {
  edad: 'Edad por completar',
  estado: 'Pendiente',
  historiaClinica: 'Sin asignar',
  imagen: FondoNino,
  nombre: 'Paciente',
}

const TRATAMIENTO = {
  descripcion: 'Resumen de las indicaciones médicas registradas por el doctor.',
  titulo: 'Tratamiento actual',
} as const

const SIN_TRATAMIENTO: readonly ItemTratamientoPaciente[] = [
  {
    formato: 'texto',
    id: 'sin-tratamiento-cargado',
    lineas: [{ id: 'sin-datos', texto: 'No hay un tratamiento publicado para mostrar.' }],
    tipo: 'tratamiento-indicado',
    titulo: 'Sin tratamiento vigente',
  },
]

const INFORMACION_TRATAMIENTO = {
  actualizacionDescripcion: 'Esta información fue actualizada según el registro del doctor.',
  actualizacionFecha: 'Sin actualización',
  actualizacionFechaIso: '',
  actualizacionTitulo: 'Última actualización',
  documentosRuta: '/paciente/documentos',
  documentosTexto: 'Ver documentos relacionados',
  importanteDescripcion: 'Esta sección es informativa y se actualiza automáticamente con lo que el doctor haya registrado.',
  importanteTitulo: 'Importante',
} as const

const FORMATO_FECHA = new Intl.DateTimeFormat('es-PE', {
  day: '2-digit',
  month: '2-digit',
  timeZone: 'America/Lima',
  year: 'numeric',
})

function capitalizarEstado(valor: string) {
  const normalizado = valor.replaceAll('_', ' ').trim().toLocaleLowerCase('es-PE')
  return normalizado
    ? `${normalizado.charAt(0).toLocaleUpperCase('es-PE')}${normalizado.slice(1)}`
    : PACIENTE_SIN_CARGAR.estado
}

function lineasPlan(
  plan: NonNullable<RespuestaTratamientoPacienteApi['plan']>,
  tipo: NonNullable<RespuestaTratamientoPacienteApi['plan']>['items'][number]['tipo'],
) {
  return plan.items
    .filter((item) => item.tipo === tipo)
    .map((item) => ({ id: item.id, texto: item.descripcion || item.titulo }))
}

function crearIndicaciones(datos: RespuestaTratamientoPacienteApi): readonly ItemTratamientoPaciente[] {
  if (!datos.plan) {
    return [
      {
        formato: 'texto',
        id: 'sin-plan-vigente',
        lineas: [{ id: 'sin-plan', texto: 'El médico aún no ha publicado un tratamiento para este paciente.' }],
        tipo: 'tratamiento-indicado',
        titulo: 'Sin tratamiento vigente',
      },
    ]
  }

  const tratamiento = lineasPlan(datos.plan, 'TRATAMIENTO')
  const cuidados = lineasPlan(datos.plan, 'CUIDADO_CASA')
  const examenes = lineasPlan(datos.plan, 'EXAMEN')
  const controles = lineasPlan(datos.plan, 'CONTROL')
  const medicamentos = datos.medicamentos.map((medicamento) => ({
    id: medicamento.id,
    texto: [medicamento.nombre, medicamento.dosis, medicamento.frecuencia]
      .filter(Boolean)
      .join(' · '),
  }))

  return [
    {
      formato: 'texto',
      id: 'tratamiento-indicado',
      lineas: tratamiento.length
        ? tratamiento
        : [{ id: 'indicacion-general', texto: datos.plan.indicacionGeneral || datos.plan.nombre }],
      tipo: 'tratamiento-indicado',
      titulo: 'Tratamiento indicado',
    },
    {
      formato: 'lista',
      id: 'medicacion-indicada',
      lineas: medicamentos.length
        ? medicamentos
        : [{ id: 'sin-medicacion', texto: 'Sin medicación indicada en este plan.' }],
      tipo: 'medicacion-indicada',
      titulo: 'Medicación indicada',
    },
    {
      formato: 'texto',
      id: 'indicaciones-casa',
      lineas: cuidados.length
        ? cuidados
        : [{ id: 'sin-cuidados', texto: 'Sin indicaciones adicionales para casa.' }],
      tipo: 'indicaciones-casa',
      titulo: 'Indicaciones para casa',
    },
    {
      formato: 'texto',
      id: 'examenes-solicitados',
      lineas: examenes.length
        ? examenes
        : [{ id: 'sin-examenes', texto: 'Sin exámenes pendientes registrados.' }],
      tipo: 'examenes-solicitados',
      titulo: 'Exámenes solicitados',
    },
    {
      formato: 'texto',
      id: 'proximo-control',
      lineas: controles.length
        ? controles
        : [{ id: 'sin-control', texto: 'El próximo control aún no ha sido registrado.' }],
      tipo: 'proximo-control',
      titulo: 'Próximo control',
    },
  ]
}

function TratamientoPage() {
  const { datos: datosInicio, error: errorPerfil } = useDatosInicioPacienteApi()
  const { cargando, datos: tratamientoApi, error: errorTratamiento } = useTratamientoPacienteApi()
  const paciente: DatosPerfilPacienteNino = datosInicio
    ? {
        edad: formatearEdadPaciente(datosInicio.paciente.edad),
        estado: capitalizarEstado(datosInicio.paciente.estado),
        historiaClinica: datosInicio.paciente.historiaClinica,
        imagen: FondoNino,
        nombre: datosInicio.paciente.nombre,
      }
    : PACIENTE_SIN_CARGAR
  const indicaciones = tratamientoApi ? crearIndicaciones(tratamientoApi) : SIN_TRATAMIENTO
  const fechaActualizacion = tratamientoApi?.plan?.vigenteDesde
    ? FORMATO_FECHA.format(new Date(`${tratamientoApi.plan.vigenteDesde}T12:00:00`))
    : INFORMACION_TRATAMIENTO.actualizacionFecha
  const sinDatos = !cargando && !tratamientoApi

  return (
    <AdaptadoMobil estilos='bg-[#f8fbfd] text-[#082767]'>
      <div className='flex h-full min-h-0 w-full flex-col overflow-hidden bg-[#f8fbfd]'>
        <main className='min-h-0 flex-1 overflow-y-auto px-2.5 pb-2 pt-1'>
          <PerfilPacienteNiñoComp paciente={paciente} />

          {(errorPerfil || errorTratamiento || sinDatos) && (
            <p
              className='mt-1.5 rounded-md bg-[#fff8e8] px-2 py-1 text-center text-[6.7px] font-semibold text-[#9a6a17]'
              role='status'
              title={[errorPerfil, errorTratamiento].filter(Boolean).join(' ')}
            >
              No se pudo actualizar todo el tratamiento. Verifica la conexión con el hospital.
            </p>
          )}

          <div className='mt-2'>
            <TratateComp
              descripcion={TRATAMIENTO.descripcion}
              items={indicaciones}
              titulo={TRATAMIENTO.titulo}
            />
          </div>

          <div className='mt-2'>
            <InformacionPacienteComp
              {...INFORMACION_TRATAMIENTO}
              actualizacionFecha={fechaActualizacion}
              actualizacionFechaIso={tratamientoApi?.plan?.vigenteDesde ?? INFORMACION_TRATAMIENTO.actualizacionFechaIso}
              ariaLabel='Información relacionada con el tratamiento'
              imagenAlt='Niño de HemoRuta saludando'
              imagenPaciente={FondoNino}
            />
          </div>
        </main>

        <MenuPaciente />
      </div>
    </AdaptadoMobil>
  )
}

export default TratamientoPage
