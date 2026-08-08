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

const PACIENTE: DatosPerfilPacienteNino = {
  edad: '8 años',
  estado: 'Activo',
  historiaClinica: 'HC-2024-01568',
  imagen: FondoNino,
  nombre: 'Mateo Gabriel Flores',
}

const TRATAMIENTO = {
  descripcion: 'Resumen de las indicaciones médicas registradas por el doctor.',
  titulo: 'Tratamiento actual',
} as const

const INDICACIONES: readonly ItemTratamientoPaciente[] = [
  {
    formato: 'texto',
    id: 'tratamiento-indicado',
    lineas: [
      {
        id: 'continuar-tratamiento',
        texto: 'Continuar tratamiento actual según evaluación médica.',
      },
    ],
    tipo: 'tratamiento-indicado',
    titulo: 'Tratamiento indicado',
  },
  {
    formato: 'lista',
    id: 'medicacion-indicada',
    lineas: [
      { id: 'prednisona', texto: 'Prednisona 10 mg cada 24 horas.' },
      { id: 'omeprazol', texto: 'Omeprazol 20 mg a la 1:00 p. m.' },
      { id: 'acido-folico', texto: 'Ácido fólico 1 tableta a las 8:00 p. m.' },
    ],
    tipo: 'medicacion-indicada',
    titulo: 'Medicación indicada',
  },
  {
    formato: 'texto',
    id: 'indicaciones-casa',
    lineas: [
      {
        id: 'cuidados-casa',
        texto: 'Mantener hidratación, vigilar fiebre, seguir horarios de medicación y reportar cambios importantes.',
      },
    ],
    tipo: 'indicaciones-casa',
    titulo: 'Indicaciones para casa',
  },
  {
    formato: 'texto',
    id: 'examenes-solicitados',
    lineas: [
      {
        id: 'hemograma',
        texto: 'Hemograma antes de la próxima consulta.',
      },
    ],
    tipo: 'examenes-solicitados',
    titulo: 'Exámenes solicitados',
  },
  {
    formato: 'texto',
    id: 'proximo-control',
    lineas: [
      {
        id: 'asistir-control',
        texto: 'Asistir al próximo control cuando el hospital lo informe.',
      },
    ],
    tipo: 'proximo-control',
    titulo: 'Próximo control',
  },
]

const INFORMACION_TRATAMIENTO = {
  actualizacionDescripcion: 'Esta información fue actualizada según el registro del doctor.',
  actualizacionFecha: '19/05/2025',
  actualizacionFechaIso: '2025-05-19',
  actualizacionTitulo: 'Última actualización',
  documentosRuta: '/paciente/documentos',
  documentosTexto: 'Ver documentos relacionados',
  importanteDescripcion: 'Esta sección es informativa y se actualiza automáticamente con lo que el doctor haya registrado.',
  importanteTitulo: 'Importante',
} as const

function TratamientoPage() {
  return (
    <AdaptadoMobil estilos='bg-[#f8fbfd] text-[#082767]'>
      <div className='flex h-full min-h-0 w-full flex-col overflow-hidden bg-[#f8fbfd]'>
        <main className='min-h-0 flex-1 overflow-y-auto px-2.5 pb-2 pt-1'>
          <PerfilPacienteNiñoComp paciente={PACIENTE} />

          <div className='mt-2'>
            <TratateComp
              descripcion={TRATAMIENTO.descripcion}
              items={INDICACIONES}
              titulo={TRATAMIENTO.titulo}
            />
          </div>

          <div className='mt-2'>
            <InformacionPacienteComp
              {...INFORMACION_TRATAMIENTO}
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
