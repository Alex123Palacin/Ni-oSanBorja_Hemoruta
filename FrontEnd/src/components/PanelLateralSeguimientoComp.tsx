import type { ReactNode } from 'react'

import type {
  DocumentoSeguimientoPaciente,
  FiltroDetalleSeguimiento,
  ResumenPanelSeguimiento,
} from '../types/SeguimientoPaciente'
import DocumentosRecientesSeguimientoComp from './DocumentosRecientesSeguimientoComp'
import IconoMedico from './IconoMedico'
import IndicadorCircularComp from './IndicadorCircularComp'

interface TarjetaPanelProps {
  children: ReactNode
  className?: string
  titulo: string
}

function TarjetaPanel({ children, className = '', titulo }: TarjetaPanelProps) {
  return (
    <section className={`flex flex-col rounded-xl border border-[#dce5ee] bg-white p-3.5 shadow-[0_2px_9px_rgba(18,52,91,0.045)] ${className}`}>
      <h2 className='text-[11px] font-extrabold leading-[14px] text-[#102e78]'>{titulo}</h2>
      {children}
    </section>
  )
}

function SemaforoActual({ descripcion, valor }: { descripcion: string; valor: string }) {
  return (
    <div className='text-[8px] leading-[12px] text-[#52688d]'>
      <span className='font-semibold'>Semáforo actual</span>
      <strong className='mt-1.5 flex items-center gap-2 text-[12px] text-[#15953b]'>
        <span className='h-3 w-3 rounded-full bg-[#18b94a] shadow-[0_0_0_4px_rgba(24,185,74,0.1)]' />
        {valor}
      </strong>
      <span className='mt-1 block font-medium'>{descripcion}</span>
    </div>
  )
}

function TarjetaIndicaciones() {
  return (
    <TarjetaPanel className='min-h-[150px]' titulo='Indicaciones médicas vigentes'>
      <div className='mt-3 flex gap-2.5'>
        <span className='grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#dff5f7] text-[#139cb3]'>
          <IconoMedico className='h-5 w-5' nombre='clipboard' />
        </span>
        <p className='text-[9px] font-semibold leading-[14px] text-[#53688d]'>
          Recomendación registrada por el médico mediante nota de voz en la historia clínica.
        </p>
      </div>
      <div className='mt-2 flex gap-2.5 rounded-lg bg-[#f3f8fb] p-2'>
        <IconoMedico className='h-5 w-5 shrink-0 text-[#139cb3]' nombre='volume' />
        <p className='text-[8px] font-semibold leading-[12px] text-[#53688d]'>
          Fuente: Historia clínica
          <br />
          <span className='font-medium'>(no proviene de mensajes directos)</span>
        </p>
      </div>
    </TarjetaPanel>
  )
}

function TarjetaAdherenciaSintomas({ resumen }: { resumen: ResumenPanelSeguimiento }) {
  return (
    <TarjetaPanel className='min-h-[166px]' titulo='Adherencia y síntomas'>
      <div className='mt-2 grid grid-cols-2 items-center gap-3'>
        <div className='border-r border-[#e1e9f0] pr-3'>
          <IndicadorCircularComp
            detalle='(últimos 7 días)'
            etiqueta='Adherencia'
            valor={resumen.adherenciaGeneral}
          />
        </div>
        <SemaforoActual descripcion={resumen.semaforoDescripcion} valor={resumen.semaforo} />
      </div>
      <div className='mt-2 flex items-center gap-2 rounded-lg bg-[#f3f8fb] p-2'>
        <span className='grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#fff0df] text-[#f28a13]'>
          <IconoMedico className='h-5 w-5' nombre='smile' />
        </span>
        <p className='text-[8px] leading-[12px] text-[#53688d]'>
          Último síntoma reportado
          <strong className='block text-[9px] text-[#173777]'>{resumen.sintomaReciente.descripcion}</strong>
        </p>
      </div>
    </TarjetaPanel>
  )
}

function TarjetaMedicacion({ onVerHistorial, resumen }: { onVerHistorial: () => void; resumen: ResumenPanelSeguimiento }) {
  return (
    <TarjetaPanel className='min-h-[220px]' titulo='Medicación'>
      <div className='mt-3 grid grid-cols-[94px_minmax(0,1fr)] items-center gap-3'>
        <div className='border-r border-[#e1e9f0] pr-3'>
          <IndicadorCircularComp
            detalle='(últimos 7 días)'
            etiqueta='Adherencia a la medicación'
            valor={resumen.adherenciaMedicacion}
          />
        </div>
        <div className='text-[8px] leading-[13px] text-[#52688d]'>
          <span className='font-semibold'>Última dosis omitida</span>
          <strong className='mt-1.5 flex items-center gap-1.5 text-[10px] text-[#173777]'>
            <IconoMedico className='h-4 w-4 text-[#f14c59]' nombre='calendar' />
            {resumen.dosisOmitida.fecha}
          </strong>
          <span className='mt-1 block font-bold'>{resumen.dosisOmitida.medicamento}</span>
          <span>{resumen.dosisOmitida.hora}</span>
        </div>
      </div>
      <button
        className='mt-auto flex h-8 w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-[#08aabb] text-[9px] font-bold text-[#26709e] transition hover:bg-[#effafb] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#08aabb]'
        onClick={onVerHistorial}
        type='button'
      >
        <IconoMedico className='h-4 w-4' nombre='clock' />
        Ver historial
      </button>
    </TarjetaPanel>
  )
}

function TarjetaSintomasBreve({ resumen }: { resumen: ResumenPanelSeguimiento }) {
  return (
    <TarjetaPanel className='min-h-[105px]' titulo='Síntomas'>
      <div className='mt-3 flex items-center gap-3'>
        <span className='grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#ddf6ed] text-[#10a87d]'>
          <IconoMedico className='h-6 w-6' nombre='smile' />
        </span>
        <SemaforoActual descripcion={resumen.semaforoDescripcion} valor={resumen.semaforo} />
        <IconoMedico className='ml-auto h-4 w-4 text-[#526b96]' nombre='arrowRight' />
      </div>
    </TarjetaPanel>
  )
}

function TarjetaSintomasDetallada({ resumen }: { resumen: ResumenPanelSeguimiento }) {
  const sintoma = resumen.sintomaReciente

  return (
    <TarjetaPanel className='min-h-[245px]' titulo='Síntomas'>
      <div className='mt-3 flex items-center gap-3'>
        <span className='grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[#fff0df] text-[#f28a13]'>
          <IconoMedico className='h-7 w-7' nombre='smile' />
        </span>
        <p className='text-[8px] leading-[13px] text-[#52688d]'>
          Último síntoma reportado
          <strong className='block text-[10px] text-[#173777]'>{sintoma.descripcion}</strong>
          <span className='font-semibold'>{sintoma.fecha} {sintoma.hora}</span>
        </p>
      </div>
      <div className='mt-3 rounded-lg bg-[#f3f8fb] p-2'>
        <SemaforoActual descripcion={resumen.semaforoDescripcion} valor={resumen.semaforo} />
      </div>
      <div className='mt-3'>
        <p className='text-[8px] font-bold text-[#53688d]'>Resumen de síntomas (últimos 7 días)</p>
        <dl className='mt-2 grid grid-cols-3 divide-x divide-[#e1e9f0] text-center'>
          <div className='px-1'>
            <dt className='text-[8px] text-[#607395]'>Total reportes</dt>
            <dd className='mt-1 text-[12px] font-extrabold text-[#173777]'>{sintoma.totalReportes}</dd>
          </div>
          <div className='px-1'>
            <dt className='text-[8px] font-bold text-[#ef3f4b]'>Con alerta</dt>
            <dd className='mt-1 text-[12px] font-extrabold text-[#ef3f4b]'>{sintoma.conAlerta}</dd>
          </div>
          <div className='px-1'>
            <dt className='text-[8px] text-[#607395]'>Sin síntomas</dt>
            <dd className='mt-1 text-[12px] font-extrabold text-[#173777]'>{sintoma.sinSintomas}</dd>
          </div>
        </dl>
      </div>
    </TarjetaPanel>
  )
}

function TarjetaMedicacionBreve({ resumen }: { resumen: ResumenPanelSeguimiento }) {
  return (
    <TarjetaPanel className='min-h-[90px]' titulo='Medicación'>
      <div className='mt-3 flex items-center gap-3'>
        <span className='grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#e8f5fb] text-[#1595b5]'>
          <IconoMedico className='h-6 w-6' nombre='pill' />
        </span>
        <p className='min-w-0 flex-1 text-[8px] leading-[12px] text-[#52688d]'>
          Última medicación registrada
          <strong className='block text-[9px] text-[#173777]'>{resumen.medicamentoReciente.nombre}</strong>
          <span>{resumen.medicamentoReciente.fecha} {resumen.medicamentoReciente.hora}</span>
        </p>
        <IconoMedico className='h-4 w-4 text-[#526b96]' nombre='arrowRight' />
      </div>
    </TarjetaPanel>
  )
}

function TarjetaTratamiento({ indicaciones }: { indicaciones: string[] }) {
  return (
    <TarjetaPanel className='min-h-[174px]' titulo='Tratamiento recomendado'>
      <div className='mt-3 flex gap-2.5'>
        <span className='grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#dff5f7] text-[#139cb3]'>
          <IconoMedico className='h-5 w-5' nombre='clipboard' />
        </span>
        <p className='text-[9px] font-semibold leading-[13px] text-[#53688d]'>
          Extraído de la historia clínica
          <span className='block font-medium'>(nota de voz del médico)</span>
        </p>
      </div>
      <ul className='mt-2 list-disc rounded-lg bg-[#f3f8fb] py-2 pl-6 pr-2 text-[8px] font-semibold leading-[12px] text-[#405881]'>
        {indicaciones.map((indicacion) => <li key={indicacion}>{indicacion}</li>)}
      </ul>
    </TarjetaPanel>
  )
}

function TarjetaUltimoDocumento({ documento }: { documento: DocumentoSeguimientoPaciente }) {
  return (
    <TarjetaPanel className='min-h-[125px]' titulo='Documentos'>
      <div className='mt-3 flex items-center gap-3'>
        <span className='grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[#f0eaff] text-[#7258de]'>
          <IconoMedico className='h-7 w-7' nombre='file' />
        </span>
        <div className='min-w-0 text-[8px] leading-[13px] text-[#52688d]'>
          <span>Último documento recibido:</span>
          <strong className='block truncate text-[11px] text-[#173777]'>{documento.nombre}</strong>
          <div className='mt-1 flex flex-wrap items-center gap-2'>
            <span className='flex items-center gap-1 font-bold'>
              <IconoMedico className='h-3.5 w-3.5' nombre='calendar' />
              {documento.fecha}
            </span>
            <span className='flex items-center gap-1 rounded-full bg-[#e6f8eb] px-2 py-1 font-bold text-[#17a950]'>
              <IconoMedico className='h-3.5 w-3.5' nombre='whatsapp' />
              {documento.origen}
            </span>
          </div>
        </div>
      </div>
    </TarjetaPanel>
  )
}

function TarjetaResumenDocumental({ resumen }: { resumen: ResumenPanelSeguimiento['resumenDocumental'] }) {
  const items = [
    { color: 'text-[#277bd9]', fondo: 'bg-[#e8f3ff]', icono: 'file' as const, texto: 'Total documentos', valor: resumen.total },
    { color: 'text-[#15953b]', fondo: 'bg-[#e5f8ea]', icono: 'check' as const, texto: 'Revisados', valor: resumen.revisados },
    { color: 'text-[#277bd9]', fondo: 'bg-[#e8f3ff]', icono: 'clock' as const, texto: 'En seguimiento', valor: resumen.enSeguimiento },
    { color: 'text-[#e23d49]', fondo: 'bg-[#ffe9e9]', icono: 'alertTriangle' as const, texto: 'Alertas', valor: resumen.alertas },
  ]

  return (
    <TarjetaPanel className='min-h-[132px]' titulo='Resumen documental'>
      <dl className='mt-3 grid grid-cols-4 divide-x divide-[#e1e9f0] text-center'>
        {items.map((item) => (
          <div className='px-1' key={item.texto}>
            <span className={`mx-auto grid h-8 w-8 place-items-center rounded-full ${item.fondo} ${item.color}`}>
              <IconoMedico className='h-4 w-4' nombre={item.icono} />
            </span>
            <dd className='mt-1 text-[11px] font-extrabold text-[#173777]'>{item.valor}</dd>
            <dt className='text-[7px] font-semibold leading-[10px] text-[#607395]'>{item.texto}</dt>
          </div>
        ))}
      </dl>
    </TarjetaPanel>
  )
}

interface PanelLateralSeguimientoCompProps {
  filtroActivo: FiltroDetalleSeguimiento
  onRegistrarAccion: () => void
  onVerDocumento: (documento: DocumentoSeguimientoPaciente) => void
  onVerDocumentos: () => void
  onVerFicha: () => void
  onVerHistorial: () => void
  resumen: ResumenPanelSeguimiento
}

function PanelLateralSeguimientoComp({
  filtroActivo,
  onRegistrarAccion,
  onVerDocumento,
  onVerDocumentos,
  onVerFicha,
  onVerHistorial,
  resumen,
}: PanelLateralSeguimientoCompProps) {
  const esDocumento = filtroActivo === 'documento'
  const documentosMostrados = esDocumento ? resumen.documentos : resumen.documentosRecientes
  const ultimoDocumento = resumen.documentos[0]

  return (
    <aside className='grid gap-3 md:grid-cols-2 xl:block xl:space-y-3'>
      {filtroActivo === 'todos' && (
        <>
          <TarjetaIndicaciones />
          <TarjetaAdherenciaSintomas resumen={resumen} />
        </>
      )}

      {filtroActivo === 'medicacion' && (
        <>
          <TarjetaMedicacion onVerHistorial={onVerHistorial} resumen={resumen} />
          <TarjetaSintomasBreve resumen={resumen} />
        </>
      )}

      {filtroActivo === 'sintomas' && (
        <>
          <TarjetaSintomasDetallada resumen={resumen} />
          <TarjetaMedicacionBreve resumen={resumen} />
        </>
      )}

      {filtroActivo === 'tratamiento' && (
        <>
          <TarjetaTratamiento indicaciones={resumen.indicacionesTratamiento} />
          <TarjetaAdherenciaSintomas resumen={resumen} />
        </>
      )}

      {esDocumento && (
        <>
          {ultimoDocumento ? (
            <TarjetaUltimoDocumento documento={ultimoDocumento} />
          ) : (
            <TarjetaPanel className='min-h-[125px]' titulo='Documentos'>
              <p className='mt-4 text-[9px] font-medium text-[#607395]'>Aún no hay documentos recibidos.</p>
            </TarjetaPanel>
          )}
          <TarjetaResumenDocumental resumen={resumen.resumenDocumental} />
        </>
      )}

      <DocumentosRecientesSeguimientoComp
        documentos={documentosMostrados}
        limite={esDocumento ? 3 : 2}
        onVerDocumento={onVerDocumento}
        onVerTodos={onVerDocumentos}
      />

      <div className='min-h-[88px] space-y-2'>
        <button
          className='flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#08aabc] to-[#078da9] text-[11px] font-bold text-white shadow-sm transition hover:brightness-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#08aabb]'
          onClick={onVerFicha}
          type='button'
        >
          <IconoMedico className='h-5 w-5' nombre='file' />
          Ver ficha del paciente
        </button>
        <button
          className='flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-[#08aabb] bg-white text-[11px] font-bold text-[#1885a8] transition hover:bg-[#effafb] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#08aabb]'
          onClick={onRegistrarAccion}
          type='button'
        >
          <IconoMedico className='h-5 w-5' nombre='plusCircle' />
          Registrar acción médica
        </button>
      </div>
    </aside>
  )
}

export default PanelLateralSeguimientoComp
