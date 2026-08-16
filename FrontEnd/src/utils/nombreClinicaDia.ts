export function nombreBreveClinicaDia(nombreCompleto: string) {
  const partes = nombreCompleto.trim().split(/\s+/).filter(Boolean)
  if (partes.length <= 2) return partes.join(' ')
  return `${partes[0]} ${partes.at(-1)}`
}
