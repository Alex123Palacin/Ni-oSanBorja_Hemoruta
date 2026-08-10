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
    distribucion: 'contacto',
    icono: 'users',
    items: [
      {
        detalles: [
          { icono: 'phone', texto: '987 654 321' },
          { icono: 'mail', texto: 'maria.flores@email.com', tono: 'azul' },
        ],
        etiqueta: 'Madre',
        valor: 'María Flores López',
      },
      {
        detalles: [
          { icono: 'phone', texto: '912 345 678' },
          { icono: 'mail', texto: 'carlos.flores@gmail.com', tono: 'azul' },
        ],
        etiqueta: 'Padre',
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
    icono: 'clipboard',
    items: [
      { etiqueta: 'Diagnóstico principal', valor: 'Leucemia linfoblástica aguda (LLA)' },
      { etiqueta: 'Fecha de diagnóstico', valor: '15/05/2025' },
      { etiqueta: 'Riesgo', tono: 'alerta', valor: 'Intermedio' },
      { etiqueta: 'Estado actual', valor: 'En tratamiento' },
    ],
    titulo: 'Resumen clínico',
  },
]

function BotonSecundario({ children }: { children: string }) {
  return (
    <button
      className='mt-2 h-9 w-full cursor-pointer rounded-lg border border-[#d6e1ec] bg-white text-[9px] font-bold text-[#38517f] transition hover:border-[#b9cddd] hover:bg-[#f7fafc] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#08aabb]'
      type='button'
    >
      {children}
    </button>
  )
}

function TarjetaSemaforo() {
  return (
    <article className='flex min-h-[166px] flex-col rounded-xl border border-[#dce5ee] bg-white p-4 shadow-[0_3px_10px_rgba(18,52,91,0.06)]'>
      <h2 className='text-[12px] font-extrabold text-[#078fa5]'>Semáforo actual</h2>
      <div className='mt-2 flex flex-1 items-center justify-between gap-4'>
        <div className='text-[9px] leading-[14px] text-[#4d6388]'>
          <strong className='mb-3 flex items-center gap-2 text-[11px] text-[#15953b]'>
            <span aria-hidden='true' className='h-3 w-3 rounded-full bg-[#18b83f]' />
            Estable
          </strong>
          Buen control clínico. Continúa
          <br />
          con el plan actual.
        </div>
        <span
          aria-label='Estado estable'
          className='grid h-[74px] w-[74px] shrink-0 place-items-center rounded-full border-[9px] border-[#a7e8bd] bg-[#20b956] text-white shadow-inner'
          role='img'
        >
          <IconoMedico className='h-9 w-9' nombre='smile' strokeWidth={1.7} />
        </span>
      </div>
      <BotonSecundario>Ver detalles</BotonSecundario>
    </article>
  )
}

function TarjetaProximaCita() {
  return (
    <article className='flex min-h-[166px] flex-col rounded-xl border border-[#dce5ee] bg-white p-4 shadow-[0_3px_10px_rgba(18,52,91,0.06)]'>
      <h2 className='text-[12px] font-extrabold text-[#2779e5]'>Próxima cita declarada</h2>
      <div className='mt-3 flex flex-1 items-start gap-4'>
        <IconoMedico className='h-8 w-8 shrink-0 text-[#1378ee]' nombre='calendar' strokeWidth={1.9} />
        <div>
          <div className='flex flex-wrap items-center gap-3'>
            <strong className='text-[17px] text-[#123278]'>{PROXIMA_CITA.fecha}</strong>
            <span className='inline-flex items-center gap-1.5 rounded-full bg-[#e9f2ff] px-2.5 py-1 text-[9px] font-bold text-[#1474de]'>
              <IconoMedico className='h-3.5 w-3.5' nombre='clock' />
              {PROXIMA_CITA.hora}
            </span>
          </div>
          <p className='mt-2 text-[10px] leading-[15px] text-[#50668d]'>
            {PROXIMA_CITA.motivo}
            <br />
            {PROXIMA_CITA.servicio}
          </p>
        </div>
      </div>
      <BotonSecundario>Ver agenda</BotonSecundario>
    </article>
  )
}

function TarjetaDocumentos() {
  return (
    <article className='flex min-h-[166px] flex-col rounded-xl border border-[#dce5ee] bg-white p-4 shadow-[0_3px_10px_rgba(18,52,91,0.06)] md:col-span-2 xl:col-span-1'>
      <h2 className='text-[12px] font-extrabold text-[#f17224]'>Documentos recientes</h2>
      <ul className='mt-1 flex-1 divide-y divide-[#e3eaf1]'>
        {DOCUMENTOS.map((documento) => (
          <li key={documento.nombre}>
            <button
              className='flex h-[31px] w-full cursor-pointer items-center gap-2.5 rounded text-left text-[9px] text-[#3e5680] transition hover:bg-[#fff9f5] focus-visible:outline-2 focus-visible:outline-[#ff772c]'
              type='button'
            >
              <IconoMedico className='h-[18px] w-[18px] shrink-0 text-[#ff772c]' nombre='file' />
              <span className='min-w-0 flex-1 truncate'>
                {documento.nombre} {documento.fecha && <span>{documento.fecha}</span>}
              </span>
              <span className='font-bold text-[#536a91]'>{documento.formato}</span>
              <IconoMedico className='h-3.5 w-3.5 -rotate-90 text-[#536a91]' nombre='chevronDown' />
            </button>
          </li>
        ))}
      </ul>
      <BotonSecundario>Ver todos los documentos</BotonSecundario>
    </article>
  )
}

function FichaPacientePage() {
  const redirigir = useRedirrecion()

  return (
    <div className='flex min-h-dvh bg-[#fbfdff] font-sans'>
      <MenuMedicoComp contadorSeguimiento={1} variante='amplia' />

      <div className='min-w-0 flex-1'>
        <HeaderDoctorMedicoComp
          especialidad={DOCTORA.especialidad}
          nombre={DOCTORA.nombre}
          variante='amplia'
        />

        <main className='min-h-[calc(100dvh-54px)] px-4 pb-2.5 pt-6 sm:px-6 xl:px-8'>
          <div className='mx-auto w-full max-w-[1220px]'>
            <header className='flex flex-col gap-3 px-1 sm:flex-row sm:items-start sm:justify-between'>
              <div>
                <h1 className='text-[clamp(28px,2.45vw,32px)] font-extrabold leading-[1.08] tracking-[-0.035em] text-[#0a2b79]'>
                  Ficha del paciente
                </h1>
                <p className='mt-1 text-[clamp(10px,.9vw,12px)] font-medium leading-5 text-[#50658a]'>
                  Vista resumida de la información clínica, familiar y de seguimiento del paciente.
                </p>
              </div>
              <div className='flex flex-wrap gap-2.5'>
                <button
                  className='flex h-10 cursor-pointer items-center gap-2 rounded-lg border border-[#d6e1ec] bg-white px-4 text-[10px] font-bold text-[#37517f] transition hover:bg-[#f6fafc] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#08aabb]'
                  onClick={() => redirigir('/doctor/pacientes')}
                  type='button'
                >
                  <IconoMedico className='h-4 w-4' nombre='arrowLeft' />
                  Volver al listado
                </button>
                <button
                  className='flex h-10 cursor-pointer items-center gap-2 rounded-lg bg-gradient-to-r from-[#08aabc] to-[#078da9] px-5 text-[11px] font-bold text-white shadow-[0_4px_10px_rgba(5,111,124,0.16)] transition hover:-translate-y-0.5 hover:brightness-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#08aabb] active:translate-y-0'
                  type='button'
                >
                  <IconoMedico className='h-[18px] w-[18px]' nombre='edit' />
                  Editar ficha
                </button>
              </div>
            </header>

            <div className='mt-4'>
              <PerfilDocPacientComp
                onHistorial={() => redirigir('/doctor/historial')}
                perfil={PERFIL_PACIENTE}
              />
            </div>

            <section
              aria-label='Resumen del estado del paciente'
              className='mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-[.84fr_1fr_1.12fr] xl:gap-6'
            >
              <TarjetaSemaforo />
              <TarjetaProximaCita />
              <TarjetaDocumentos />
            </section>

            <div className='mt-3'>
              <DatosDocPacientComp secciones={SECCIONES_DATOS} />
            </div>

            <div className='mt-[18px] flex items-center justify-center gap-7 lg:-translate-x-[clamp(88px,7vw,102px)]'>
              <span aria-hidden='true' className='hidden h-11 w-px bg-[#d7e1ec] sm:block' />
              <button
                className='flex h-[60px] w-[332px] max-w-full cursor-pointer items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-[#08aabc] to-[#078da9] px-6 text-[20px] font-medium text-white shadow-[0_6px_14px_rgba(5,111,124,0.2)] transition hover:-translate-y-0.5 hover:brightness-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#08aabb] active:translate-y-0'
                onClick={() => redirigir('/antonella')}
                type='button'
              >
                <IconoMedico className='h-7 w-7' nombre='microphone' strokeWidth={1.9} />
                Nueva consulta por voz
              </button>
              <span aria-hidden='true' className='hidden h-11 w-px bg-[#d7e1ec] sm:block' />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default FichaPacientePage
