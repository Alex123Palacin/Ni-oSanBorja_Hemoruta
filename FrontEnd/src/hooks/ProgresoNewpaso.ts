import { useState } from 'react'

import type { PasoActivacion } from '../types/NuevoPaciente'

export function useProgreso(pasoInicial: PasoActivacion = 1) {
  const [paso, setPaso] = useState<PasoActivacion>(pasoInicial)

  function irAlSiguiente() {
    setPaso((actual) => Math.min(3, actual + 1) as PasoActivacion)
  }

  function irAlAnterior() {
    setPaso((actual) => Math.max(1, actual - 1) as PasoActivacion)
  }

  function reiniciarProgreso() {
    setPaso(1)
  }

  return { irAlAnterior, irAlSiguiente, paso, reiniciarProgreso, setPaso }
}
