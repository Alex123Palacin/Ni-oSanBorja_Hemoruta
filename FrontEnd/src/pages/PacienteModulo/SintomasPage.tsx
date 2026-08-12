import FondoNino from '../../assets/FondoNiño5.png'
import AdaptadoMobil from '../../components/pacienteMcomp/AdaptadoMobil'
import DetalleSintomasPacienteComp, {
  type EtiquetasDetalleSintomasPaciente,
  type OpcionDuracionSintomaPaciente,
  type OpcionEvolucionSintomaPaciente,
} from '../../components/pacienteMcomp/DetalleSintomasPacienteComp'
import InformacionSintomasPacienteComp from '../../components/pacienteMcomp/InformacionSintomasPacienteComp'
import EnviarSintomasPacienteComp from '../../components/pacienteMcomp/EnviarSintomasPacienteComp'
import MenuPaciente from '../../components/pacienteMcomp/MenuPaciente'
import PerfilPacienteNiñoComp, {
  type DatosPerfilPacienteNino,
} from '../../components/pacienteMcomp/PerfilPacienteNiñoComp'
import SintomasIntencidadComp, {
  type OpcionIntensidadSintoma,
} from '../../components/pacienteMcomp/SintomasIntencidadComp'
import TipoSintomaPacienteComp, {
  type TipoSintomaPaciente,
} from '../../components/pacienteMcomp/TipoSintomaPacienteComp'
import useRegistroSintomasPaciente from '../../hooks/useRegistroSintomasPaciente'
import { formatearEdadPaciente } from '../../utils/paciente'
import useDatosInicioPacienteApi from '../../hooks/useDatosInicioPacienteApi'

const TIPOS_SINTOMA: readonly TipoSintomaPaciente[] = [
  { icono: 'thermometer', id: 'fiebre', texto: 'Fiebre' },
  { icono: 'frown', id: 'dolor', texto: 'Dolor' },
  { icono: 'meh', id: 'nauseas', texto: 'Náuseas' },
  { icono: 'user', id: 'vomitos', texto: 'Vómitos' },
  { icono: 'droplet', id: 'sangrado', texto: 'Sangrado' },
  { icono: 'activity', id: 'cansancio', texto: 'Cansancio' },
  { icono: 'clipboard', id: 'diarrea', texto: 'Diarrea' },
  { icono: 'moreVertical', id: 'otro', texto: 'Otro' },
]

const INTENSIDADES: readonly OpcionIntensidadSintoma[] = [
  { icono: 'smile', texto: 'Leve', valor: 'leve' },
  { icono: 'meh', texto: 'Moderado', valor: 'moderado' },
  { icono: 'frown', texto: 'Fuerte', valor: 'fuerte' },
]

const DURACIONES: readonly OpcionDuracionSintomaPaciente[] = [
  { texto: 'Menos de 1 hora', valor: 'menos-de-1' },
  { texto: '1 a 6 horas', valor: 'entre-1-y-6' },
  { texto: '6 a 24 horas', valor: 'entre-6-y-24' },
  { texto: 'Más de 24 horas', valor: 'mas-de-24' },
]

const EVOLUCIONES: readonly OpcionEvolucionSintomaPaciente[] = [
  { icono: 'minusSquare', texto: 'Igual', tono: 'azul', valor: 'igual' },
  { icono: 'trendUp', texto: 'Mejoró', tono: 'verde', valor: 'mejoro' },
  { icono: 'trendDown', texto: 'Empeoró', tono: 'rojo', valor: 'empeoro' },
]

const ETIQUETAS_DETALLE: EtiquetasDetalleSintomasPaciente = {
  evolucion: '5. ¿Cómo ha evolucionado?',
  fechaHora: '4. ¿Desde cuándo empezó?',
  fechaPlaceholder: 'Selecciona fecha y hora',
  observacion: '6. Describe lo observado (opcional)',
  observacionPlaceholder: 'Escribe aquí lo que consideres importante...',
  tiempoPresente: '3. ¿Por cuánto tiempo ha estado presente?',
}

const INFORMACION_SINTOMAS = {
  actualizacionDescripcion: 'Esta información se actualiza según el registro del doctor.',
  actualizacionFecha: '19/05/2025',
  actualizacionFechaIso: '2025-05-19',
  actualizacionTitulo: 'Última actualización',
  documentosRuta: '/paciente/documentos',
  documentosTexto: 'Ver documentos relacionados',
  importanteDescripcion: 'Esta sección es informativa y se actualiza automáticamente con lo que el doctor haya registrado.',
  importanteTitulo: 'Importante',
} as const

function SintomasPage() {
  const { datos: datosInicio, error: errorPerfil } = useDatosInicioPacienteApi()
  const {
    alternarSintoma,
    cambiarDetalle,
    cambiarIntensidad,
    enviarReporte,
    estadoEnvio,
    mensajeEnvio,
    registro,
  } = useRegistroSintomasPaciente()
  const paciente: DatosPerfilPacienteNino | null = datosInicio
    ? {
        edad: formatearEdadPaciente(datosInicio.paciente.edad),
        estado: datosInicio.paciente.estado.replaceAll('_', ' ').toLocaleLowerCase('es-PE').replace(/^./, (letra) => letra.toLocaleUpperCase('es-PE')),
        historiaClinica: datosInicio.paciente.historiaClinica,
        imagen: FondoNino,
        nombre: datosInicio.paciente.nombre,
      }
    : null

  return (
    <AdaptadoMobil estilos='bg-[#f8fbfd] text-[#082767]'>
      <div className='flex h-full min-h-0 w-full flex-col overflow-hidden bg-[#f8fbfd]'>
        <main className='min-h-0 flex-1 overflow-y-auto px-2.5 pb-2 pt-2'>
          {paciente ? (
            <PerfilPacienteNiñoComp paciente={paciente} tamano='compacto' />
          ) : (
            <div className='h-[82px] animate-pulse rounded-xl border border-[#e1e9ef] bg-white' />
          )}

          {errorPerfil && (
            <p
              className='mt-1.5 rounded-md bg-[#fff8e8] px-2 py-1 text-center text-[6.7px] font-semibold text-[#9a6a17]'
              role='status'
              title={errorPerfil}
            >
              No se pudo actualizar el perfil. Puedes continuar enviando el reporte.
            </p>
          )}

          <div className='mt-2'>
            <TipoSintomaPacienteComp
              onAlternar={alternarSintoma}
              seleccionados={registro.sintomasIds}
              sintomas={TIPOS_SINTOMA}
              titulo='1. ¿Qué síntomas presenta?'
            />
          </div>

          <div className='mt-2'>
            <SintomasIntencidadComp
              intensidad={registro.intensidadGeneral}
              onCambiar={cambiarIntensidad}
              opciones={INTENSIDADES}
              titulo='2. ¿Qué intensidad tiene?'
            />
          </div>

          <div className='mt-2'>
            <DetalleSintomasPacienteComp
              etiquetas={ETIQUETAS_DETALLE}
              maximoObservacion={250}
              onCambiar={cambiarDetalle}
              opcionesDuracion={DURACIONES}
              opcionesEvolucion={EVOLUCIONES}
              valor={registro}
            />
          </div>

          <div className='mt-2'>
            <InformacionSintomasPacienteComp
              {...INFORMACION_SINTOMAS}
              imagenPaciente={FondoNino}
            />
          </div>

          <div className='mt-2 pb-2'>
            <EnviarSintomasPacienteComp
              estado={estadoEnvio}
              mensaje={mensajeEnvio}
              onEnviar={() => void enviarReporte()}
            />
          </div>
        </main>

        <MenuPaciente />
      </div>
    </AdaptadoMobil>
  )
}

export default SintomasPage
