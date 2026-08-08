import { useState } from 'react'

import fondoPaciente from '../../assets/FondoNiño5.png'
import HeaderDoctorMedicoComp from '../../components/HeaderDoctorMedicoComp'
import IconoMedico, { type NombreIconoMedico } from '../../components/IconoMedico'
import MenuMedicoComp from '../../components/MenuMedicoComp'
import ResultadosDocPaciComp from '../../components/ResultadosDocPaciComp'
import type { EpisodioHistorialPaciente, FiltroHistorial } from '../../types/HistoriaPaciente'

const DOCTORA = {
  especialidad: 'Hematología Pediátrica',
  nombre: 'Dra. Valeria Ruiz',
}

const PACIENTE = {
  diagnostico: 'Leucemia linfoblástica aguda (LLA)',
  edad: 8,
  historiaClinica: 'HC-2024-01568',
  imagen: fondoPaciente,
  nombre: 'Mateo Gabriel Flores',
}

interface OpcionFiltro {
  icono: NombreIconoMedico
  texto: string
  valor: FiltroHistorial
}

const FILTROS: OpcionFiltro[] = [
  { icono: 'list', texto: 'Todo', valor: 'todo' },
  { icono: 'stethoscope', texto: 'Consultas', valor: 'consultas' },
  { icono: 'activity', texto: 'Tratamientos', valor: 'tratamientos' },
  { icono: 'pill', texto: 'Medicación', valor: 'medicacion' },
  { icono: 'file', texto: 'Documentos', valor: 'documentos' },
]

const EPISODIO_BASE: Omit<EpisodioHistorialPaciente, 'id'> = {
  descripcion: 'Valoración inicial por hematología pediátrica.',
  detalles: [
    {
      descripcion: 'Inicio de tratamiento según protocolo.',
      fecha: '22/04/2024',
      hora: '11:20 a. m.',
      id: 'tratamiento-inicial',
      lineas: [
        'Tratamiento: Prednisona 10 mg cada 24 horas.',
        'Vincristina según protocolo.',
        'Medicación: Omeprazol 20 mg cada 24 horas.',
        'Ácido fólico 5 mg cada 24 horas.',
      ],
      tipo: 'tratamiento',
      titulo: 'Tratamiento',
    },
    {
      descripcion: 'Ajuste de tratamiento por toxicidad leve.',
      fecha: '05/05/2024',
      hora: '09:45 a. m.',
      id: 'medicacion-ajustada',
      lineas: [
        'Medicación ajustada: Prednisona 10 mg cada 24 h.',
        'Omeprazol 20 mg cada 24 h. Ácido fólico 5 mg cada 24 h.',
      ],
      tipo: 'medicacion',
      titulo: 'Medicación',
    },
  ],
  especialidad: 'Hematología Pediátrica',
  estado: 'Completado',
  fecha: '12/04/2024',
  hora: '09:15 a. m.',
  medico: 'Dra. Valeria Ruiz',
  titulo: 'Consulta inicial',
}

const EPISODIOS_HISTORIAL: EpisodioHistorialPaciente[] = ['consulta-inicial-1', 'consulta-inicial-2'].map(
  (id) => ({ ...EPISODIO_BASE, id }),
)

function HistoriaPacientePage() {
  const [filtroActivo, setFiltroActivo] = useState<FiltroHistorial>('todo')

  return (
    <div className='flex min-h-screen bg-[#fbfdff]'>
      <MenuMedicoComp />

      <div className='min-w-0 flex-1'>
        <HeaderDoctorMedicoComp especialidad={DOCTORA.especialidad} nombre={DOCTORA.nombre} />

        <main className='min-h-[calc(100vh-46px)] px-4 py-4 sm:px-6 xl:px-7'>
          <div className='mx-auto w-full max-w-[1220px]'>
            <header className='px-1'>
              <h1 className='text-[26px] font-extrabold tracking-[-0.03em] text-[#0a2b79]'>Historial clínico</h1>
              <p className='mt-0.5 text-[10px] font-medium text-[#50658a]'>
                Registro cronológico de consultas, tratamientos y medicación del paciente.
              </p>
            </header>

            <section className='mt-3 grid items-center gap-3 rounded-xl border border-[#dce5ee] bg-white px-4 py-1.5 shadow-[0_2px_8px_rgba(18,52,91,0.05)] sm:grid-cols-[56px_minmax(220px,1fr)] lg:grid-cols-[56px_minmax(250px,1fr)_minmax(300px,1.35fr)]'>
              <div className='relative mx-auto h-[52px] w-[52px] overflow-hidden rounded-full border-4 border-[#e1f4f5] bg-[#e6f7f5] sm:mx-0'>
                <img
                  alt={`Foto de ${PACIENTE.nombre}`}
                  className='absolute left-1/2 top-[-18%] h-[185%] w-[185%] max-w-none -translate-x-1/2 object-cover'
                  draggable={false}
                  src={PACIENTE.imagen}
                />
              </div>

              <div className='min-w-0 text-center sm:text-left'>
                <h2 className='truncate text-[16px] font-extrabold tracking-[-0.02em] text-[#092a76]'>
                  {PACIENTE.nombre}
                </h2>
                <div className='mt-1.5 flex flex-wrap items-center justify-center gap-x-5 gap-y-1 text-[9px] font-semibold text-[#536a91] sm:justify-start'>
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

              <div className='border-t border-[#e3eaf1] pt-3 text-center sm:col-span-2 lg:col-span-1 lg:border-l lg:border-t-0 lg:py-1 lg:pl-5 lg:text-left'>
                <p className='text-[8px] font-semibold text-[#53698e]'>Diagnóstico principal</p>
                <p className='mt-1 text-[9px] font-extrabold text-[#153579]'>{PACIENTE.diagnostico}</p>
              </div>
            </section>

            <nav aria-label='Filtrar historial clínico' className='mt-2 overflow-x-auto pb-1'>
              <div className='flex min-w-max items-center gap-2'>
                {FILTROS.map((filtro) => {
                  const activo = filtroActivo === filtro.valor

                  return (
                    <button
                      aria-pressed={activo}
                      className={`flex h-7 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-full border px-4 text-[9px] font-bold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#08aabb] ${
                        activo
                          ? 'border-[#08a7b8] bg-gradient-to-r from-[#08aabc] to-[#078da9] text-white shadow-sm'
                          : 'border-[#dbe5ee] bg-white text-[#28477f] hover:border-[#8dd5dc] hover:bg-[#f3fbfc]'
                      }`}
                      key={filtro.valor}
                      onClick={() => setFiltroActivo(filtro.valor)}
                      type='button'
                    >
                      <IconoMedico className='h-4 w-4' nombre={filtro.icono} strokeWidth={1.9} />
                      {filtro.texto}
                    </button>
                  )
                })}
              </div>
            </nav>

            <ResultadosDocPaciComp episodios={EPISODIOS_HISTORIAL} filtro={filtroActivo} />
          </div>
        </main>
      </div>
    </div>
  )
}

export default HistoriaPacientePage
