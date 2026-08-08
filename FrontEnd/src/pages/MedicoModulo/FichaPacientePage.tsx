import fondoPaciente from '../../assets/FondoNiño5.png'
import DatosDocPacientComp from '../../components/DatosDocPacientComp'
import HeaderDoctorMedicoComp from '../../components/HeaderDoctorMedicoComp'
import IconoMedico from '../../components/IconoMedico'
import MenuMedicoComp from '../../components/MenuMedicoComp'
import PerfilDocPacientComp from '../../components/PerfilDocPacientComp'
import useRedirrecion from '../../hooks/Redirrecion'
import type {
  DocumentoFichaPaciente,
  PerfilFichaPaciente,
  SeccionDatosFichaPaciente,
} from '../../types/FichaPaciente'

const DOCTORA = {
  especialidad: 'Hematología Pediátrica',
  nombre: 'Dra. Valeria Ruiz',
}

const PERFIL_PACIENTE: PerfilFichaPaciente = {
  adultoResponsable: 'María Flores López',
  cuentaMovil: 'Cuenta móvil habilitada',
  diagnosticoPrincipal: 'Leucemia linfoblástica aguda (LLA)',
  edad: 8,
  especialidadMedica: 'Hematología Pediátrica',
  estadoCuenta: 'Activo',
  historiaClinica: 'HC-2024-01568',
  imagen: fondoPaciente,
  medicoTratante: 'Dra. Valeria Ruiz',
  nombre: 'Mateo Gabriel Flores',
  parentescoResponsable: 'Madre',
  tipoSangre: 'O+',
}

const PROXIMA_CITA = {
  fecha: '27/05/2025',
  hora: '10:30 a. m.',
  motivo: 'Consulta médica',
  servicio: 'Control de inducción',
}

const DOCUMENTOS: DocumentoFichaPaciente[] = [
  { fecha: '20/05/2025', formato: 'PDF', nombre: 'Informe médico' },
  { fecha: '19/05/2025', formato: 'PDF', nombre: 'Resultados laboratorio' },
  { fecha: '', formato: 'PDF', nombre: 'Plan de tratamiento vigente' },
]

const SECCIONES_DATOS: SeccionDatosFichaPaciente[] = [
  {
    icono: 'calendar',
    items: [
      { etiqueta: 'Fecha de nacimiento', valor: '16/03/2017' },
      { etiqueta: 'Sexo', valor: 'Masculino' },
      { etiqueta: 'Lugar de nacimiento', valor: 'Lima, Perú' },
      { etiqueta: 'Nacionalidad', valor: 'Peruana' },
      { etiqueta: 'Idioma', valor: 'Español' },
    ],
    titulo: 'Datos generales',
  },
  {
    icono: 'users',
    items: [
      {
        etiqueta: 'Madre',
        secundario: '987 654 321  ·  maria.flores@email.com',
        valor: 'María Flores López',
      },
      {
        etiqueta: 'Padre',
        secundario: '912 345 678  ·  carlos.flores@gmail.com',
        valor: 'Carlos Flores Paredes',
      },
    ],
    titulo: 'Contacto familiar',
  },
  {
    icono: 'smartphone',
    items: [
      { etiqueta: 'Estado', tono: 'exito', valor: 'Activa' },
      { etiqueta: 'Usuario', valor: 'mateo.flores' },
      { etiqueta: 'Dispositivo', valor: 'iPhone 12' },
      { etiqueta: 'Último acceso', valor: '19/05/2025 08:45 a. m.' },
    ],
    titulo: 'Cuenta móvil',
  },
  {
    icono: 'file',
    items: [
      { etiqueta: 'Diagnóstico principal', valor: 'Leucemia linfoblástica aguda (LLA)' },
      { etiqueta: 'Fecha de diagnóstico', valor: '15/05/2025' },
      { etiqueta: 'Riesgo', tono: 'alerta', valor: 'Intermedio' },
      { etiqueta: 'Estado actual', valor: 'En tratamiento' },
    ],
    titulo: 'Resumen clínico',
  },
]

function FichaPacientePage() {
  const redirigir = useRedirrecion()

  return (
    <div className='flex min-h-screen bg-[#fbfdff]'>
      <MenuMedicoComp />

      <div className='min-w-0 flex-1'>
        <HeaderDoctorMedicoComp especialidad={DOCTORA.especialidad} nombre={DOCTORA.nombre} />

        <main className='min-h-[calc(100vh-46px)] px-4 py-4 sm:px-6 xl:px-7'>
          <div className='mx-auto w-full max-w-[1220px]'>
            <header className='flex flex-wrap items-start justify-between gap-4 px-1'>
              <div>
                <h1 className='text-[26px] font-extrabold tracking-[-0.03em] text-[#0a2b79]'>Ficha del paciente</h1>
                <p className='mt-0.5 text-[10px] font-medium text-[#50658a]'>
                  Vista resumida de la información clínica, familiar y de seguimiento del paciente.
                </p>
              </div>
              <div className='flex flex-wrap gap-2'>
                <button
                  className='flex h-9 cursor-pointer items-center gap-2 rounded-lg border border-[#d6e1ec] bg-white px-4 text-[9px] font-bold text-[#37517f] transition hover:bg-[#f6fafc] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#08aabb]'
                  onClick={() => redirigir('/doctor/pacientes')}
                  type='button'
                >
                  <IconoMedico className='h-4 w-4' nombre='arrowLeft' />
                  Volver al listado
                </button>
                <button
                  className='flex h-9 cursor-pointer items-center gap-2 rounded-lg bg-gradient-to-r from-[#08aabc] to-[#078da9] px-5 text-[9px] font-bold text-white shadow-sm transition hover:brightness-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#08aabb]'
                  type='button'
                >
                  <IconoMedico className='h-4 w-4' nombre='edit' />
                  Editar ficha
                </button>
              </div>
            </header>

            <div className='mt-3'>
              <PerfilDocPacientComp
                onHistorial={() => redirigir('/doctor/historial')}
                perfil={PERFIL_PACIENTE}
              />
            </div>

            <section className='mt-3 grid gap-3 lg:grid-cols-[0.82fr_1fr_1.12fr]'>
              <article className='flex min-h-[138px] flex-col rounded-xl border border-[#dce5ee] bg-white p-4 shadow-[0_2px_8px_rgba(18,52,91,0.05)]'>
                <h2 className='text-[10px] font-extrabold text-[#078fa5]'>Semáforo actual</h2>
                <div className='mt-2 flex flex-1 items-center justify-between gap-3'>
                  <div className='text-[8px] leading-[13px] text-[#4d6388]'>
                    <strong className='mb-2 flex items-center gap-2 text-[9px] text-[#15953b]'>
                      <span className='h-2.5 w-2.5 rounded-full bg-[#18b83f]' />
                      Estable
                    </strong>
                    Buen control clínico. Continúa
                    <br />
                    con el plan actual.
                  </div>
                  <span className='grid h-16 w-16 shrink-0 place-items-center rounded-full border-[8px] border-[#a7e8bd] bg-[#20b956] text-white shadow-inner'>
                    <span aria-label='Estado estable' className='text-[27px] leading-none' role='img'>
                      ☺
                    </span>
                  </span>
                </div>
                <button
                  className='mt-2 h-8 cursor-pointer rounded-lg border border-[#d6e1ec] bg-white text-[8px] font-bold text-[#38517f] transition hover:bg-[#f7fafc]'
                  type='button'
                >
                  Ver detalles
                </button>
              </article>

              <article className='flex min-h-[138px] flex-col rounded-xl border border-[#dce5ee] bg-white p-4 shadow-[0_2px_8px_rgba(18,52,91,0.05)]'>
                <h2 className='text-[10px] font-extrabold text-[#2779e5]'>Próxima cita declarada</h2>
                <div className='mt-3 flex flex-1 items-start gap-3'>
                  <IconoMedico className='h-7 w-7 shrink-0 text-[#1378ee]' nombre='calendar' strokeWidth={1.9} />
                  <div>
                    <div className='flex flex-wrap items-center gap-3'>
                      <strong className='text-[14px] text-[#123278]'>{PROXIMA_CITA.fecha}</strong>
                      <span className='inline-flex items-center gap-1 rounded-full bg-[#e9f2ff] px-2 py-1 text-[8px] font-bold text-[#1474de]'>
                        <IconoMedico className='h-3 w-3' nombre='clock' />
                        {PROXIMA_CITA.hora}
                      </span>
                    </div>
                    <p className='mt-2 text-[8px] leading-[13px] text-[#50668d]'>
                      {PROXIMA_CITA.motivo}
                      <br />
                      {PROXIMA_CITA.servicio}
                    </p>
                  </div>
                </div>
                <button
                  className='mt-2 h-8 cursor-pointer rounded-lg border border-[#d6e1ec] bg-white text-[8px] font-bold text-[#38517f] transition hover:bg-[#f7fafc]'
                  type='button'
                >
                  Ver agenda
                </button>
              </article>

              <article className='flex min-h-[138px] flex-col rounded-xl border border-[#dce5ee] bg-white p-4 shadow-[0_2px_8px_rgba(18,52,91,0.05)]'>
                <h2 className='text-[10px] font-extrabold text-[#f17224]'>Documentos recientes</h2>
                <ul className='mt-1 flex-1 divide-y divide-[#e3eaf1]'>
                  {DOCUMENTOS.map((documento) => (
                    <li className='flex h-7 items-center gap-2 text-[8px] text-[#3e5680]' key={documento.nombre}>
                      <IconoMedico className='h-4 w-4 shrink-0 text-[#ff772c]' nombre='file' />
                      <span className='min-w-0 flex-1 truncate'>
                        {documento.nombre} {documento.fecha && <span>{documento.fecha}</span>}
                      </span>
                      <span className='font-bold text-[#536a91]'>{documento.formato}</span>
                      <IconoMedico className='h-3 w-3 -rotate-90 text-[#536a91]' nombre='chevronDown' />
                    </li>
                  ))}
                </ul>
                <button
                  className='mt-2 h-8 cursor-pointer rounded-lg border border-[#d6e1ec] bg-white text-[8px] font-bold text-[#38517f] transition hover:bg-[#f7fafc]'
                  type='button'
                >
                  Ver todos los documentos
                </button>
              </article>
            </section>

            <div className='mt-3'>
              <DatosDocPacientComp secciones={SECCIONES_DATOS} />
            </div>

            <div className='mt-4 flex justify-center'>
              <button
                className='flex h-12 w-[270px] max-w-full cursor-pointer items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-[#08aabc] to-[#078da9] px-6 text-[17px] font-medium text-white shadow-[0_5px_12px_rgba(5,111,124,0.18)] transition hover:-translate-y-0.5 hover:brightness-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#08aabb] active:translate-y-0'
                onClick={() => redirigir('/antonella')}
                type='button'
              >
                <IconoMedico className='h-6 w-6' nombre='microphone' strokeWidth={1.9} />
                Nueva consulta por voz
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default FichaPacientePage
