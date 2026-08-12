import { useState } from 'react'
import type {
  DatosPersonalesInicioPaciente,
  DatosTutorInicioPaciente,
  RegistroCitaInicioPaciente,
  VistaInicioPaciente,
} from '../types/InicioPaciente'

interface UseInicioPacienteParams {
  citaInicial: RegistroCitaInicioPaciente
  datosPersonalesIniciales: DatosPersonalesInicioPaciente
  datosTutorIniciales: DatosTutorInicioPaciente
}

function useInicioPaciente({
  citaInicial,
  datosPersonalesIniciales,
  datosTutorIniciales,
}: UseInicioPacienteParams) {
  const [vista, setVista] = useState<VistaInicioPaciente>('resumen')
  const [datosPersonales, setDatosPersonales] = useState(datosPersonalesIniciales)
  const [datosTutor, setDatosTutor] = useState(datosTutorIniciales)
  const [registroCita, setRegistroCita] = useState(citaInicial)
  const [datosPersonalesCompletados, setDatosPersonalesCompletados] = useState(false)
  const [datosTutorCompletados, setDatosTutorCompletados] = useState(false)

  const porcentajePerfil = datosTutorCompletados ? 100 : datosPersonalesCompletados ? 50 : 25

  function cambiarDatosPersonales(campo: keyof DatosPersonalesInicioPaciente, valor: string) {
    setDatosPersonales((actuales) => ({ ...actuales, [campo]: valor }))
  }

  function cambiarDatosTutor(campo: keyof DatosTutorInicioPaciente, valor: string) {
    setDatosTutor((actuales) => ({ ...actuales, [campo]: valor }))
  }

  function cambiarRegistroCita(campo: keyof RegistroCitaInicioPaciente, valor: string) {
    setRegistroCita((actual) => ({ ...actual, [campo]: valor }))
  }

  function continuarDatosPersonales() {
    setDatosPersonalesCompletados(true)
    setVista('datos-tutor')
  }

  function guardarBorrador() {
    setVista('resumen')
  }

  function guardarDatosTutor() {
    setDatosPersonalesCompletados(true)
    setDatosTutorCompletados(true)
    setVista('resumen')
  }

  function guardarCita() {
    setVista('resumen')
  }

  return {
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
  }
}

export default useInicioPaciente
