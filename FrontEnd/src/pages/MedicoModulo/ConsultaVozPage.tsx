import { useState } from 'react'
import FondoNino from '../../assets/FondoNiño5.png'
import GrabacionVozComp, {
  type ContenidoGrabacionVoz,
  type EstadoGrabacionVoz,
} from '../../components/GrabacionVozComp'
import HeaderDoctorMedicoComp from '../../components/HeaderDoctorMedicoComp'
import IconoMedico from '../../components/IconoMedico'
import MenuMedicoComp from '../../components/MenuMedicoComp'
import ResumenEstructuraComp, {
  type ContenidoResumenEstructurado,
  type SeccionResumenEstructurado,
} from '../../components/ResumenEstructuraComp'
import useRedirrecion from '../../hooks/Redirrecion'

interface PacienteConsultaVoz {
  cuentaMovil: string
  diagnosticoPrincipal: string
  edad: number
  estadoCuenta: string
  historiaClinica: string
  imagen: string
  nombre: string
}

const DOCTORA = {
  especialidad: 'Hematología Pediátrica',
  nombre: 'Dra. Valeria Ruiz',
} as const

const PACIENTE: PacienteConsultaVoz = {
  cuentaMovil: 'Cuenta móvil habilitada',
  diagnosticoPrincipal: 'Leucemia linfoblástica aguda (LLA)',
  edad: 8,
  estadoCuenta: 'Activo',
  historiaClinica: 'HC-2024-01568',
  imagen: FondoNino,
  nombre: 'Mateo Gabriel Flores',
}

const CONTENIDO_GRABACION: ContenidoGrabacionVoz = {
  descartar: 'Descartar grabación',
  estadoDescartada: 'Grabación descartada',
  estadoFinalizada: 'Dictado finalizado',
  estadoGrabando: 'Grabando',
  estadoPausada: 'Grabación pausada',
  finalizar: 'Finalizar dictado',
  pausar: 'Pausar',
  reanudar: 'Reanudar',
  subtitulo: 'El sistema capturará tu voz y estructurará la información.',
  titulo: 'Dicta la consulta',
}

const CONTENIDO_RESUMEN: ContenidoResumenEstructurado = {
  distintivo: 'Generado por IA',
  subtitulo: 'Revisa, edita si es necesario y guarda la consulta.',
  titulo: 'Resumen estructurado (generado automáticamente)',
}

const SECCIONES_RESUMEN: readonly SeccionResumenEstructurado[] = [
  {
    formato: 'texto',
    id: 'motivo-consulta',
    lineas: [
      {
        id: 'motivo-principal',
        texto: 'Control de rutina y seguimiento post quimioterapia de mantenimiento.',
      },
    ],
    tipo: 'motivo',
    titulo: 'Motivo de consulta',
  },
  {
    formato: 'texto',
    id: 'evolucion-clinica',
    lineas: [
      {
        id: 'evolucion-general',
        texto: 'Paciente refiere sentirse bien. Sin fiebre ni infecciones. Apetito adecuado, sin náuseas.',
      },
      {
        id: 'examen-fisico',
        texto: 'Energía conservada. No sangrados ni hematomas. Examen físico sin hallazgos relevantes.',
      },
    ],
    tipo: 'evolucion',
    titulo: 'Evolución clínica',
  },
  {
    formato: 'texto',
    id: 'tratamiento-indicado',
    lineas: [
      {
        id: 'protocolo',
        texto: 'Continuar protocolo LLA-2024 (Fase de mantenimiento).',
      },
      {
        id: 'prevencion',
        texto: 'Refuerzo de medidas de prevención de infecciones y cuidados generales.',
      },
    ],
    tipo: 'tratamiento',
    titulo: 'Tratamiento indicado',
  },
  {
    formato: 'lista',
    id: 'medicacion-indicada',
    lineas: [
      { id: 'mercaptopurina', texto: '6-Mercaptopurina 50 mg: 1 tableta vía oral cada 24 h.' },
      { id: 'metotrexato', texto: 'Metotrexato 15 mg: 1 tableta vía oral cada 7 días.' },
      { id: 'acido-folico', texto: 'Ácido fólico 5 mg: 1 tableta vía oral cada 24 h.' },
    ],
    tipo: 'medicacion',
    titulo: 'Medicación indicada',
  },
  {
    formato: 'texto',
    id: 'indicaciones-casa',
    lineas: [
      {
        id: 'cuidados',
        texto: 'Mantener buena hidratación y alimentación. Evitar contacto con personas con infecciones.',
      },
      {
        id: 'signos-alarma',
        texto: 'Acudir de inmediato ante fiebre > 38 °C, sangrados o cualquier signo de alarma.',
      },
    ],
    tipo: 'indicaciones',
    titulo: 'Indicaciones para casa',
  },
  {
    formato: 'texto',
    id: 'proximo-control',
    lineas: [
      {
        id: 'fecha-control',
        texto: 'En 4 semanas (27/06/2025), o antes si presenta síntomas.',
      },
    ],
    tipo: 'proximo-control',
    titulo: 'Próximo control',
  },
]

const NOTA_ASISTENCIA = 'Tú solo dictas y revisas. HemoRuta estructura la información para ti, reduciendo la escritura manual y el tiempo de registro.'

function ConsultaVozPage() {
  const [mensajeAccion, setMensajeAccion] = useState('')
  const redirigir = useRedirrecion()

  function volverFichaPaciente() {
    redirigir('/doctor/ficha')
  }

  function registrarCambioGrabacion(estado: EstadoGrabacionVoz, duracionSegundos: number) {
    if (estado === 'finalizada') {
      setMensajeAccion(`Dictado finalizado con una duración de ${duracionSegundos} segundos.`)
    }
  }

  return (
    <div className='flex min-h-dvh bg-[#fbfdff] font-sans'>
      <MenuMedicoComp />

      <div className='min-w-0 flex-1'>
        <HeaderDoctorMedicoComp especialidad={DOCTORA.especialidad} nombre={DOCTORA.nombre} />

        <main className='min-h-[calc(100dvh-46px)] px-4 py-1.5 sm:px-6 xl:px-7'>
          <div className='mx-auto w-full max-w-[1220px]'>
            <div className='w-full min-[1024px]:w-[clamp(770px,68.5vw,1000px)]'>
              <header>
              <h1 className='text-[clamp(22px,2vw,26px)] font-extrabold tracking-[-0.03em] text-[#092a76]'>
                Nueva consulta por voz
              </h1>
              <p className='mt-0.5 text-[10px] font-medium text-[#52688d]'>
                Dicta la consulta y el sistema estructurará la información automáticamente para que solo revises y guardes.
              </p>
              <button
                className='mt-1.5 flex h-7 cursor-pointer items-center gap-2 rounded-lg border border-[#dce5ee] bg-white px-3 text-[9px] font-bold text-[#36558d] shadow-sm transition hover:border-[#a9bfda] hover:bg-[#f8fbfd] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#08aabb]'
                onClick={volverFichaPaciente}
                type='button'
              >
                <IconoMedico className='h-4 w-4' nombre='arrowLeft' strokeWidth={1.8} />
                Volver a ficha del paciente
              </button>
              </header>

              <article className='mt-1.5 grid items-center gap-3 rounded-xl border border-[#dce5ee] bg-white p-2 shadow-[0_2px_8px_rgba(18,52,91,0.04)] sm:grid-cols-[64px_minmax(0,1fr)] lg:grid-cols-[64px_minmax(220px,1fr)_minmax(190px,0.85fr)_minmax(160px,0.7fr)]'>
              <div className='relative mx-auto h-[60px] w-[60px] overflow-hidden rounded-full border-4 border-[#e2f4f5] bg-[#e6f7f5] sm:mx-0'>
                <img
                  alt={`Foto de ${PACIENTE.nombre}`}
                  className='absolute left-1/2 top-[-18%] h-[185%] w-[185%] max-w-none -translate-x-1/2 object-cover'
                  draggable={false}
                  src={PACIENTE.imagen}
                />
              </div>

              <div className='min-w-0 text-center sm:text-left'>
                <h2 className='truncate text-[17px] font-extrabold tracking-[-0.02em] text-[#092a76]'>{PACIENTE.nombre}</h2>
                <div className='mt-1.5 flex flex-wrap items-center justify-center gap-5 text-[9px] font-semibold text-[#536a91] sm:justify-start'>
                  <span className='flex items-center gap-1.5'>
                    <IconoMedico className='h-3.5 w-3.5 text-[#31559f]' nombre='user' />
                    {PACIENTE.edad} años
                  </span>
                  <span className='flex items-center gap-1.5'>
                    <IconoMedico className='h-3.5 w-3.5 text-[#31559f]' nombre='calendar' />
                    {PACIENTE.historiaClinica}
                  </span>
                </div>
              </div>

              <dl className='border-t border-[#e3eaf1] pt-2 sm:col-span-2 lg:col-span-1 lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0'>
                <dt className='text-[8px] font-semibold text-[#53698e]'>Diagnóstico principal</dt>
                <dd className='mt-1 text-[10px] font-extrabold leading-[14px] text-[#153579]'>{PACIENTE.diagnosticoPrincipal}</dd>
              </dl>

              <dl className='border-t border-[#e3eaf1] pt-2 sm:col-span-2 lg:col-span-1 lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0'>
                <dt className='text-[8px] font-semibold text-[#53698e]'>Estado de la cuenta</dt>
                <dd className='mt-1 inline-flex items-center gap-1.5 text-[10px] font-extrabold text-[#15953b]'>
                  <span className='h-2 w-2 rounded-full bg-[#22b744]' />
                  {PACIENTE.estadoCuenta}
                </dd>
                <dd className='mt-1 text-[8px] font-medium text-[#53698e]'>{PACIENTE.cuentaMovil}</dd>
              </dl>
              </article>

              <div className='mt-2 grid items-stretch gap-3 lg:grid-cols-[minmax(255px,0.72fr)_minmax(480px,1.35fr)]'>
                <GrabacionVozComp
                  contenido={CONTENIDO_GRABACION}
                  onCambiarEstado={registrarCambioGrabacion}
                  onDescartar={() => setMensajeAccion('La grabación fue descartada.')}
                  segundosIniciales={84}
                />
                <ResumenEstructuraComp contenido={CONTENIDO_RESUMEN} secciones={SECCIONES_RESUMEN} />
              </div>
            </div>

            <footer className='mt-3 flex w-full flex-col gap-3 rounded-xl bg-white sm:-mx-5 sm:w-[calc(100%+40px)] sm:flex-row sm:items-center'>
              <div className='flex min-h-9 min-w-0 flex-1 items-center gap-2 rounded-lg border border-[#d7e8f7] bg-[#eff7ff] px-3 text-[8px] font-medium leading-[12px] text-[#365989]'>
                <IconoMedico className='h-5 w-5 shrink-0 text-[#277bd9]' nombre='info' strokeWidth={1.8} />
                {NOTA_ASISTENCIA}
              </div>

              <div className='flex flex-wrap justify-end gap-2'>
                <button
                  className='flex h-9 min-w-[150px] cursor-pointer items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#08aabc] to-[#078da9] px-4 text-[10px] font-extrabold text-white shadow-sm transition hover:brightness-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#08aabb]'
                  onClick={() => setMensajeAccion('La consulta está lista para guardarse cuando se conecte el servicio.')}
                  type='button'
                >
                  <IconoMedico className='h-5 w-5' nombre='save' strokeWidth={1.8} />
                  Guardar consulta
                </button>
                <button
                  className='flex h-9 min-w-[136px] cursor-pointer items-center justify-center gap-2 rounded-lg border border-[#d8e2ec] bg-white px-4 text-[10px] font-bold text-[#36558d] transition hover:bg-[#f8fbfd] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#08aabb]'
                  onClick={() => setMensajeAccion('El resumen está disponible para una futura edición.')}
                  type='button'
                >
                  <IconoMedico className='h-5 w-5 text-[#315da1]' nombre='edit' strokeWidth={1.8} />
                  Editar contenido
                </button>
                <button
                  className='h-9 min-w-[90px] cursor-pointer rounded-lg border border-[#d8e2ec] bg-white px-4 text-[10px] font-bold text-[#36558d] transition hover:bg-[#f8fbfd] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#08aabb]'
                  onClick={volverFichaPaciente}
                  type='button'
                >
                  Cancelar
                </button>
              </div>
              <p aria-live='polite' className='sr-only'>{mensajeAccion}</p>
            </footer>
          </div>
        </main>
      </div>
    </div>
  )
}

export default ConsultaVozPage
