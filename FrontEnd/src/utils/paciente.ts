export function formatearEdadPaciente(edad: number | null | undefined) {
  if (edad === null || edad === undefined) return 'Edad por completar'
  if (edad === 0) return 'Menos de 1 año'
  return `${edad} ${edad === 1 ? 'año' : 'años'}`
}
