import { useMemo, useState } from 'react'

import HeaderDoctorMedicoComp from '../../components/HeaderDoctorMedicoComp'
import IconoMedico from '../../components/IconoMedico'
import MenuMedicoComp from '../../components/MenuMedicoComp'
import useRedirrecion from '../../hooks/Redirrecion'
import { BtnCrear } from '../../ui/BotonUi'
import ComboBoxUI, { type OpcionComboBox } from '../../ui/ComboBoxUI'

type EstadoPaciente = 'Evaluado' | 'Hoy' | 'Programado'
type TipoBusqueda = 'dni' | 'historia' | 'nombre'

interface Paciente {
  avatar: string
  colorAvatar: string
  diagnostico: string
  dni: string
  edad: number
  estado: EstadoPaciente
  fechaCita: string
  historiaClinica: string
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
    historiaClinica: 'HC-2025-00142',
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
    historiaClinica: 'HC-2025-00119',
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
    historiaClinica: 'HC-2025-00097',
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
    historiaClinica: 'HC-2025-00082',
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
    historiaClinica: 'HC-2025-00064',
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

const ESTILOS_ESTADO: Record<EstadoPaciente, { fondo: string; punto: string; texto: string }> = {
  Evaluado: { fondo: 'bg-[#e8f2ff]', punto: 'bg-[#2385f4]', texto: 'text-[#1674dc]' },
  Hoy: { fondo: 'bg-[#e4f8e7]', punto: 'bg-[#27bd42]', texto: 'text-[#15952d]' },
  Programado: { fondo: 'bg-[#fff0df]', punto: 'bg-[#ff8a1f]', texto: 'text-[#f1780d]' },
}

interface EstadoBadgeProps {
  estado: EstadoPaciente
}

function EstadoBadge({ estado }: EstadoBadgeProps) {
  const estilo = ESTILOS_ESTADO[estado]

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[9px] font-bold ${estilo.fondo} ${estilo.texto}`}>
      <span className={`h-2 w-2 rounded-full ${estilo.punto}`} />
      {estado}
    </span>
  )
}

function GestionarPacientesPage() {
  const [busqueda, setBusqueda] = useState('')
  const [diagnostico, setDiagnostico] = useState('todos')
  const [estado, setEstado] = useState('todos')
  const [tipoBusqueda, setTipoBusqueda] = useState<TipoBusqueda>('dni')
  const redirigir = useRedirrecion()

  const pacientesFiltrados = useMemo(() => {
    const termino = busqueda.trim().toLocaleLowerCase('es')

    return PACIENTES.filter((paciente) => {
      const valorBusqueda = {
        dni: paciente.dni,
        historia: paciente.historiaClinica,
        nombre: paciente.nombre,
      }[tipoBusqueda]
      const coincideBusqueda = !termino || valorBusqueda.toLocaleLowerCase('es').includes(termino)
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
    <div className='flex min-h-screen bg-[#fbfdff]'>
      <MenuMedicoComp />

      <div className='min-w-0 flex-1'>
        <HeaderDoctorMedicoComp especialidad={DOCTORA.especialidad} nombre={DOCTORA.nombre} />

        <main className='min-h-[calc(100vh-46px)] px-4 py-4 sm:px-6 xl:px-7'>
          <div className='mx-auto w-full max-w-[1220px]'>
            <div className='flex flex-wrap items-start justify-between gap-4 px-1'>
              <div>
                <h1 className='text-[28px] font-extrabold tracking-[-0.03em] text-[#0a2b79]'>Pacientes</h1>
                <p className='mt-0.5 text-[11px] font-medium text-[#50658a]'>
                  Gestiona y consulta la ficha longitudinal de los pacientes hematológicos pediátricos.
                </p>
              </div>
              <BtnCrear ruta='/doctor/nuevoRegistro' tamano='compacto' texto='Nuevo paciente' />
            </div>

            <section className='mt-4 flex h-[92px] w-[270px] max-w-full items-center gap-4 rounded-xl border border-[#d8e8ef] bg-gradient-to-r from-[#f7fcfd] to-[#f5fbfd] px-4 shadow-[0_1px_3px_rgba(18,52,91,0.03)]'>
              <span className='grid h-14 w-14 shrink-0 place-items-center rounded-full bg-[#ddf4f5] text-[#079daf]'>
                <IconoMedico className='h-8 w-8' nombre='users' strokeWidth={2.1} />
              </span>
              <div>
                <span className='block text-[10px] font-bold text-[#079daf]'>Pacientes registrados</span>
                <strong className='block text-[28px] font-extrabold leading-8 text-[#0a2b79]'>{TOTAL_PACIENTES}</strong>
                <span className='text-[8px] font-medium text-[#50658a]'>Total de pacientes en el sistema</span>
              </div>
            </section>

            <section className='mt-3 rounded-xl border border-[#dce5ee] bg-white p-3 shadow-[0_2px_9px_rgba(18,52,91,0.06)]'>
              <div className='grid items-end gap-3 md:grid-cols-[minmax(250px,1.7fr)_minmax(150px,0.9fr)_minmax(145px,0.85fr)_120px]'>
                <label className='block' htmlFor='busquedaPaciente'>
                  <span className='mb-1 block text-[9px] font-bold text-[#43577d]'>Búsqueda rápida</span>
                  <span className='relative block'>
                    <IconoMedico
                      className='pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#60749a]'
                      nombre='search'
                    />
                    <input
                      className='h-9 w-full rounded-lg border border-[#d3dfeb] bg-white pl-9 pr-3 text-[10px] font-medium text-[#183775] outline-none transition placeholder:text-[#627698] focus:border-[#08aabb] focus:ring-3 focus:ring-[#08aabb]/10'
                      id='busquedaPaciente'
                      onChange={(event) => setBusqueda(event.target.value)}
                      placeholder='Buscar por DNI, historia clínica o nombre...'
                      type='search'
                      value={busqueda}
                    />
                  </span>
                </label>

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
                  className='flex h-9 cursor-pointer items-center justify-center gap-2 rounded-lg border border-[#08aabb] bg-white px-3 text-[9px] font-bold text-[#079daf] transition hover:bg-[#f0fbfc] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#08aabb]'
                  onClick={limpiarFiltros}
                  type='button'
                >
                  <IconoMedico className='h-4 w-4' nombre='filter' />
                  Limpiar filtros
                </button>
              </div>

              <fieldset className='mt-3 flex flex-wrap items-center gap-x-5 gap-y-2'>
                <legend className='sr-only'>Búsqueda avanzada por</legend>
                <span className='text-[8px] font-semibold text-[#5a6e91]'>Búsqueda avanzada por</span>
                {([
                  ['dni', 'DNI'],
                  ['historia', 'Historia clínica'],
                  ['nombre', 'Nombre del paciente'],
                ] as const).map(([valor, etiqueta]) => (
                  <label className='flex cursor-pointer items-center gap-1.5 text-[8px] font-medium text-[#4c6186]' key={valor}>
                    <input
                      checked={tipoBusqueda === valor}
                      className='h-3 w-3 accent-[#08aabb]'
                      name='tipoBusqueda'
                      onChange={() => setTipoBusqueda(valor)}
                      type='radio'
                    />
                    {etiqueta}
                  </label>
                ))}
              </fieldset>
            </section>

            <section className='mt-2 overflow-hidden rounded-xl border border-[#dce5ee] bg-white shadow-[0_2px_9px_rgba(18,52,91,0.07)]'>
              <div className='overflow-x-auto'>
                <table className='w-full min-w-[850px] table-fixed border-collapse'>
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
                    <tr className='border-b border-[#dce5ee] text-left text-[9px] font-extrabold text-[#078fa6]'>
                      {['Paciente', 'DNI', 'Tutor responsable', 'Diagnóstico principal', 'Próxima cita', 'Estado', 'Acciones'].map(
                        (columna) => (
                          <th className='h-8 px-3' key={columna} scope='col'>
                            <span className='flex items-center gap-1'>
                              {columna}
                              {columna !== 'Acciones' && (
                                <IconoMedico className='h-3 w-3 text-[#7390ae]' nombre='chevronDown' />
                              )}
                            </span>
                          </th>
                        ),
                      )}
                    </tr>
                  </thead>
                  <tbody className='divide-y divide-[#e3eaf1]'>
                    {pacientesFiltrados.map((paciente) => (
                      <tr className='h-[54px] text-[9px] text-[#314a78] transition hover:bg-[#f8fcfd]' key={paciente.dni}>
                        <td className='px-3'>
                          <div className='flex items-center gap-2'>
                            <span
                              className={`grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white text-[22px] shadow-sm ${paciente.colorAvatar}`}
                            >
                              <span aria-hidden='true'>{paciente.avatar}</span>
                            </span>
                            <span className='min-w-0'>
                              <strong className='block truncate text-[9px] font-extrabold text-[#153679]'>{paciente.nombre}</strong>
                              <span className='text-[8px] text-[#657797]'>{paciente.edad} años</span>
                            </span>
                          </div>
                        </td>
                        <td className='px-3 font-semibold'>{paciente.dni}</td>
                        <td className='px-3'>
                          <span className='block font-medium'>{paciente.tutor}</span>
                          <span className='text-[8px] text-[#71819d]'>{paciente.parentescoTutor}</span>
                        </td>
                        <td className='px-3 font-medium leading-[13px]'>{paciente.diagnostico}</td>
                        <td className='px-3'>
                          <span className='flex items-start gap-1.5'>
                            <IconoMedico className='mt-0.5 h-3.5 w-3.5 shrink-0 text-[#526b96]' nombre='calendar' />
                            <span>
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
                          <div className='flex items-center justify-end gap-2 text-[#079daf]'>
                            <button
                              aria-label={`Ver ficha de ${paciente.nombre}`}
                              className='cursor-pointer rounded p-1 transition hover:bg-[#eaf8fa] focus-visible:outline-2 focus-visible:outline-[#08aabb]'
                              onClick={() => redirigir('/doctor/ficha')}
                              type='button'
                            >
                              <IconoMedico className='h-4 w-4' nombre='eye' />
                            </button>
                            <button
                              aria-label={`Editar a ${paciente.nombre}`}
                              className='cursor-pointer rounded p-1 transition hover:bg-[#eaf8fa] focus-visible:outline-2 focus-visible:outline-[#08aabb]'
                              type='button'
                            >
                              <IconoMedico className='h-4 w-4' nombre='edit' />
                            </button>
                            <button
                              aria-label={`Más acciones para ${paciente.nombre}`}
                              className='cursor-pointer rounded p-1 text-[#173478] transition hover:bg-[#eaf8fa] focus-visible:outline-2 focus-visible:outline-[#08aabb]'
                              type='button'
                            >
                              <IconoMedico className='h-4 w-4' nombre='moreVertical' strokeWidth={2.5} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {pacientesFiltrados.length === 0 && (
                  <div className='grid min-h-32 place-items-center px-4 text-center text-[11px] font-medium text-[#617493]'>
                    No se encontraron pacientes con los filtros seleccionados.
                  </div>
                )}
              </div>

              <footer className='flex flex-wrap items-center justify-between gap-3 border-t border-[#e1e9f0] px-3 py-2'>
                <p className='text-[9px] font-medium text-[#53688d]'>
                  Mostrando {pacientesFiltrados.length === 0 ? 0 : 1} a {pacientesFiltrados.length} de{' '}
                  {TOTAL_PACIENTES} pacientes
                </p>
                <nav aria-label='Paginación de pacientes' className='flex items-center gap-2'>
                  <button
                    aria-label='Página anterior'
                    className='grid h-8 w-8 cursor-pointer place-items-center rounded-lg border border-[#d7e1ec] text-[#49618b] transition hover:bg-[#f4fafb]'
                    type='button'
                  >
                    <IconoMedico className='h-4 w-4' nombre='arrowLeft' />
                  </button>
                  {[1, 2, 3].map((pagina) => (
                    <button
                      aria-current={pagina === 1 ? 'page' : undefined}
                      className={`grid h-8 w-8 cursor-pointer place-items-center rounded-lg border text-[10px] font-bold transition ${
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
                  <span className='px-1 text-[10px] text-[#60749a]'>...</span>
                  <button
                    className='grid h-8 w-8 cursor-pointer place-items-center rounded-lg border border-[#d7e1ec] text-[10px] font-bold text-[#49618b] transition hover:bg-[#f4fafb]'
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
