import { useState } from 'react'
import FondoNino from '../../assets/FondoNiño5.png'
import AdaptadoMobil from '../../components/pacienteMcomp/AdaptadoMobil'
import DetalleSintomasPacienteComp, {
  type BorradorDetalleSintomasPaciente,
  type EtiquetasDetalleSintomasPaciente,
  type OpcionDuracionSintomaPaciente,
  type OpcionEvolucionSintomaPaciente,
} from '../../components/pacienteMcomp/DetalleSintomasPacienteComp'
import InformacionSintomasPacienteComp from '../../components/pacienteMcomp/InformacionSintomasPacienteComp'
import MenuPaciente from '../../components/pacienteMcomp/MenuPaciente'
import PerfilPacienteNiñoComp, {
  type DatosPerfilPacienteNino,
} from '../../components/pacienteMcomp/PerfilPacienteNiñoComp'
import SintomasIntencidadComp, {
  type NivelIntensidadSintoma,
  type OpcionIntensidadSintoma,
} from '../../components/pacienteMcomp/SintomasIntencidadComp'
import TipoSintomaPacienteComp, {
  type TipoSintomaPaciente,
} from '../../components/pacienteMcomp/TipoSintomaPacienteComp'

interface BorradorRegistroSintomas extends BorradorDetalleSintomasPaciente {
  intensidadGeneral: NivelIntensidadSintoma | null
  pacienteId: string
  sintomasIds: string[]
}

const PACIENTE: DatosPerfilPacienteNino = {
  edad: '8 años',
  estado: 'Activo',
  historiaClinica: 'HC-2024-01568',
  imagen: FondoNino,
  nombre: 'Mateo Gabriel Flores',
}

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

const REGISTRO_INICIAL: BorradorRegistroSintomas = {
  duracion: null,
  evolucion: 'igual',
  fechaHora: '',
  intensidadGeneral: 'leve',
  observacion: '',
  pacienteId: 'mateo-gabriel-flores',
  sintomasIds: ['fiebre'],
}

function SintomasPage() {
  const [registro, setRegistro] = useState<BorradorRegistroSintomas>(REGISTRO_INICIAL)

  function alternarSintoma(sintomaId: string) {
    setRegistro((registroActual) => ({
      ...registroActual,
      sintomasIds: registroActual.sintomasIds.includes(sintomaId)
        ? registroActual.sintomasIds.filter((id) => id !== sintomaId)
        : [...registroActual.sintomasIds, sintomaId],
    }))
  }

  function cambiarDetalle(cambio: Partial<BorradorDetalleSintomasPaciente>) {
    setRegistro((registroActual) => ({ ...registroActual, ...cambio }))
  }

  return (
    <AdaptadoMobil estilos='bg-[#f8fbfd] text-[#082767]'>
      <div className='flex h-full min-h-0 w-full flex-col overflow-hidden bg-[#f8fbfd]'>
        <main className='min-h-0 flex-1 overflow-y-auto px-2.5 pb-2 pt-2'>
          <PerfilPacienteNiñoComp paciente={PACIENTE} tamano='compacto' />

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
              onCambiar={(intensidadGeneral) => setRegistro((actual) => ({ ...actual, intensidadGeneral }))}
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
        </main>

        <MenuPaciente />
      </div>
    </AdaptadoMobil>
  )
}

export default SintomasPage
