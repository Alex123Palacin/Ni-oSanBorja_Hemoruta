import { useState } from 'react'

import type {
  ActualizarFormulario,
  DatosPaciente,
  FormularioActivacion,
} from '../types/NuevoPaciente'

interface UseFormularioNuevoPacienteParams {
  datosBase: DatosPaciente
  formularioInicial: FormularioActivacion
}

function useFormularioNuevoPaciente({
  datosBase,
  formularioInicial,
}: UseFormularioNuevoPacienteParams) {
  const [formulario, setFormulario] = useState<FormularioActivacion>(formularioInicial)

  const datosActuales: DatosPaciente = {
    ...datosBase,
    canal: formulario.canal,
    correo: formulario.correo || datosBase.correo,
    dni: formulario.dni || datosBase.dni,
    nombre: formulario.nombre || datosBase.nombre,
    telefono: formulario.telefono || datosBase.telefono,
  }

  const actualizarFormulario: ActualizarFormulario = (campo, valor) => {
    setFormulario((actual) => ({ ...actual, [campo]: valor }))
  }

  return { actualizarFormulario, datosActuales, formulario }
}

export default useFormularioNuevoPaciente
