import { solicitarApi } from '../compartido/ClienteApi'
import type { FormularioActivacion, ResultadoAltaPacienteMedico } from '../../types/NuevoPaciente'

export function registrarAltaPacienteMedicoApi(formulario: FormularioActivacion) {
  return solicitarApi<ResultadoAltaPacienteMedico>('/medico/pacientes/alta/', {
    cuerpo: {
      correo: formulario.correo.trim(),
      dni: formulario.dni.trim(),
      nombreCompleto: formulario.nombre.trim(),
      telefono: formulario.telefono.trim(),
    },
    method: 'POST',
  })
}
