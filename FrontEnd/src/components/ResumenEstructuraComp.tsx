import { useId } from 'react'

import type {
  MedicamentoConsultaVozApi,
  SeccionesConsultaVozApi,
} from '../api/medico/ConsultaVozApi'
import IconoMedico, { type NombreIconoMedico } from './IconoMedico'

export interface ContenidoResumenEstructurado {
  distintivo: string
  subtitulo: string
  titulo: string
}

interface ResumenEstructuraCompProps {
  contenido: ContenidoResumenEstructurado
  editable?: boolean
  onCambiar?: (secciones: SeccionesConsultaVozApi) => void
  secciones: SeccionesConsultaVozApi
}

type CampoTexto =
  | 'evolucionClinica'
  | 'indicacionesCasa'
  | 'motivoConsulta'
  | 'tratamientoIndicado'

const DIAS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'] as const

const CONFIGURACION_TEXTO: Array<{
  campo: CampoTexto
  icono: NombreIconoMedico
  titulo: string
}> = [
  { campo: 'motivoConsulta', icono: 'stethoscope', titulo: 'Motivo de consulta' },
  { campo: 'evolucionClinica', icono: 'chart', titulo: 'Evolución clínica' },
  { campo: 'tratamientoIndicado', icono: 'clipboard', titulo: 'Tratamiento indicado' },
]

const MEDICAMENTO_NUEVO: MedicamentoConsultaVozApi = {
  diasSemana: [],
  dosisCantidad: '',
  dosisUnidad: '',
  duracionDias: 30,
  frecuenciaTexto: '',
  horas: ['08:00'],
  indicaciones: '',
  nombre: '',
  via: 'ORAL',
}

function textoMedicamento(medicamento: MedicamentoConsultaVozApi) {
  const dosis = [medicamento.dosisCantidad, medicamento.dosisUnidad].filter(Boolean).join(' ')
  const horario = medicamento.horas.length > 0 ? `a las ${medicamento.horas.join(', ')}` : ''
  return [
    medicamento.nombre,
    dosis,
    medicamento.via ? `vía ${medicamento.via.toLowerCase()}` : '',
    medicamento.frecuenciaTexto || horario,
  ].filter(Boolean).join(' · ')
}

function ResumenEstructuraComp({
  contenido,
  editable = false,
  onCambiar,
  secciones,
}: ResumenEstructuraCompProps) {
  const tituloId = useId()

  function actualizarTexto(campo: CampoTexto, valor: string) {
    onCambiar?.({ ...secciones, [campo]: valor })
  }

  function actualizarMedicamento(indice: number, cambios: Partial<MedicamentoConsultaVozApi>) {
    onCambiar?.({
      ...secciones,
      medicacionIndicada: secciones.medicacionIndicada.map((medicamento, posicion) =>
        posicion === indice ? { ...medicamento, ...cambios } : medicamento,
      ),
    })
  }

  function eliminarMedicamento(indice: number) {
    onCambiar?.({
      ...secciones,
      medicacionIndicada: secciones.medicacionIndicada.filter((_, posicion) => posicion !== indice),
    })
  }

  function agregarMedicamento() {
    onCambiar?.({
      ...secciones,
      medicacionIndicada: [
        ...secciones.medicacionIndicada,
        { ...MEDICAMENTO_NUEVO, diasSemana: [], horas: ['08:00'] },
      ],
    })
  }

  return (
    <section
      aria-labelledby={tituloId}
      className='flex min-h-[430px] min-w-0 flex-col rounded-xl border border-[#dce5ee] bg-white p-3 shadow-[0_2px_8px_rgba(18,52,91,0.04)]'
    >
      <header className='flex flex-wrap items-start justify-between gap-2'>
        <div className='min-w-0 flex-1'>
          <h2 className='break-words text-[12px] font-extrabold text-[#0a2b70]' id={tituloId}>{contenido.titulo}</h2>
          <p className='mt-0.5 break-words text-[8px] font-medium text-[#52698e]'>{contenido.subtitulo}</p>
        </div>
        <span className='inline-flex items-center gap-1.5 rounded-lg bg-[#e8f3ff] px-3 py-1.5 text-[8px] font-extrabold text-[#2878de]'>
          <IconoMedico className='h-3.5 w-3.5' nombre='sparkles' strokeWidth={1.8} />
          {contenido.distintivo}
        </span>
      </header>

      <div className='mt-2 flex-1 overflow-x-hidden rounded-xl border border-[#e1e8ef] bg-white'>
        {CONFIGURACION_TEXTO.map((configuracion) => (
          <article className='grid grid-cols-[34px_minmax(0,1fr)] gap-2 border-b border-[#e7edf2] px-2.5 py-2' key={configuracion.campo}>
            <span className='grid h-[30px] w-[30px] place-items-center rounded-full bg-[#eaf8fa] text-[#08a8b7]'>
              <IconoMedico className='h-[18px] w-[18px]' nombre={configuracion.icono} strokeWidth={1.7} />
            </span>
            <div className='min-w-0'>
              <h3 className='text-[10px] font-extrabold leading-[13px] text-[#173879]'>{configuracion.titulo}</h3>
              {editable ? (
                <textarea
                  aria-label={configuracion.titulo}
                  className='mt-1 min-h-14 w-full resize-y rounded-md border border-[#cedce8] px-2 py-1.5 text-[9px] leading-[13px] text-[#314d7f] outline-none focus:border-[#10a8b8] focus:ring-2 focus:ring-[#10a8b8]/10'
                  onChange={(evento) => actualizarTexto(configuracion.campo, evento.target.value)}
                  placeholder={`Completa ${configuracion.titulo.toLowerCase()}...`}
                  value={secciones[configuracion.campo]}
                />
              ) : (
                <p className={`mt-0.5 whitespace-pre-line break-words text-[8px] font-medium leading-[11px] ${secciones[configuracion.campo] ? 'text-[#314d7f]' : 'italic text-[#91a1b8]'}`}>
                  {secciones[configuracion.campo] || 'Pendiente de completar con la conversación.'}
                </p>
              )}
            </div>
          </article>
        ))}

        <article className='grid grid-cols-[34px_minmax(0,1fr)] gap-2 border-b border-[#e7edf2] px-2.5 py-2'>
          <span className='grid h-[30px] w-[30px] place-items-center rounded-full bg-[#eaf8fa] text-[#08a8b7]'>
            <IconoMedico className='h-[18px] w-[18px]' nombre='pill' strokeWidth={1.7} />
          </span>
          <div className='min-w-0'>
            <div className='flex items-center justify-between gap-2'>
              <h3 className='text-[10px] font-extrabold leading-[13px] text-[#173879]'>Medicación indicada</h3>
              {editable && (
                <button className='inline-flex items-center gap-1 text-[8px] font-extrabold text-[#0697aa]' onClick={agregarMedicamento} type='button'>
                  <IconoMedico className='h-3.5 w-3.5' nombre='plusCircle' />
                  Añadir
                </button>
              )}
            </div>

            {secciones.medicacionIndicada.length === 0 ? (
              <p className='mt-1 text-[8px] italic text-[#91a1b8]'>Aún no se indicó medicación.</p>
            ) : editable ? (
              <div className='mt-1.5 space-y-2'>
                {secciones.medicacionIndicada.map((medicamento, indice) => (
                  <fieldset className='rounded-lg border border-[#dbe6ee] bg-[#fbfdff] p-2' key={`medicamento-${indice}`}>
                    <legend className='px-1 text-[8px] font-extrabold text-[#31517e]'>Medicamento {indice + 1}</legend>
                    <div className='grid gap-1.5 sm:grid-cols-2 xl:grid-cols-4'>
                      <input
                        aria-label='Nombre del medicamento'
                        className='h-8 rounded-md border border-[#d7e2eb] px-2 text-[8px] outline-none focus:border-[#10a8b8] sm:col-span-2'
                        onChange={(evento) => actualizarMedicamento(indice, { nombre: evento.target.value })}
                        placeholder='Nombre'
                        value={medicamento.nombre}
                      />
                      <input
                        aria-label='Cantidad de dosis'
                        className='h-8 min-w-0 rounded-md border border-[#d7e2eb] px-2 text-[8px] outline-none focus:border-[#10a8b8]'
                        min='0.01'
                        onChange={(evento) => actualizarMedicamento(indice, { dosisCantidad: evento.target.value })}
                        placeholder='Dosis'
                        step='0.01'
                        type='number'
                        value={medicamento.dosisCantidad}
                      />
                      <input
                        aria-label='Unidad de dosis'
                        className='h-8 min-w-0 rounded-md border border-[#d7e2eb] px-2 text-[8px] outline-none focus:border-[#10a8b8]'
                        onChange={(evento) => actualizarMedicamento(indice, { dosisUnidad: evento.target.value })}
                        placeholder='mg, ml, tableta...'
                        value={medicamento.dosisUnidad}
                      />
                      <select
                        aria-label='Vía de administración'
                        className='h-8 rounded-md border border-[#d7e2eb] bg-white px-2 text-[8px] text-[#314d7f] outline-none focus:border-[#10a8b8]'
                        onChange={(evento) => actualizarMedicamento(indice, { via: evento.target.value })}
                        value={medicamento.via}
                      >
                        <option value='ORAL'>Oral</option>
                        <option value='INTRAVENOSA'>Intravenosa</option>
                        <option value='SUBCUTANEA'>Subcutánea</option>
                        <option value='INTRAMUSCULAR'>Intramuscular</option>
                        <option value='TOPICA'>Tópica</option>
                        <option value='OTRA'>Otra</option>
                      </select>
                      <input
                        aria-label='Frecuencia'
                        className='h-8 rounded-md border border-[#d7e2eb] px-2 text-[8px] outline-none focus:border-[#10a8b8] sm:col-span-2'
                        onChange={(evento) => actualizarMedicamento(indice, { frecuenciaTexto: evento.target.value })}
                        placeholder='Frecuencia: cada 24 horas...'
                        value={medicamento.frecuenciaTexto}
                      />
                      <label className='flex h-8 items-center gap-1 rounded-md border border-[#d7e2eb] px-2 text-[8px] text-[#52698e]'>
                        <span>Días</span>
                        <input
                          className='min-w-0 flex-1 outline-none'
                          min='1'
                          onChange={(evento) => actualizarMedicamento(indice, { duracionDias: Number(evento.target.value) || 1 })}
                          type='number'
                          value={medicamento.duracionDias}
                        />
                      </label>
                    </div>

                    <div className='mt-1.5 flex flex-wrap items-center gap-1'>
                      <span className='mr-1 text-[8px] font-bold text-[#52698e]'>Días:</span>
                      {DIAS.map((dia, diaIndice) => {
                        const seleccionado = medicamento.diasSemana.includes(diaIndice)
                        return (
                          <button
                            aria-pressed={seleccionado}
                            className={`grid h-6 w-6 place-items-center rounded-full border text-[8px] font-extrabold ${seleccionado ? 'border-[#08a9b7] bg-[#08a9b7] text-white' : 'border-[#cfdce7] bg-white text-[#597091]'}`}
                            key={`${dia}-${diaIndice}`}
                            onClick={() => actualizarMedicamento(indice, {
                              diasSemana: seleccionado
                                ? medicamento.diasSemana.filter((valor) => valor !== diaIndice)
                                : [...medicamento.diasSemana, diaIndice].sort(),
                            })}
                            type='button'
                          >
                            {dia}
                          </button>
                        )
                      })}
                    </div>

                    <div className='mt-1.5 flex flex-wrap items-center gap-1.5'>
                      <span className='text-[8px] font-bold text-[#52698e]'>Horas:</span>
                      {medicamento.horas.map((hora, horaIndice) => (
                        <span className='inline-flex items-center rounded-md border border-[#d7e2eb] bg-white' key={`hora-${horaIndice}`}>
                          <input
                            aria-label={`Hora ${horaIndice + 1}`}
                            className='h-7 w-[74px] bg-transparent px-1.5 text-[8px] outline-none'
                            onChange={(evento) => actualizarMedicamento(indice, {
                              horas: medicamento.horas.map((valor, posicion) => posicion === horaIndice ? evento.target.value : valor),
                            })}
                            type='time'
                            value={hora}
                          />
                          {medicamento.horas.length > 1 && (
                            <button
                              aria-label={`Eliminar hora ${horaIndice + 1}`}
                              className='px-1 text-[#e85c64]'
                              onClick={() => actualizarMedicamento(indice, { horas: medicamento.horas.filter((_, posicion) => posicion !== horaIndice) })}
                              type='button'
                            >
                              ×
                            </button>
                          )}
                        </span>
                      ))}
                      <button
                        className='text-[8px] font-bold text-[#078fa4]'
                        onClick={() => actualizarMedicamento(indice, { horas: [...medicamento.horas, '12:00'] })}
                        type='button'
                      >
                        + hora
                      </button>
                    </div>

                    <div className='mt-1.5 flex items-center gap-1.5'>
                      <input
                        aria-label='Indicaciones del medicamento'
                        className='h-8 min-w-0 flex-1 rounded-md border border-[#d7e2eb] px-2 text-[8px] outline-none focus:border-[#10a8b8]'
                        onChange={(evento) => actualizarMedicamento(indice, { indicaciones: evento.target.value })}
                        placeholder='Indicaciones adicionales'
                        value={medicamento.indicaciones}
                      />
                      <button
                        aria-label={`Eliminar medicamento ${indice + 1}`}
                        className='grid h-8 w-8 shrink-0 place-items-center rounded-md border border-[#ffd1d4] text-[#e6505a] hover:bg-[#fff5f5]'
                        onClick={() => eliminarMedicamento(indice)}
                        type='button'
                      >
                        <IconoMedico className='h-4 w-4' nombre='trash' />
                      </button>
                    </div>
                  </fieldset>
                ))}
              </div>
            ) : (
              <ul className='mt-1 space-y-0.5 pl-3 text-[8px] font-medium leading-[11px] text-[#314d7f]'>
                {secciones.medicacionIndicada.map((medicamento, indice) => (
                  <li className='relative before:absolute before:-left-2.5 before:top-[4px] before:h-1 before:w-1 before:rounded-full before:bg-[#08aeb7]' key={`${medicamento.nombre}-${indice}`}>
                    {textoMedicamento(medicamento) || `Medicamento ${indice + 1}`}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </article>

        <article className='grid grid-cols-[34px_minmax(0,1fr)] gap-2 border-b border-[#e7edf2] px-2.5 py-2'>
          <span className='grid h-[30px] w-[30px] place-items-center rounded-full bg-[#eaf8fa] text-[#08a8b7]'>
            <IconoMedico className='h-[18px] w-[18px]' nombre='home' strokeWidth={1.7} />
          </span>
          <div className='min-w-0'>
            <h3 className='text-[10px] font-extrabold leading-[13px] text-[#173879]'>Indicaciones para casa</h3>
            {editable ? (
              <textarea
                className='mt-1 min-h-14 w-full resize-y rounded-md border border-[#cedce8] px-2 py-1.5 text-[9px] leading-[13px] text-[#314d7f] outline-none focus:border-[#10a8b8]'
                onChange={(evento) => actualizarTexto('indicacionesCasa', evento.target.value)}
                placeholder='Indicaciones para la familia...'
                value={secciones.indicacionesCasa}
              />
            ) : (
              <p className={`mt-0.5 whitespace-pre-line text-[8px] leading-[11px] ${secciones.indicacionesCasa ? 'text-[#314d7f]' : 'italic text-[#91a1b8]'}`}>
                {secciones.indicacionesCasa || 'Pendiente de completar con la conversación.'}
              </p>
            )}
          </div>
        </article>

        <article className='grid grid-cols-[34px_minmax(0,1fr)] gap-2 px-2.5 py-2'>
          <span className='grid h-[30px] w-[30px] place-items-center rounded-full bg-[#eaf8fa] text-[#08a8b7]'>
            <IconoMedico className='h-[18px] w-[18px]' nombre='calendar' strokeWidth={1.7} />
          </span>
          <div className='min-w-0'>
            <h3 className='text-[10px] font-extrabold leading-[13px] text-[#173879]'>Próximo control</h3>
            {editable ? (
              <div className='mt-1 grid gap-1.5 sm:grid-cols-[130px_95px_minmax(0,1fr)]'>
                <input
                  aria-label='Fecha del próximo control'
                  className='h-8 rounded-md border border-[#d7e2eb] px-2 text-[8px] outline-none focus:border-[#10a8b8]'
                  onChange={(evento) => onCambiar?.({ ...secciones, proximoControl: { ...secciones.proximoControl, fecha: evento.target.value } })}
                  type='date'
                  value={secciones.proximoControl.fecha}
                />
                <input
                  aria-label='Hora del próximo control'
                  className='h-8 rounded-md border border-[#d7e2eb] px-2 text-[8px] outline-none focus:border-[#10a8b8]'
                  onChange={(evento) => onCambiar?.({ ...secciones, proximoControl: { ...secciones.proximoControl, hora: evento.target.value } })}
                  type='time'
                  value={secciones.proximoControl.hora}
                />
                <input
                  aria-label='Detalle del próximo control'
                  className='h-8 min-w-0 rounded-md border border-[#d7e2eb] px-2 text-[8px] outline-none focus:border-[#10a8b8]'
                  onChange={(evento) => onCambiar?.({ ...secciones, proximoControl: { ...secciones.proximoControl, detalle: evento.target.value } })}
                  placeholder='Detalle del control'
                  value={secciones.proximoControl.detalle}
                />
              </div>
            ) : (
              <p className={`mt-0.5 text-[8px] leading-[11px] ${secciones.proximoControl.fecha ? 'text-[#314d7f]' : 'italic text-[#91a1b8]'}`}>
                {secciones.proximoControl.fecha
                  ? [secciones.proximoControl.fecha, secciones.proximoControl.hora, secciones.proximoControl.detalle].filter(Boolean).join(' · ')
                  : 'Pendiente de completar con la conversación.'}
              </p>
            )}
          </div>
        </article>
      </div>
    </section>
  )
}

export default ResumenEstructuraComp
