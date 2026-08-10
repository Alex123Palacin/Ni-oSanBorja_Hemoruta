import { useMemo, useState } from 'react'

import CartillaInformacionComp, {
  type CartillaInformacionCompProps,
} from '../../components/CartillaInformacionComp'
import HeaderDoctorMedicoComp from '../../components/HeaderDoctorMedicoComp'
import IconoMedico from '../../components/IconoMedico'
import MenuMedicoComp from '../../components/MenuMedicoComp'
import useRedirrecion from '../../hooks/Redirrecion'
import InputUi from '../../ui/InputUi'

type EstadoSeguimiento = 'Alerta' | 'En seguimiento'
type FiltroSeguimiento = 'alertas' | 'documento' | 'medicacion' | 'sintomas' | 'todos' | 'tratamiento'
type IdCartilla = 'alertas' | 'documentos' | 'pacientes' | 'sintomas'
type OrigenSeguimiento = 'App móvil' | 'WhatsApp'
type SemaforoPaciente = 'Amarillo' | 'Rojo' | 'Verde'
type TipoRegistro = Exclude<FiltroSeguimiento, 'alertas' | 'todos'>

interface PacienteSeguimiento {
  avatar: string
  colorAvatar: string
  descripcionSemaforo: string
  dni: string
  edad: number
  estado: EstadoSeguimiento
  fechaProximaCita: string
  fechaUltimoRegistro: string
  horaProximaCita: string
  horaUltimoRegistro: string
  id: string
  nombre: string
  origen: OrigenSeguimiento
  resumen: string
  semaforo: SemaforoPaciente
  tipoUltimoRegistro: TipoRegistro
}

interface DatoCartilla extends Omit<CartillaInformacionCompProps, 'onAccion'> {
  id: IdCartilla
}

const DOCTORA = {
  especialidad: 'Hematología Pediátrica',
  nombre: 'Dra. Valeria Ruiz',
}

const TOTAL_PACIENTES = 32

const CARTILLAS: DatoCartilla[] = [
  {
    accion: 'Ver todos',
    descripcion: 'con seguimiento activo',
    icono: 'users',
    id: 'pacientes',
    titulo: 'Pacientes',
    tono: 'azul',
    valor: TOTAL_PACIENTES,
  },
  {
    accion: 'Ver alertas',
    descripcion: 'requieren revisión',
    icono: 'alertTriangle',
    id: 'alertas',
    titulo: 'Alertas',
    tono: 'naranja',
    valor: 5,
  },
  {
    accion: 'Ver documentos',
    descripcion: 'nuevos esta semana',
    icono: 'file',
    id: 'documentos',
    titulo: 'Documentos',
    tono: 'morado',
    valor: 12,
  },
  {
    accion: 'Ver síntomas',
    descripcion: 'reportados hoy',
    icono: 'smile',
    id: 'sintomas',
    titulo: 'Síntomas',
    tono: 'turquesa',
    valor: 18,
  },
]

const FILTROS: { etiqueta: string; valor: Exclude<FiltroSeguimiento, 'alertas'> }[] = [
  { etiqueta: 'Todos', valor: 'todos' },
  { etiqueta: 'Medicación', valor: 'medicacion' },
  { etiqueta: 'Síntomas', valor: 'sintomas' },
  { etiqueta: 'Tratamiento', valor: 'tratamiento' },
  { etiqueta: 'Documento', valor: 'documento' },
]

const ETIQUETAS_REGISTRO: Record<TipoRegistro, string> = {
  documento: 'Documento',
  medicacion: 'Medicación',
  sintomas: 'Síntomas',
  tratamiento: 'Tratamiento',
}

const PACIENTES: PacienteSeguimiento[] = [
  {
    avatar: '👦🏻',
    colorAvatar: 'bg-[#dff5ef]',
    descripcionSemaforo: 'Sin síntomas significativos',
    dni: '81563421',
    edad: 8,
    estado: 'En seguimiento',
    fechaProximaCita: '27/05/2025',
    fechaUltimoRegistro: 'Hoy',
    horaProximaCita: '10:30 a. m.',
    horaUltimoRegistro: '08:45 a. m.',
    id: 'mateo-flores',
    nombre: 'Mateo Gabriel Flores',
    origen: 'WhatsApp',
    resumen: 'Seguimiento estable. La familia mantiene al día el reporte de síntomas y no presenta alertas recientes.',
    semaforo: 'Verde',
    tipoUltimoRegistro: 'sintomas',
  },
  {
    avatar: '👧🏻',
    colorAvatar: 'bg-[#fff0dd]',
    descripcionSemaforo: 'Síntomas leves',
    dni: '74215689',
    edad: 10,
    estado: 'En seguimiento',
    fechaProximaCita: '28/05/2025',
    fechaUltimoRegistro: 'Ayer',
    horaProximaCita: '09:00 a. m.',
    horaUltimoRegistro: '09:15 p. m.',
    id: 'luciana-perez',
    nombre: 'Luciana Pérez Castro',
    origen: 'App móvil',
    resumen: 'Presenta síntomas leves y registró correctamente su medicación. Requiere observación en la próxima cita.',
    semaforo: 'Amarillo',
    tipoUltimoRegistro: 'medicacion',
  },
  {
    avatar: '👦🏽',
    colorAvatar: 'bg-[#dff4f7]',
    descripcionSemaforo: 'Sin síntomas significativos',
    dni: '11025698',
    edad: 7,
    estado: 'En seguimiento',
    fechaProximaCita: '29/05/2025',
    fechaUltimoRegistro: 'Ayer',
    horaProximaCita: '11:00 a. m.',
    horaUltimoRegistro: '04:20 p. m.',
    id: 'santiago-rojas',
    nombre: 'Santiago Rojas Medina',
    origen: 'WhatsApp',
    resumen: 'Evolución favorable y comunicación constante mediante WhatsApp. No tiene síntomas de alarma.',
    semaforo: 'Verde',
    tipoUltimoRegistro: 'sintomas',
  },
  {
    avatar: '👧🏽',
    colorAvatar: 'bg-[#ffe7df]',
    descripcionSemaforo: 'Síntomas leves',
    dni: '76324512',
    edad: 12,
    estado: 'En seguimiento',
    fechaProximaCita: '30/05/2025',
    fechaUltimoRegistro: '20/05/2025',
    horaProximaCita: '09:30 a. m.',
    horaUltimoRegistro: '10:30 a. m.',
    id: 'valeria-quispe',
    nombre: 'Valeria Quispe Huamán',
    origen: 'App móvil',
    resumen: 'Continúa el tratamiento indicado. Se recomienda revisar la evolución de sus síntomas leves.',
    semaforo: 'Amarillo',
    tipoUltimoRegistro: 'tratamiento',
  },
  {
    avatar: '👦🏻',
    colorAvatar: 'bg-[#dff6f1]',
    descripcionSemaforo: 'Sin síntomas significativos',
    dni: '90541236',
    edad: 6,
    estado: 'En seguimiento',
    fechaProximaCita: '26/05/2025',
    fechaUltimoRegistro: '19/05/2025',
    horaProximaCita: '02:30 p. m.',
    horaUltimoRegistro: '08:10 p. m.',
    id: 'diego-vega',
    nombre: 'Diego Alonso Vega',
    origen: 'WhatsApp',
    resumen: 'Registro de medicación completo y sin cambios clínicos relevantes durante los últimos días.',
    semaforo: 'Verde',
    tipoUltimoRegistro: 'medicacion',
  },
  {
    avatar: '👧🏽',
    colorAvatar: 'bg-[#ffe7e7]',
    descripcionSemaforo: 'Síntomas moderados',
    dni: '85692147',
    edad: 9,
    estado: 'Alerta',
    fechaProximaCita: '25/05/2025',
    fechaUltimoRegistro: '19/05/2025',
    horaProximaCita: '09:00 a. m.',
    horaUltimoRegistro: '07:45 a. m.',
    id: 'camila-torres',
    nombre: 'Camila Torres Salazar',
    origen: 'App móvil',
    resumen: 'Se reportaron síntomas moderados. El caso requiere revisión médica y contacto con la familia.',
    semaforo: 'Rojo',
    tipoUltimoRegistro: 'sintomas',
  },
  {
    avatar: '👦🏻',
    colorAvatar: 'bg-[#e1f1fb]',
    descripcionSemaforo: 'Síntomas leves',
    dni: '67984521',
    edad: 11,
    estado: 'En seguimiento',
    fechaProximaCita: '24/05/2025',
    fechaUltimoRegistro: '18/05/2025',
    horaProximaCita: '10:00 a. m.',
    horaUltimoRegistro: '06:30 p. m.',
    id: 'andres-morales',
    nombre: 'Andrés Morales León',
    origen: 'WhatsApp',
    resumen: 'La familia envió un nuevo documento y mantiene comunicación activa con el equipo médico.',
    semaforo: 'Amarillo',
    tipoUltimoRegistro: 'documento',
  },
  {
    avatar: '👧🏻',
    colorAvatar: 'bg-[#fff0dd]',
    descripcionSemaforo: 'Sin síntomas significativos',
    dni: '12345678',
    edad: 5,
    estado: 'En seguimiento',
    fechaProximaCita: '23/05/2025',
    fechaUltimoRegistro: '18/05/2025',
    horaProximaCita: '11:30 a. m.',
    horaUltimoRegistro: '05:20 p. m.',
    id: 'isabella-navarro',
    nombre: 'Isabella Navarro Díaz',
    origen: 'App móvil',
    resumen: 'Buena adherencia a la medicación y registros actualizados desde la aplicación móvil.',
    semaforo: 'Verde',
    tipoUltimoRegistro: 'medicacion',
  },
]

const ESTILOS_SEMAFORO: Record<SemaforoPaciente, { punto: string; texto: string }> = {
  Amarillo: { punto: 'bg-[#ffa31a]', texto: 'text-[#df8610]' },
  Rojo: { punto: 'bg-[#ef3f4b]', texto: 'text-[#df3340]' },
  Verde: { punto: 'bg-[#14b94d]', texto: 'text-[#15923e]' },
}

function SemaforoBadge({ paciente }: { paciente: PacienteSeguimiento }) {
  const estilo = ESTILOS_SEMAFORO[paciente.semaforo]

  return (
    <span className='block leading-[11px]'>
      <strong className={`flex items-center gap-1.5 text-[9px] ${estilo.texto}`}>
        <span className={`h-2 w-2 rounded-full ${estilo.punto}`} />
        {paciente.semaforo}
      </strong>
      <span className='mt-0.5 block text-[8px] leading-[10px] text-[#52688d]'>{paciente.descripcionSemaforo}</span>
    </span>
  )
}

function EstadoVacioPanel() {
  return (
    <div className='flex h-full min-h-[420px] translate-y-5 flex-col items-center justify-center px-5 text-center'>
      <h2 className='text-[15px] font-extrabold text-[#082c80]'>Selecciona un paciente</h2>

      <div aria-hidden='true' className='relative my-7 h-[174px] w-[210px]'>
        <span className='absolute bottom-2 left-1 h-[72px] w-9 -rotate-12 rounded-[50%] bg-[#dff4ef]' />
        <span className='absolute bottom-2 left-8 h-12 w-4 rotate-[26deg] rounded-[50%] bg-[#a9ded2]' />
        <span className='absolute bottom-3 right-0 h-14 w-14 rounded-full bg-[#e7f3fb]' />
        <span className='absolute left-4 top-12 h-4 w-4 rounded-full bg-[#e7f1fa]' />
        <span className='absolute right-4 top-14 h-5 w-5 rounded-full bg-[#dff4ef]' />

        <span className='absolute left-1/2 top-3 h-[145px] w-[100px] -translate-x-1/2 rounded-[10px] border-[6px] border-[#b7d5eb] bg-white shadow-[0_7px_12px_rgba(47,88,130,0.08)]'>
          <span className='absolute -top-[14px] left-1/2 h-6 w-12 -translate-x-1/2 rounded-t-lg rounded-b-sm bg-[#5a6f9f]'>
            <span className='absolute left-1/2 top-1 h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-white/80' />
          </span>
          <span className='absolute left-3 top-8 h-10 w-10 rounded-lg bg-[#e8f5fb]'>
            <span className='absolute left-1/2 top-1.5 h-3 w-3 -translate-x-1/2 rounded-full bg-[#109caf]' />
            <span className='absolute bottom-1.5 left-1/2 h-3.5 w-6 -translate-x-1/2 rounded-t-full bg-[#109caf]' />
          </span>
          <span className='absolute right-3 top-10 h-1.5 w-7 rounded-full bg-[#d5e4ef]' />
          <span className='absolute right-3 top-[53px] h-1.5 w-5 rounded-full bg-[#e4edf4]' />
          <span className='absolute left-3 right-3 top-[84px] h-1.5 rounded-full bg-[#d5e4ef]' />
          <span className='absolute left-3 right-6 top-[99px] h-1.5 rounded-full bg-[#dce8f1]' />
          <span className='absolute left-3 right-8 top-[114px] h-1.5 rounded-full bg-[#e6eef5]' />
        </span>

        <span className='absolute bottom-0 right-5 grid h-[62px] w-[62px] place-items-center rounded-full border-[6px] border-[#526a9b] bg-white/95 text-[#526a9b] shadow-sm'>
          <IconoMedico className='h-8 w-8' nombre='search' strokeWidth={2.1} />
        </span>
      </div>

      <p className='max-w-[235px] text-[11px] font-medium leading-[18px] text-[#52688d]'>
        Elige un paciente para ver su seguimiento consolidado, adherencia, síntomas y documentos.
      </p>
    </div>
  )
}

interface PanelPacienteProps {
  onVerSeguimiento: () => void
  paciente: PacienteSeguimiento
}

function PanelPaciente({ onVerSeguimiento, paciente }: PanelPacienteProps) {
  const estiloSemaforo = ESTILOS_SEMAFORO[paciente.semaforo]

  return (
    <article className='p-5'>
      <p className='text-[10px] font-bold uppercase tracking-[0.08em] text-[#079daf]'>Paciente seleccionado</p>
      <div className='mt-4 flex items-center gap-3'>
        <span className={`grid h-14 w-14 shrink-0 place-items-center rounded-full text-[31px] ${paciente.colorAvatar}`}>
          <span aria-hidden='true'>{paciente.avatar}</span>
        </span>
        <div className='min-w-0'>
          <h2 className='text-[14px] font-extrabold leading-[18px] text-[#0a2b79]'>{paciente.nombre}</h2>
          <p className='mt-1 text-[9px] font-medium text-[#607395]'>
            {paciente.edad} años · DNI {paciente.dni}
          </p>
        </div>
      </div>

      <p className='mt-5 rounded-xl bg-[#f3fafb] p-3.5 text-[10px] font-medium leading-[16px] text-[#455d85]'>
        {paciente.resumen}
      </p>

      <dl className='mt-4 divide-y divide-[#e1e9f0] text-[9px] text-[#52688d]'>
        <div className='flex items-center justify-between gap-3 py-2'>
          <dt>Canal reciente</dt>
          <dd className='flex items-center gap-1 font-bold text-[#173777]'>
            <IconoMedico
              className={`h-4 w-4 ${paciente.origen === 'WhatsApp' ? 'text-[#17b75c]' : 'text-[#287ee8]'}`}
              nombre={paciente.origen === 'WhatsApp' ? 'whatsapp' : 'smartphone'}
            />
            {paciente.origen}
          </dd>
        </div>
        <div className='flex items-center justify-between gap-3 py-2'>
          <dt>Último registro</dt>
          <dd className='text-right font-bold text-[#173777]'>
            {paciente.fechaUltimoRegistro}
            <br />
            {ETIQUETAS_REGISTRO[paciente.tipoUltimoRegistro]}
          </dd>
        </div>
        <div className='flex items-center justify-between gap-3 py-2'>
          <dt>Semáforo actual</dt>
          <dd className={`flex items-center gap-1 font-bold ${estiloSemaforo.texto}`}>
            <span className={`h-2 w-2 rounded-full ${estiloSemaforo.punto}`} />
            {paciente.semaforo}
          </dd>
        </div>
        <div className='flex items-center justify-between gap-3 py-2'>
          <dt>Próxima cita</dt>
          <dd className='text-right font-bold text-[#173777]'>
            {paciente.fechaProximaCita}
            <br />
            {paciente.horaProximaCita}
          </dd>
        </div>
      </dl>

      <button
        className='mt-4 flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#08aabc] to-[#078da9] text-[10px] font-bold text-white shadow-sm transition hover:brightness-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#08aabb]'
        onClick={onVerSeguimiento}
        type='button'
      >
        Ver seguimiento completo
        <IconoMedico className='h-4 w-4' nombre='arrowRight' />
      </button>
    </article>
  )
}

function SeguimientoPacientesListaPage() {
  const [busqueda, setBusqueda] = useState('')
  const [filtroActivo, setFiltroActivo] = useState<FiltroSeguimiento>('todos')
  const [pacienteSeleccionadoId, setPacienteSeleccionadoId] = useState<string | null>(null)
  const redirigir = useRedirrecion()

  const pacientesFiltrados = useMemo(() => {
    const termino = busqueda.trim().toLocaleLowerCase('es')

    return PACIENTES.filter((paciente) => {
      const coincideBusqueda =
        !termino ||
        paciente.nombre.toLocaleLowerCase('es').includes(termino) ||
        paciente.dni.includes(termino)
      const coincideFiltro =
        filtroActivo === 'todos' ||
        (filtroActivo === 'alertas' && paciente.estado === 'Alerta') ||
        paciente.tipoUltimoRegistro === filtroActivo

      return coincideBusqueda && coincideFiltro
    })
  }, [busqueda, filtroActivo])

  const pacienteSeleccionado =
    pacientesFiltrados.find((paciente) => paciente.id === pacienteSeleccionadoId) ?? null
  const hayFiltrosActivos = busqueda.trim().length > 0 || filtroActivo !== 'todos'

  function manejarAccionCartilla(id: IdCartilla) {
    setBusqueda('')

    const filtrosPorCartilla: Record<IdCartilla, FiltroSeguimiento> = {
      alertas: 'alertas',
      documentos: 'documento',
      pacientes: 'todos',
      sintomas: 'sintomas',
    }

    setFiltroActivo(filtrosPorCartilla[id])
  }

  function limpiarFiltros() {
    setBusqueda('')
    setFiltroActivo('todos')
  }

  return (
    <div className='flex min-h-dvh bg-[#fbfdff]'>
      <MenuMedicoComp variante='seguimiento' />

      <div className='min-w-0 flex-1'>
        <HeaderDoctorMedicoComp
          especialidad={DOCTORA.especialidad}
          nombre={DOCTORA.nombre}
          notificaciones={5}
          variante='seguimiento'
        />

        <div className='grid min-h-[calc(100dvh-48px)] xl:grid-cols-[minmax(0,1fr)_clamp(286px,22vw,304px)]'>
          <main className='min-w-0 px-[clamp(16px,2vw,26px)] pb-2 pt-4'>
            <div className='w-full max-w-[1120px]'>
              <header>
                <h1 className='text-[clamp(25px,2.1vw,28px)] font-extrabold leading-[34px] tracking-[-0.035em] text-[#0a2b79]'>
                  Seguimiento del paciente
                </h1>
                <p className='mt-0.5 text-[10px] font-medium leading-[14px] text-[#50658a]'>
                  Información consolidada desde WhatsApp y la app móvil para seguimiento clínico.
                </p>
              </header>

              <section aria-label='Resumen del seguimiento' className='mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4'>
                {CARTILLAS.map(({ id, ...cartilla }) => (
                  <CartillaInformacionComp
                    {...cartilla}
                    key={id}
                    onAccion={() => manejarAccionCartilla(id)}
                  />
                ))}
              </section>

              <section className='mt-3 rounded-xl border border-[#dce5ee] bg-white p-2 shadow-[0_2px_8px_rgba(18,52,91,0.05)]'>
                <div className='flex gap-2'>
                  <InputUi
                    contenedorClassName='flex-1'
                    etiqueta='Buscar paciente'
                    onChange={(event) => setBusqueda(event.target.value)}
                    placeholder='Buscar por nombre del paciente o DNI...'
                    tamano='compacto'
                    value={busqueda}
                  />
                  <button
                    aria-label={hayFiltrosActivos ? 'Limpiar filtros' : 'Filtros de pacientes'}
                    className='flex h-8 shrink-0 cursor-pointer items-center gap-2 rounded-lg border border-[#08aabb] bg-white px-4 text-[10px] font-bold text-[#079daf] transition hover:bg-[#effafb] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#08aabb] disabled:cursor-default disabled:opacity-100'
                    disabled={!hayFiltrosActivos}
                    onClick={limpiarFiltros}
                    type='button'
                  >
                    <IconoMedico className='h-4 w-4' nombre='filter' />
                    {hayFiltrosActivos ? 'Limpiar filtros' : 'Filtros'}
                  </button>
                </div>

                <nav aria-label='Filtrar por tipo de registro' className='mt-1.5 overflow-x-auto'>
                  <div className='flex min-w-max gap-2'>
                    {FILTROS.map((filtro) => {
                      const activo = filtroActivo === filtro.valor

                      return (
                        <button
                          aria-pressed={activo}
                          className={`h-6 min-w-[62px] cursor-pointer rounded-full border px-3 text-[8px] font-bold transition motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#08aabb] ${
                            activo
                              ? 'border-[#079daf] bg-[#079daf] text-white'
                              : 'border-[#dbe5ee] bg-white text-[#365083] hover:border-[#91d8df] hover:bg-[#f3fbfc]'
                          }`}
                          key={filtro.valor}
                          onClick={() => setFiltroActivo(filtro.valor)}
                          type='button'
                        >
                          {filtro.etiqueta}
                        </button>
                      )
                    })}
                    {filtroActivo === 'alertas' && (
                      <button
                        aria-pressed='true'
                        className='h-6 min-w-[62px] cursor-pointer rounded-full border border-[#f28a13] bg-[#fff1df] px-3 text-[8px] font-bold text-[#dc7c0d] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f28a13]'
                        onClick={() => setFiltroActivo('todos')}
                        type='button'
                      >
                        Alertas ×
                      </button>
                    )}
                  </div>
                </nav>
              </section>

              <section className='mt-2 overflow-hidden rounded-xl border border-[#dce5ee] bg-white shadow-[0_2px_8px_rgba(18,52,91,0.06)]'>
                <div aria-label='Listado de pacientes en seguimiento' className='overflow-x-auto' tabIndex={0}>
                  <table className='w-full min-w-[760px] table-fixed border-collapse'>
                    <caption className='sr-only'>Pacientes con seguimiento clínico activo</caption>
                    <colgroup>
                      <col className='w-[22%]' />
                      <col className='w-[13%]' />
                      <col className='w-[17%]' />
                      <col className='w-[18%]' />
                      <col className='w-[15%]' />
                      <col className='w-[11%]' />
                      <col className='w-[4%]' />
                    </colgroup>
                    <thead>
                      <tr className='h-7 bg-[#f8fafc] text-left text-[8px] font-extrabold text-[#3d5682]'>
                        <th className='px-2' scope='col'>Paciente</th>
                        <th className='px-2' scope='col'>Origen reciente</th>
                        <th className='px-2' scope='col'>
                          <span className='flex items-center gap-1'>
                            Último registro
                            <IconoMedico className='h-3 w-3' nombre='chevronDown' />
                          </span>
                        </th>
                        <th className='px-2' scope='col'>Semáforo</th>
                        <th className='px-2' scope='col'>Próxima cita</th>
                        <th className='px-2' scope='col'>Estado</th>
                        <th className='px-1' scope='col'><span className='sr-only'>Seleccionar</span></th>
                      </tr>
                    </thead>
                    <tbody className='divide-y divide-[#e1e9f0]'>
                      {pacientesFiltrados.map((paciente) => {
                        const seleccionado = pacienteSeleccionadoId === paciente.id

                        return (
                          <tr
                            className={`h-11 text-[8px] text-[#314a78] transition motion-reduce:transition-none ${
                              seleccionado ? 'bg-[#eaf8fa]' : 'hover:bg-[#f7fbfc]'
                            }`}
                            key={paciente.id}
                          >
                            <td className='px-2'>
                              <button
                                aria-pressed={seleccionado}
                                className='flex w-full cursor-pointer items-center gap-2 text-left focus-visible:rounded focus-visible:outline-2 focus-visible:outline-[#08aabb]'
                                onClick={() => setPacienteSeleccionadoId(paciente.id)}
                                type='button'
                              >
                                <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-[17px] ${paciente.colorAvatar}`}>
                                  <span aria-hidden='true'>{paciente.avatar}</span>
                                </span>
                                <span className='min-w-0'>
                                  <strong className='block truncate text-[9px] font-extrabold leading-[11px] text-[#153679]'>{paciente.nombre}</strong>
                                  <span className='text-[8px] leading-[10px] text-[#647797]'>{paciente.edad} años · DNI {paciente.dni}</span>
                                </span>
                              </button>
                            </td>
                            <td className='px-2'>
                              <span className='flex items-center gap-1 font-semibold'>
                                <IconoMedico
                                  className={`h-4 w-4 ${paciente.origen === 'WhatsApp' ? 'text-[#18b75d]' : 'text-[#287ee8]'}`}
                                  nombre={paciente.origen === 'WhatsApp' ? 'whatsapp' : 'smartphone'}
                                />
                                {paciente.origen}
                              </span>
                            </td>
                            <td className='px-2 leading-[11px]'>
                              <strong className='block font-bold text-[#385482]'>{paciente.fechaUltimoRegistro} {paciente.horaUltimoRegistro}</strong>
                              <span>{ETIQUETAS_REGISTRO[paciente.tipoUltimoRegistro]}</span>
                            </td>
                            <td className='px-2'><SemaforoBadge paciente={paciente} /></td>
                            <td className='px-2 leading-[11px]'>
                              <span className='flex items-start gap-1'>
                                <IconoMedico className='h-3.5 w-3.5 shrink-0 text-[#516b96]' nombre='calendar' />
                                <span>
                                  <strong className='block font-bold text-[#385482]'>{paciente.fechaProximaCita}</strong>
                                  {paciente.horaProximaCita}
                                </span>
                              </span>
                            </td>
                            <td className='px-2'>
                              <span className={`inline-flex whitespace-nowrap rounded-full px-2 py-1 text-[8px] font-bold ${
                                paciente.estado === 'Alerta'
                                  ? 'bg-[#ffe8e8] text-[#e23d49]'
                                  : 'bg-[#e8f4ff] text-[#277bd9]'
                              }`}>
                                {paciente.estado}
                              </span>
                            </td>
                            <td className='px-1'>
                              <button
                                aria-label={`Seleccionar a ${paciente.nombre}`}
                                className='grid h-6 w-6 cursor-pointer place-items-center rounded text-[#28509c] transition hover:bg-[#dff3f6] focus-visible:outline-2 focus-visible:outline-[#08aabb]'
                                onClick={(event) => {
                                  event.stopPropagation()
                                  setPacienteSeleccionadoId(paciente.id)
                                }}
                                type='button'
                              >
                                <IconoMedico className='h-3.5 w-3.5' nombre='arrowRight' strokeWidth={2.2} />
                              </button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>

                  {pacientesFiltrados.length === 0 && (
                    <div className='grid min-h-32 place-items-center px-5 text-center text-[10px] font-medium text-[#617493]'>
                      No se encontraron pacientes con los filtros seleccionados.
                    </div>
                  )}
                </div>

                <footer className='flex min-h-[38px] flex-wrap items-center justify-between gap-2 border-t border-[#e1e9f0] px-3 py-1'>
                  <p className='text-[9px] font-medium text-[#53688d]'>
                    Mostrando {pacientesFiltrados.length === 0 ? 0 : 1} a {pacientesFiltrados.length} de {TOTAL_PACIENTES} pacientes
                  </p>
                  <nav aria-label='Paginación de seguimiento' className='flex items-center gap-1.5'>
                    <button
                      aria-label='Página anterior'
                      className='grid h-[30px] w-[30px] cursor-default place-items-center rounded-lg border border-[#d7e1ec] text-[#9aabc1]'
                      disabled
                      type='button'
                    >
                      <IconoMedico className='h-3.5 w-3.5' nombre='arrowLeft' />
                    </button>
                    {[1, 2, 3].map((pagina) => (
                      <button
                        aria-current={pagina === 1 ? 'page' : undefined}
                        className={`grid h-[30px] w-[30px] cursor-default place-items-center rounded-lg border text-[9px] font-bold ${
                          pagina === 1
                            ? 'border-[#08aabb] bg-[#edfafa] text-[#079daf]'
                            : 'border-[#d7e1ec] bg-white text-[#49618b]'
                        }`}
                        disabled
                        key={pagina}
                        type='button'
                      >
                        {pagina}
                      </button>
                    ))}
                    <span className='px-1 text-[9px] text-[#60749a]'>...</span>
                    <button
                      className='grid h-[30px] w-[30px] cursor-default place-items-center rounded-lg border border-[#d7e1ec] text-[9px] font-bold text-[#49618b]'
                      disabled
                      type='button'
                    >
                      4
                    </button>
                    <button
                      aria-label='Página siguiente'
                      className='grid h-[30px] w-[30px] cursor-default place-items-center rounded-lg border border-[#d7e1ec] text-[#49618b]'
                      disabled
                      type='button'
                    >
                      <IconoMedico className='h-3.5 w-3.5' nombre='arrowRight' />
                    </button>
                  </nav>
                </footer>
              </section>
            </div>
          </main>

          <aside className='border-t border-[#dbe5ee] bg-white px-2.5 pb-2 pt-3 xl:sticky xl:top-12 xl:h-[calc(100dvh-48px)] xl:border-l xl:border-t-0'>
            <div aria-live='polite' className='h-full overflow-y-auto rounded-xl border border-[#dce5ee] bg-[#fcfdff] shadow-[0_2px_8px_rgba(18,52,91,0.04)]'>
              {pacienteSeleccionado ? (
                <PanelPaciente
                  onVerSeguimiento={() => redirigir('/doctor/visualizar')}
                  paciente={pacienteSeleccionado}
                />
              ) : (
                <EstadoVacioPanel />
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}

export default SeguimientoPacientesListaPage
