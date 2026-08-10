import { useMemo, useState } from 'react'

import HeaderDoctorMedicoComp from '../../components/HeaderDoctorMedicoComp'
import IconoMedico from '../../components/IconoMedico'
import MenuMedicoComp from '../../components/MenuMedicoComp'
import useRedirrecion from '../../hooks/Redirrecion'
import { BtnCrear } from '../../ui/BotonUi'
import ComboBoxUI, { type OpcionComboBox } from '../../ui/ComboBoxUI'
import InputUi from '../../ui/InputUi'

type EstadoPaciente = 'Evaluado' | 'Hoy' | 'Programado'
type TipoBusqueda = 'dni' | 'nombre'

interface Paciente {
  avatar: string
  colorAvatar: string
  diagnostico: string
  dni: string
  edad: number
  estado: EstadoPaciente
  fechaCita: string
  horaCita: string
  nombre: string
  parentescoTutor: string
  tutor: string
}

const DOCTORA = {
  especialidad: 'Hematología Pediátrica',
  nombre: 'Dra. Valeria Ruiz',
}

const TOTAL_PACIENTES = 142

const PACIENTES: Paciente[] = [
  {
    avatar: '👦🏻',
    colorAvatar: 'bg-[#dff5ef]',
    diagnostico: 'Leucemia linfoblástica aguda (LLA)',
    dni: '71562384',
    edad: 8,
    estado: 'Hoy',
    fechaCita: '27/05/2025',
    horaCita: '10:30 a. m.',
    nombre: 'Mateo Gabriel Flores',
    parentescoTutor: 'Madre',
    tutor: 'María Flores López',
  },
  {
    avatar: '👧🏻',
    colorAvatar: 'bg-[#fff0dd]',
    diagnostico: 'Anemia aplásica',
    dni: '62438751',
    edad: 6,
    estado: 'Evaluado',
    fechaCita: '29/05/2025',
    horaCita: '09:00 a. m.',
    nombre: 'Luciana Valentina Rojas',
    parentescoTutor: 'Padre',
    tutor: 'Carlos Rojas Paredes',
  },
  {
    avatar: '👦🏽',
    colorAvatar: 'bg-[#dff4f7]',
    diagnostico: 'Hemofilia A severa',
    dni: '80319276',
    edad: 10,
    estado: 'Programado',
    fechaCita: '02/06/2025',
    horaCita: '11:00 a. m.',
    nombre: 'Santiago André Medina',
    parentescoTutor: 'Madre',
    tutor: 'Verónica Medina Ruiz',
  },
  {
    avatar: '👧🏽',
    colorAvatar: 'bg-[#ffe7df]',
    diagnostico: 'Linfoma de Hodgkin',
    dni: '69254731',
    edad: 7,
    estado: 'Evaluado',
    fechaCita: '05/06/2025',
    horaCita: '02:00 p. m.',
    nombre: 'Camila Alejandra Torres',
    parentescoTutor: 'Padre',
    tutor: 'Jorge Torres Vega',
  },
  {
    avatar: '👦🏻',
    colorAvatar: 'bg-[#dff6f1]',
    diagnostico: 'Talasemia beta mayor',
    dni: '73846219',
    edad: 9,
    estado: 'Hoy',
    fechaCita: '09/06/2025',
    horaCita: '10:30 a. m.',
    nombre: 'Diego Alonso Pérez',
    parentescoTutor: 'Madre',
    tutor: 'Katherine Pérez Solís',
  },
]

const OPCIONES_DIAGNOSTICO: OpcionComboBox[] = [
  { etiqueta: 'Todos los diagnósticos', valor: 'todos' },
  { etiqueta: 'Anemia aplásica', valor: 'Anemia aplásica' },
  { etiqueta: 'Hemofilia A severa', valor: 'Hemofilia A severa' },
  { etiqueta: 'Leucemia linfoblástica aguda', valor: 'Leucemia linfoblástica aguda (LLA)' },
  { etiqueta: 'Linfoma de Hodgkin', valor: 'Linfoma de Hodgkin' },
  { etiqueta: 'Talasemia beta mayor', valor: 'Talasemia beta mayor' },
]

const OPCIONES_ESTADO: OpcionComboBox[] = [
  { etiqueta: 'Todos los estados', valor: 'todos' },
  { etiqueta: 'Hoy', valor: 'Hoy' },
  { etiqueta: 'Evaluado', valor: 'Evaluado' },
  { etiqueta: 'Programado', valor: 'Programado' },
]

const CAMPOS_BUSQUEDA = [
  { etiqueta: 'DNI', valor: 'dni' },
  { etiqueta: 'Nombre del paciente', valor: 'nombre' },
] as const satisfies readonly { etiqueta: string; valor: TipoBusqueda }[]

const COLUMNAS = [
  'Paciente',
  'DNI',
  'Tutor responsable',
  'Diagnóstico principal',
  'Próxima cita',
  'Estado',
  'Acciones',
] as const

const ESTILOS_ESTADO: Record<EstadoPaciente, { fondo: string; punto: string; texto: string }> = {
  Evaluado: { fondo: 'bg-[#dcecff]', punto: 'bg-[#2385f4]', texto: 'text-[#1674dc]' },
  Hoy: { fondo: 'bg-[#dcf5df]', punto: 'bg-[#27bd42]', texto: 'text-[#15952d]' },
  Programado: { fondo: 'bg-[#ffead2]', punto: 'bg-[#ff8a1f]', texto: 'text-[#f1780d]' },
}

interface EstadoBadgeProps {
  estado: EstadoPaciente
}

function EstadoBadge({ estado }: EstadoBadgeProps) {
  const estilo = ESTILOS_ESTADO[estado]

  return (
    <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold ${estilo.texto}`}>
      <span aria-hidden='true' className={`grid h-4 w-4 place-items-center rounded-[5px] ${estilo.fondo}`}>
        <span className={`h-2 w-2 rounded-full ${estilo.punto}`} />
      </span>
      {estado}
    </span>
  )
}

function IconoPacientesRegistrados() {
  return (
    <svg aria-hidden='true' className='h-9 w-9' fill='currentColor' viewBox='0 0 32 32'>
      <circle cx='16' cy='9.2' r='5.1' />
      <circle cx='7.4' cy='12.3' r='3.6' opacity='.85' />
      <circle cx='24.6' cy='12.3' r='3.6' opacity='.85' />
      <path d='M7 27v-3.1c0-5.2 3.9-8.7 9-8.7s9 3.5 9 8.7V27H7Z' />
      <path d='M1.5 26v-2.5c0-3.6 2.4-6.3 5.9-6.8a9.4 9.4 0 0 0-2.1 6.1V26H1.5Zm29 0h-3.8v-3.2a9.4 9.4 0 0 0-2.1-6.1c3.5.5 5.9 3.2 5.9 6.8V26Z' opacity='.85' />
    </svg>
  )
}

function normalizarTexto(texto: string) {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('es')
}

function GestionarPacientesPage() {
  const [busqueda, setBusqueda] = useState('')
  const [diagnostico, setDiagnostico] = useState('todos')
  const [estado, setEstado] = useState('todos')
  const [tipoBusqueda, setTipoBusqueda] = useState<TipoBusqueda>('dni')
  const redirigir = useRedirrecion()

  const pacientesFiltrados = useMemo(() => {
    const termino = normalizarTexto(busqueda.trim())

    return PACIENTES.filter((paciente) => {
      const valorBusqueda = {
        dni: paciente.dni,
        nombre: paciente.nombre,
      }[tipoBusqueda]
      const coincideBusqueda = !termino || normalizarTexto(valorBusqueda).includes(termino)
      const coincideDiagnostico = diagnostico === 'todos' || paciente.diagnostico === diagnostico
      const coincideEstado = estado === 'todos' || paciente.estado === estado

      return coincideBusqueda && coincideDiagnostico && coincideEstado
    })
  }, [busqueda, diagnostico, estado, tipoBusqueda])

  function limpiarFiltros() {
    setBusqueda('')
    setDiagnostico('todos')
    setEstado('todos')
    setTipoBusqueda('dni')
  }

  return (
    <div className='flex min-h-dvh bg-[#fbfdff] font-sans'>
      <MenuMedicoComp contadorSeguimiento={1} variante='amplia' />

      <div className='min-w-0 flex-1'>
        <HeaderDoctorMedicoComp
          especialidad={DOCTORA.especialidad}
          nombre={DOCTORA.nombre}
          variante='amplia'
        />

        <main className='min-h-[calc(100dvh-54px)] px-4 pb-3 pt-5 sm:px-6 xl:px-8'>
          <div className='mx-auto w-full max-w-[1220px]'>
            <div className='flex flex-col gap-3 px-1 sm:flex-row sm:items-start sm:justify-between'>
              <div className='min-w-0'>
                <h1 className='text-[clamp(28px,2.45vw,32px)] font-extrabold leading-[1.08] tracking-[-0.035em] text-[#0a2b79]'>
                  Pacientes
                </h1>
                <p className='mt-1 text-[clamp(11px,.92vw,13px)] font-medium leading-5 text-[#50658a]'>
                  Gestiona y consulta la ficha longitudinal de los pacientes hematológicos pediátricos.
                </p>
              </div>
              <BtnCrear ruta='/doctor/nuevoRegistro' tamano='compacto' texto='Nuevo paciente' />
            </div>

            <section
              aria-label={`${TOTAL_PACIENTES} pacientes registrados`}
              className='mt-5 flex h-[108px] w-[320px] max-w-full items-center gap-5 rounded-xl border border-[#d8e8ef] bg-gradient-to-r from-[#f7fcfd] to-[#f3fafc] px-5 shadow-[0_2px_6px_rgba(18,52,91,0.04)]'
            >
              <span className='grid h-[68px] w-[68px] shrink-0 place-items-center rounded-full bg-[#ddf4f5] text-[#079daf]'>
                <IconoPacientesRegistrados />
              </span>
              <div>
                <span className='block text-[11px] font-bold text-[#079daf]'>Pacientes registrados</span>
                <strong className='block text-[32px] font-extrabold leading-9 text-[#0a2b79]'>{TOTAL_PACIENTES}</strong>
                <span className='text-[9px] font-medium text-[#50658a]'>Total de pacientes en el sistema</span>
              </div>
            </section>

            <section className='mt-3 rounded-xl border border-[#dce5ee] bg-white p-3.5 shadow-[0_4px_14px_rgba(18,52,91,0.07)]'>
              <div className='grid items-end gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(300px,1.7fr)_minmax(170px,.9fr)_minmax(160px,.85fr)_136px]'>
                <InputUi
                  etiqueta='Búsqueda rápida'
                  etiquetaVisible
                  id='busquedaPaciente'
                  onChange={(event) => setBusqueda(event.target.value)}
                  placeholder='Buscar por DNI o nombre...'
                  value={busqueda}
                />

                <ComboBoxUI
                  etiqueta='Diagnóstico'
                  id='filtroDiagnostico'
                  onChange={setDiagnostico}
                  opciones={OPCIONES_DIAGNOSTICO}
                  valor={diagnostico}
                />
                <ComboBoxUI
                  etiqueta='Estado'
                  id='filtroEstado'
                  onChange={setEstado}
                  opciones={OPCIONES_ESTADO}
                  valor={estado}
                />
                <button
                  className='flex h-10 cursor-pointer items-center justify-center gap-2 rounded-lg border border-[#08aabb] bg-white px-3 text-[10px] font-bold text-[#079daf] transition hover:bg-[#f0fbfc] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#08aabb]'
                  onClick={limpiarFiltros}
                  type='button'
                >
                  <IconoMedico className='h-[18px] w-[18px]' nombre='filter' />
                  Limpiar filtros
                </button>
              </div>

              <fieldset className='mt-3 flex flex-wrap items-center gap-x-6 gap-y-2'>
                <legend className='sr-only'>Búsqueda avanzada por</legend>
                <span className='text-[9px] font-semibold text-[#5a6e91]'>Búsqueda avanzada por</span>
                {CAMPOS_BUSQUEDA.map((campo) => (
                  <label
                    className='flex cursor-pointer items-center gap-2 text-[9px] font-medium text-[#4c6186]'
                    key={campo.valor}
                  >
                    <input
                      checked={tipoBusqueda === campo.valor}
                      className='h-3.5 w-3.5 appearance-none rounded-full border border-[#b8c8da] bg-white transition checked:border-[4px] checked:border-[#08aabb] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#08aabb]'
                      name='tipoBusqueda'
                      onChange={() => setTipoBusqueda(campo.valor)}
                      type='radio'
                    />
                    {campo.etiqueta}
                  </label>
                ))}
              </fieldset>
            </section>

            <section className='mt-2.5 overflow-hidden rounded-xl border border-[#dce5ee] bg-white shadow-[0_5px_16px_rgba(18,52,91,0.08)]'>
              <div aria-label='Tabla de pacientes' className='overflow-x-auto' tabIndex={0}>
                <table className='w-full min-w-[900px] table-fixed border-collapse'>
                  <caption className='sr-only'>Listado de pacientes hematológicos pediátricos registrados</caption>
                  <colgroup>
                    <col className='w-[20%]' />
                    <col className='w-[9%]' />
                    <col className='w-[16%]' />
                    <col className='w-[18%]' />
                    <col className='w-[14%]' />
                    <col className='w-[11%]' />
                    <col className='w-[12%]' />
                  </colgroup>
                  <thead>
                    <tr className='h-10 border-b border-[#dce5ee] bg-[#fcfeff] text-left text-[10px] font-extrabold text-[#078fa6]'>
                      {COLUMNAS.map((columna) => (
                        <th className='px-3' key={columna} scope='col'>
                          <span className={`flex items-center gap-1 ${columna === 'Acciones' ? 'justify-center' : ''}`}>
                            {columna}
                            {columna !== 'Acciones' && (
                              <IconoMedico className='h-3 w-3 text-[#7390ae]' nombre='chevronDown' />
                            )}
                          </span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className='divide-y divide-[#e3eaf1]'>
                    {pacientesFiltrados.map((paciente) => (
                      <tr
                        className='h-[54px] text-[10px] text-[#314a78] transition hover:bg-[#f7fcfd]'
                        key={paciente.dni}
                      >
                        <td className='px-3'>
                          <div className='flex items-center gap-2.5'>
                            <span
                              className={`grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-full border border-[#cbe9eb] text-[26px] shadow-sm ${paciente.colorAvatar}`}
                            >
                              <span aria-hidden='true' className='translate-y-0.5'>{paciente.avatar}</span>
                            </span>
                            <span className='min-w-0'>
                              <strong className='block truncate text-[10px] font-extrabold text-[#153679]'>
                                {paciente.nombre}
                              </strong>
                              <span className='text-[9px] text-[#657797]'>{paciente.edad} años</span>
                            </span>
                          </div>
                        </td>
                        <td className='px-3 text-[10px] font-semibold'>{paciente.dni}</td>
                        <td className='px-3'>
                          <span className='block font-medium'>{paciente.tutor}</span>
                          <span className='text-[9px] text-[#71819d]'>{paciente.parentescoTutor}</span>
                        </td>
                        <td className='px-3 font-medium leading-[14px]'>{paciente.diagnostico}</td>
                        <td className='px-3'>
                          <span className='flex items-start gap-2'>
                            <IconoMedico
                              className='mt-0.5 h-4 w-4 shrink-0 text-[#526b96]'
                              nombre='calendar'
                            />
                            <span className='leading-[14px]'>
                              {paciente.fechaCita}
                              <br />
                              {paciente.horaCita}
                            </span>
                          </span>
                        </td>
                        <td className='px-3'>
                          <EstadoBadge estado={paciente.estado} />
                        </td>
                        <td className='px-3'>
                          <div className='flex items-center justify-center gap-1 text-[#079daf]'>
                            <button
                              aria-label={`Ver ficha de ${paciente.nombre}`}
                              className='grid h-8 w-8 cursor-pointer place-items-center rounded-lg transition hover:bg-[#eaf8fa] focus-visible:outline-2 focus-visible:outline-[#08aabb]'
                              onClick={() => redirigir('/doctor/ficha')}
                              type='button'
                            >
                              <IconoMedico className='h-[18px] w-[18px]' nombre='eye' />
                            </button>
                            <button
                              aria-label={`Editar a ${paciente.nombre}`}
                              className='grid h-8 w-8 cursor-pointer place-items-center rounded-lg transition hover:bg-[#eaf8fa] focus-visible:outline-2 focus-visible:outline-[#08aabb]'
                              type='button'
                            >
                              <IconoMedico className='h-[18px] w-[18px]' nombre='edit' />
                            </button>
                            <button
                              aria-label={`Más acciones para ${paciente.nombre}`}
                              className='grid h-8 w-8 cursor-pointer place-items-center rounded-lg text-[#173478] transition hover:bg-[#eaf8fa] focus-visible:outline-2 focus-visible:outline-[#08aabb]'
                              type='button'
                            >
                              <IconoMedico className='h-[18px] w-[18px]' nombre='moreVertical' strokeWidth={2.5} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {pacientesFiltrados.length === 0 && (
                  <div className='grid min-h-36 place-items-center px-4 text-center text-[12px] font-medium text-[#617493]'>
                    No se encontraron pacientes con los filtros seleccionados.
                  </div>
                )}
              </div>

              <footer className='flex min-h-[54px] flex-wrap items-center justify-between gap-3 border-t border-[#e1e9f0] px-4 py-2'>
                <p className='text-[10px] font-medium text-[#53688d]'>
                  Mostrando {pacientesFiltrados.length === 0 ? 0 : 1} a {pacientesFiltrados.length} de{' '}
                  {TOTAL_PACIENTES} pacientes
                </p>
                <nav aria-label='Paginación de pacientes' className='flex items-center gap-2'>
                  <button
                    aria-label='Página anterior'
                    className='grid h-8 w-8 cursor-not-allowed place-items-center rounded-lg border border-[#d7e1ec] text-[#8a9bb5]'
                    disabled
                    type='button'
                  >
                    <IconoMedico className='h-4 w-4' nombre='arrowLeft' />
                  </button>
                  {[1, 2, 3].map((pagina) => (
                    <button
                      aria-current={pagina === 1 ? 'page' : undefined}
                      className={`grid h-8 w-8 cursor-pointer place-items-center rounded-lg border text-[11px] font-bold transition ${
                        pagina === 1
                          ? 'border-[#08aabb] bg-[#edfafa] text-[#079daf]'
                          : 'border-[#d7e1ec] bg-white text-[#49618b] hover:bg-[#f4fafb]'
                      }`}
                      key={pagina}
                      type='button'
                    >
                      {pagina}
                    </button>
                  ))}
                  <span aria-hidden='true' className='px-1 text-[11px] text-[#60749a]'>...</span>
                  <button
                    className='grid h-8 w-8 cursor-pointer place-items-center rounded-lg border border-[#d7e1ec] text-[11px] font-bold text-[#49618b] transition hover:bg-[#f4fafb]'
                    type='button'
                  >
                    29
                  </button>
                  <button
                    aria-label='Página siguiente'
                    className='grid h-8 w-8 cursor-pointer place-items-center rounded-lg border border-[#d7e1ec] text-[#49618b] transition hover:bg-[#f4fafb]'
                    type='button'
                  >
                    <IconoMedico className='h-4 w-4' nombre='arrowRight' />
                  </button>
                </nav>
              </footer>
            </section>
          </div>
        </main>
      </div>
    </div>
  )
}

export default GestionarPacientesPage
