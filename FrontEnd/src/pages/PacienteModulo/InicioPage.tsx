import { useState } from 'react'
import FondoNino from '../../assets/FondoNiño5.png'
import logoHemoRuta from '../../assets/iconoHemoRutaNoBg.png'
import AdaptadoMobil from '../../components/pacienteMcomp/AdaptadoMobil'
import InicioCabeceraPacienteComp from '../../components/pacienteMcomp/InicioCabeceraPacienteComp'
import InicioDatosPersonalesComp from '../../components/pacienteMcomp/InicioDatosPersonalesComp'
import InicioDatosTutorComp from '../../components/pacienteMcomp/InicioDatosTutorComp'
import InicioPerfilPacienteComp from '../../components/pacienteMcomp/InicioPerfilPacienteComp'
import InicioRegistrarCitasPacienteComp from '../../components/pacienteMcomp/InicioRegistrarCitasPacienteComp'
import InicioResumenPacienteComp, {
  type AccesoPerfilInicioPaciente,
  type AccionRapidaInicioPaciente,
  type IdAccesoPerfilInicio,
  type IdAccionRapidaInicio,
} from '../../components/pacienteMcomp/InicioResumenPacienteComp'
import MenuPaciente from '../../components/pacienteMcomp/MenuPaciente'
import useDatosInicioPacienteApi from '../../hooks/useDatosInicioPacienteApi'
import useAuth from '../../auth/useAuth'
import GestionCuentaComp from '../../components/GestionCuentaComp'
import useInicioPaciente from '../../hooks/useInicioPaciente'
import useRedirrecion from '../../hooks/Redirrecion'
import type { InicioPacienteApi } from '../../api/paciente/PacienteApi'
import type {
  DatosPersonalesInicioPaciente,
  DatosTutorInicioPaciente,
  OpcionCampoInicioPaciente,
  PerfilInicioPaciente,
  ProximaCitaInicioPaciente,
  RegistroCitaInicioPaciente,
} from '../../types/InicioPaciente'
import { formatearEdadPaciente } from '../../utils/paciente'

const PACIENTE_SIN_CARGAR: PerfilInicioPaciente = {
  edad: 'Edad por completar',
  estado: 'Pendiente',
  historiaClinica: 'Sin asignar',
  id: 'sin-paciente',
  imagen: FondoNino,
  nombre: 'Paciente',
}

const DATOS_PERSONALES_INICIALES: DatosPersonalesInicioPaciente = {
  apellidos: '',
  diagnosticoPrincipal: '',
  dni: '',
  fechaNacimiento: '',
  grupoSanguineo: '',
  historiaClinica: '',
  nombres: '',
  procedencia: '',
  sexo: '',
}

const DATOS_TUTOR_INICIALES: DatosTutorInicioPaciente = {
  correo: '',
  direccion: '',
  distrito: '',
  dni: '',
  horarioContacto: '',
  nombreCompleto: '',
  parentesco: '',
  personaAutorizada: '',
  preferenciaContacto: 'whatsapp',
  telefonoAlterno: '',
  telefonoEmergencia: '',
  telefonoPrincipal: '',
}

const REGISTRO_CITA_INICIAL: RegistroCitaInicioPaciente = {
  fecha: '',
  hora: '',
  medico: '',
}

const CITA_SIN_REGISTRAR: ProximaCitaInicioPaciente = {
  estado: 'Sin cita',
  fecha: 'Fecha pendiente',
  fechaIso: '',
  hora: 'Hora pendiente',
  horaIso: '',
}

const SEXOS: readonly OpcionCampoInicioPaciente[] = [
  { texto: 'Masculino', valor: 'masculino' },
  { texto: 'Femenino', valor: 'femenino' },
]

const DIAGNOSTICOS: readonly OpcionCampoInicioPaciente[] = [
  { texto: 'Leucemia linfoblástica aguda (LLA)', valor: 'lla' },
  { texto: 'Anemia aplásica', valor: 'anemia-aplasica' },
  { texto: 'Hemofilia A severa', valor: 'hemofilia-a' },
  { texto: 'Linfoma de Hodgkin', valor: 'linfoma-hodgkin' },
]

const GRUPOS_SANGUINEOS: readonly OpcionCampoInicioPaciente[] = [
  { texto: 'O+', valor: 'o-positivo' },
  { texto: 'O−', valor: 'o-negativo' },
  { texto: 'A+', valor: 'a-positivo' },
  { texto: 'A−', valor: 'a-negativo' },
  { texto: 'B+', valor: 'b-positivo' },
  { texto: 'AB+', valor: 'ab-positivo' },
]

const PROCEDENCIAS: readonly OpcionCampoInicioPaciente[] = [
  { texto: 'Lima Metropolitana', valor: 'lima' },
  { texto: 'Callao', valor: 'callao' },
  { texto: 'Costa', valor: 'costa' },
  { texto: 'Sierra', valor: 'sierra' },
  { texto: 'Selva', valor: 'selva' },
]

const PARENTESCOS: readonly OpcionCampoInicioPaciente[] = [
  { texto: 'Madre', valor: 'madre' },
  { texto: 'Padre', valor: 'padre' },
  { texto: 'Abuela/o', valor: 'abuelo' },
  { texto: 'Tutor legal', valor: 'tutor-legal' },
  { texto: 'Otro', valor: 'otro' },
]

const DISTRITOS: readonly OpcionCampoInicioPaciente[] = [
  { texto: 'San Borja', valor: 'san-borja' },
  { texto: 'San Luis', valor: 'san-luis' },
  { texto: 'La Victoria', valor: 'la-victoria' },
  { texto: 'Ate', valor: 'ate' },
  { texto: 'Santiago de Surco', valor: 'surco' },
]

const HORARIOS_CONTACTO: readonly OpcionCampoInicioPaciente[] = [
  { texto: 'Mañana (8:00 a. m. - 12:00 p. m.)', valor: 'manana' },
  { texto: 'Tarde (12:00 p. m. - 6:00 p. m.)', valor: 'tarde' },
  { texto: 'Noche (6:00 p. m. - 8:00 p. m.)', valor: 'noche' },
]

const PREFERENCIAS_CONTACTO = [
  { icono: 'phone', texto: 'Llamada', valor: 'llamada' },
  { icono: 'whatsapp', texto: 'WhatsApp', valor: 'whatsapp' },
  { icono: 'mail', texto: 'Correo electrónico', valor: 'correo' },
] as const

const ACCESOS_PERFIL_BASE: readonly Omit<AccesoPerfilInicioPaciente, 'estado'>[] = [
  {
    descripcion: 'Información médica y de contacto.',
    icono: 'user',
    id: 'datos-personales',
    titulo: 'Datos del paciente',
  },
  {
    descripcion: 'Tus datos y relación con el paciente.',
    icono: 'users',
    id: 'datos-tutor',
    titulo: 'Datos del tutor',
  },
]

const ACCIONES_RAPIDAS: readonly AccionRapidaInicioPaciente[] = [
  { descripcion: 'Sin registrar aún', icono: 'pill', id: 'medicacion', titulo: 'Medicación' },
  { descripcion: 'Sin registrar aún', icono: 'smile', id: 'sintomas', titulo: 'Síntomas' },
  { descripcion: 'Sin registrar aún', icono: 'file', id: 'documentos', titulo: 'Documentos' },
]

const RUTAS_ACCIONES: Record<IdAccionRapidaInicio, string> = {
  documentos: '/paciente/documentos',
  medicacion: '/paciente/medicamento',
  sintomas: '/paciente/sintomas',
}

const FORMATO_FECHA_CITA = new Intl.DateTimeFormat('es-PE', {
  day: '2-digit',
  month: '2-digit',
  timeZone: 'America/Lima',
  year: 'numeric',
})

const FORMATO_HORA_CITA = new Intl.DateTimeFormat('es-PE', {
  hour: '2-digit',
  hour12: true,
  minute: '2-digit',
  timeZone: 'America/Lima',
})

function formatearEstado(valor: string) {
  const estado = valor.replaceAll('_', ' ').trim().toLocaleLowerCase('es-PE')
  return estado
    ? `${estado.charAt(0).toLocaleUpperCase('es-PE')}${estado.slice(1)}`
    : PACIENTE_SIN_CARGAR.estado
}

function obtenerParteFecha(fecha: Date, tipo: Intl.DateTimeFormatPartTypes) {
  return FORMATO_FECHA_CITA.formatToParts(fecha).find((parte) => parte.type === tipo)?.value ?? ''
}

function crearCitaDesdeApi(
  cita: NonNullable<InicioPacienteApi['proximaCita']>,
): ProximaCitaInicioPaciente {
  const fecha = new Date(cita.fechaHora)
  if (Number.isNaN(fecha.getTime())) return CITA_SIN_REGISTRAR

  const partesHora = new Intl.DateTimeFormat('es-PE', {
    hour: '2-digit',
    hourCycle: 'h23',
    minute: '2-digit',
    timeZone: 'America/Lima',
  }).formatToParts(fecha)
  const hora = partesHora.find((parte) => parte.type === 'hour')?.value ?? '00'
  const minuto = partesHora.find((parte) => parte.type === 'minute')?.value ?? '00'

  return {
    estado: formatearEstado(cita.estado),
    fecha: FORMATO_FECHA_CITA.format(fecha),
    fechaIso: `${obtenerParteFecha(fecha, 'year')}-${obtenerParteFecha(fecha, 'month')}-${obtenerParteFecha(fecha, 'day')}`,
    hora: FORMATO_HORA_CITA.format(fecha),
    horaIso: `${hora}:${minuto}`,
  }
}

function InicioPage() {
  const redirigir = useRedirrecion()
  const { usuario } = useAuth()
  const [mensajeAccion, setMensajeAccion] = useState('')
  const { datos: datosInicioApi, error: errorDatosInicio } = useDatosInicioPacienteApi()
  const {
    cambiarDatosPersonales,
    cambiarDatosTutor,
    cambiarRegistroCita,
    continuarDatosPersonales,
    datosPersonales,
    datosPersonalesCompletados,
    datosTutor,
    datosTutorCompletados,
    guardarBorrador,
    guardarCita,
    guardarDatosTutor,
    porcentajePerfil,
    registroCita,
    setVista,
    vista,
  } = useInicioPaciente({
    citaInicial: REGISTRO_CITA_INICIAL,
    datosPersonalesIniciales: DATOS_PERSONALES_INICIALES,
    datosTutorIniciales: DATOS_TUTOR_INICIALES,
  })

  const accesosPerfil: readonly AccesoPerfilInicioPaciente[] = ACCESOS_PERFIL_BASE.map((acceso) => ({
    ...acceso,
    estado:
      acceso.id === 'datos-personales'
        ? datosPersonalesCompletados
          ? 'Completado'
          : 'Pendiente'
        : datosTutorCompletados
          ? 'Completado'
          : 'Pendiente',
  }))

  function abrirAccesoPerfil(id: IdAccesoPerfilInicio) {
    setVista(id)
  }

  function abrirAccionRapida(id: IdAccionRapidaInicio) {
    redirigir(RUTAS_ACCIONES[id])
  }

  function informarAccionContacto(accion: string) {
    setMensajeAccion(accion)
  }

  const esResumen = vista === 'resumen'
  const paciente: PerfilInicioPaciente = datosInicioApi
    ? {
        ...PACIENTE_SIN_CARGAR,
        edad: formatearEdadPaciente(datosInicioApi.paciente.edad),
        estado: formatearEstado(datosInicioApi.paciente.estado),
        historiaClinica: datosInicioApi.paciente.historiaClinica,
        id: datosInicioApi.paciente.id,
        imagen: usuario?.fotoPerfil || PACIENTE_SIN_CARGAR.imagen,
        nombre: datosInicioApi.paciente.nombre,
      }
    : {
        ...PACIENTE_SIN_CARGAR,
        imagen: usuario?.fotoPerfil || PACIENTE_SIN_CARGAR.imagen,
      }
  const citaDeclarada = datosInicioApi?.proximaCita
    ? crearCitaDesdeApi(datosInicioApi.proximaCita)
    : CITA_SIN_REGISTRAR
  const porcentajeMostrado =
    datosPersonalesCompletados || datosTutorCompletados
      ? Math.max(datosInicioApi?.porcentajePerfil ?? 0, porcentajePerfil)
      : (datosInicioApi?.porcentajePerfil ?? porcentajePerfil)
  const primerNombrePaciente = paciente.nombre.trim().split(/\s+/)[0] || 'Paciente'

  return (
    <AdaptadoMobil estilos='bg-[#f7fbfd] text-[#082767]'>
      <div className='flex h-full min-h-0 w-full flex-col overflow-hidden bg-[#f7fbfd]'>
        <main className='min-h-0 flex-1 overflow-y-auto'>
          <InicioCabeceraPacienteComp
            descripcion={esResumen ? `Ya activaste la cuenta de ${primerNombrePaciente}.` : undefined}
            fotoCuenta={usuario?.fotoPerfil}
            imagenPaciente={esResumen ? FondoNino : undefined}
            logo={logoHemoRuta}
            nombre={esResumen ? usuario?.nombre || 'Familia' : undefined}
            notificaciones={2}
          />

          {errorDatosInicio && (
            <p
              className='mx-2.5 mt-1 rounded-md bg-[#fff8e8] px-2 py-1 text-center text-[6.7px] font-semibold text-[#9a6a17]'
              role='status'
              title={errorDatosInicio}
            >
              No se pudieron actualizar los datos de la cuenta. Inténtalo nuevamente.
            </p>
          )}

          {esResumen ? (
            <>
              <InicioResumenPacienteComp
                accesosPerfil={accesosPerfil}
                accionesRapidas={ACCIONES_RAPIDAS}
                onAbrirAccesoPerfil={abrirAccesoPerfil}
                onAbrirAccionRapida={abrirAccionRapida}
                onAbrirCita={() => setVista('registrar-cita')}
                onAbrirPerfil={() => setVista('datos-personales')}
                paciente={paciente}
                porcentajePerfil={porcentajeMostrado}
              />
              <div className='px-2.5 pb-3'>
                <GestionCuentaComp variante='compacta' />
              </div>
            </>
          ) : (
            <div className='px-2.5 pb-2'>
              <InicioPerfilPacienteComp paciente={paciente} />

              {vista === 'datos-personales' && (
                <InicioDatosPersonalesComp
                  datos={datosPersonales}
                  onCambiar={cambiarDatosPersonales}
                  onContinuar={continuarDatosPersonales}
                  onGuardarBorrador={guardarBorrador}
                  opciones={{
                    diagnosticos: DIAGNOSTICOS,
                    gruposSanguineos: GRUPOS_SANGUINEOS,
                    procedencias: PROCEDENCIAS,
                    sexos: SEXOS,
                  }}
                />
              )}

              {vista === 'datos-tutor' && (
                <InicioDatosTutorComp
                  datos={datosTutor}
                  nombrePaciente={primerNombrePaciente}
                  onCambiar={cambiarDatosTutor}
                  onGuardarEnviar={guardarDatosTutor}
                  onVolver={() => setVista('datos-personales')}
                  opciones={{
                    distritos: DISTRITOS,
                    horarios: HORARIOS_CONTACTO,
                    parentescos: PARENTESCOS,
                    preferencias: PREFERENCIAS_CONTACTO,
                  }}
                />
              )}

              {vista === 'registrar-cita' && (
                <InicioRegistrarCitasPacienteComp
                  citaDeclarada={citaDeclarada}
                  datos={registroCita}
                  onCambiar={cambiarRegistroCita}
                  onGuardar={guardarCita}
                  onLlamar={() => informarAccionContacto('Llamada al hospital solicitada.')}
                  onSolicitarInformacion={() => informarAccionContacto('Solicitud de información preparada.')}
                />
              )}
            </div>
          )}

          <p aria-live='polite' className='sr-only' role='status'>
            {mensajeAccion}
          </p>
        </main>

        <MenuPaciente onSeleccionarInicio={() => setVista('resumen')} />
      </div>
    </AdaptadoMobil>
  )
}

export default InicioPage
