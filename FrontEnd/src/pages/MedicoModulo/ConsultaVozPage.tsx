import FondoNino from '../../assets/FondoNiño5.png'
import GrabacionVozComp, { type ContenidoGrabacionVoz } from '../../components/GrabacionVozComp'
import HeaderDoctorMedicoComp from '../../components/HeaderDoctorMedicoComp'
import IconoMedico from '../../components/IconoMedico'
import MenuMedicoComp from '../../components/MenuMedicoComp'
import ResumenEstructuraComp, {
  type ContenidoResumenEstructurado,
} from '../../components/ResumenEstructuraComp'
import AccionesConsultaVozComp from '../../components/medicoMcomp/AccionesConsultaVozComp'
import PerfilConsultaVozComp, {
  type PacienteConsultaVoz,
} from '../../components/medicoMcomp/PerfilConsultaVozComp'
import useConsultaVoz from '../../hooks/useConsultaVoz'

const DOCTORA = {
  especialidad: 'Hematología Pediátrica',
  nombre: 'Dra. Valeria Ruiz',
} as const

const CONTENIDO_GRABACION: ContenidoGrabacionVoz = {
  detener: 'Detener entrevista',
  estadoCompletada: 'Resumen listo para revisar',
  estadoDetenida: 'Entrevista detenida',
  estadoEscuchando: 'Escuchando',
  estadoInactiva: 'Lista para iniciar',
  estadoPreguntando: 'Formulando la pregunta',
  estadoProcesando: 'Organizando la respuesta',
  iniciar: 'Iniciar entrevista',
  subtitulo: 'Activa el micrófono una vez. Las preguntas y respuestas avanzarán automáticamente.',
  titulo: 'Dicta la consulta',
}

const CONTENIDO_RESUMEN: ContenidoResumenEstructurado = {
  distintivo: 'Generado por IA',
  subtitulo: 'Revisa, edita si es necesario y guarda la consulta.',
  titulo: 'Resumen estructurado (generado automáticamente)',
}

const NOTA_ASISTENCIA = 'Tú conversas y revisas. HemoRuta conserva solo la información clínica importante para reducir el registro manual.'

function mapearPaciente(
  ficha: NonNullable<ReturnType<typeof useConsultaVoz>['fichaPaciente']>,
  edadSesion?: number,
): PacienteConsultaVoz {
  const estadoActivo = ficha.cuentaMovil.estado === 'ACTIVA'
  return {
    cuentaMovil: estadoActivo ? 'Cuenta móvil habilitada' : 'Cuenta móvil pendiente de activación',
    diagnosticoPrincipal: ficha.diagnosticoPrincipal?.nombre || 'Sin diagnóstico principal registrado',
    edad: ficha.datosGenerales.fechaNacimiento ? (edadSesion ?? null) : null,
    estadoCuenta: estadoActivo ? 'Activo' : 'Pendiente',
    historiaClinica: ficha.historiaClinica,
    imagen: FondoNino,
    nombre: ficha.nombre,
  }
}

function ConsultaVozPage() {
  const {
    cargando,
    editando,
    enviarRespuesta,
    error,
    fichaPaciente,
    guardando,
    mensajeAccion,
    prepararEdicion,
    prepararGuardado,
    procesandoRespuesta,
    registrarError,
    secciones,
    sesion,
    setSecciones,
    volverFichaPaciente,
  } = useConsultaVoz()

  const paciente = fichaPaciente
    ? mapearPaciente(fichaPaciente, sesion?.paciente.edad)
    : null

  return (
    <div className='flex min-h-dvh bg-[#fbfdff] font-sans'>
      <MenuMedicoComp />

      <div className='min-w-0 flex-1'>
        <HeaderDoctorMedicoComp especialidad={DOCTORA.especialidad} nombre={DOCTORA.nombre} />

        <main className='min-h-[calc(100dvh-46px)] px-4 py-3 sm:px-6 xl:px-8'>
          <div className='mx-auto w-full max-w-[1320px]'>
            <header>
              <h1 className='text-[clamp(22px,2vw,28px)] font-extrabold tracking-[-0.03em] text-[#092a76]'>
                Nueva consulta por voz
              </h1>
              <p className='mt-0.5 text-[10px] font-medium text-[#52688d]'>
                Responde por voz y el sistema organizará la consulta para que solo revises y guardes.
              </p>
              <button
                className='mt-2 flex h-8 cursor-pointer items-center gap-2 rounded-lg border border-[#dce5ee] bg-white px-3 text-[9px] font-bold text-[#36558d] shadow-sm transition hover:border-[#a9bfda] hover:bg-[#f8fbfd] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#08aabb]'
                onClick={volverFichaPaciente}
                type='button'
              >
                <IconoMedico className='h-4 w-4' nombre='arrowLeft' strokeWidth={1.8} />
                Volver a ficha del paciente
              </button>
            </header>

            {cargando ? (
              <div className='mt-4 grid min-h-[390px] place-items-center rounded-xl border border-[#dce5ee] bg-white text-center shadow-sm'>
                <div>
                  <span className='mx-auto block h-9 w-9 animate-spin rounded-full border-4 border-[#d9f1f4] border-t-[#079bb0]' />
                  <p className='mt-3 text-[11px] font-bold text-[#31517e]'>Preparando la consulta por voz...</p>
                  <p className='mt-1 text-[9px] text-[#6b7f9d]'>Preparando los datos del paciente y la entrevista.</p>
                </div>
              </div>
            ) : paciente && sesion ? (
              <>
                <PerfilConsultaVozComp paciente={paciente} />

                <div className='mt-3 grid items-stretch gap-3 xl:grid-cols-[minmax(300px,0.72fr)_minmax(570px,1.48fr)]'>
                  <GrabacionVozComp
                    contenido={CONTENIDO_GRABACION}
                    deshabilitado={guardando || sesion.estado === 'PUBLICADO'}
                    intervenciones={sesion.intervenciones}
                    onEnviarRespuesta={enviarRespuesta}
                    onError={registrarError}
                    preguntaActual={sesion.preguntaActual}
                    procesando={procesandoRespuesta}
                  />
                  <ResumenEstructuraComp
                    contenido={CONTENIDO_RESUMEN}
                    editable={editando}
                    onCambiar={setSecciones}
                    secciones={secciones}
                  />
                </div>

                {(error || mensajeAccion) && (
                  <div
                    aria-live='polite'
                    className={`mt-2 flex min-h-9 items-center gap-2 rounded-lg border px-3 text-[9px] font-semibold ${
                      error
                        ? 'border-[#ffcfd2] bg-[#fff5f5] text-[#c9404b]'
                        : 'border-[#cfe7f7] bg-[#eff8ff] text-[#315b89]'
                    }`}
                    role={error ? 'alert' : 'status'}
                  >
                    <IconoMedico className='h-4 w-4 shrink-0' nombre={error ? 'alertTriangle' : 'info'} />
                    {error || mensajeAccion}
                  </div>
                )}

                <AccionesConsultaVozComp
                  deshabilitado={procesandoRespuesta}
                  editando={editando}
                  guardando={guardando}
                  mensajeAccion={error || mensajeAccion}
                  notaAsistencia={NOTA_ASISTENCIA}
                  onCancelar={volverFichaPaciente}
                  onEditar={prepararEdicion}
                  onGuardar={() => void prepararGuardado()}
                />
              </>
            ) : (
              <div className='mt-4 rounded-xl border border-[#ffd5d8] bg-white p-8 text-center shadow-sm'>
                <IconoMedico className='mx-auto h-10 w-10 text-[#e45d66]' nombre='alertTriangle' />
                <h2 className='mt-3 text-[15px] font-extrabold text-[#173879]'>No se pudo iniciar la consulta</h2>
                <p className='mx-auto mt-1 max-w-lg text-[10px] leading-5 text-[#617494]'>
                  {error || 'Selecciona nuevamente al paciente desde el listado.'}
                </p>
                <button
                  className='mt-4 rounded-lg bg-[#079caf] px-5 py-2 text-[10px] font-extrabold text-white'
                  onClick={() => window.location.assign('/doctor/pacientes')}
                  type='button'
                >
                  Ir al listado de pacientes
                </button>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

export default ConsultaVozPage
