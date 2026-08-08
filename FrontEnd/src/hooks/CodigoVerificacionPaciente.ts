import { useRef, useState, type ClipboardEvent, type KeyboardEvent } from 'react'

function useCodigoVerificacionPaciente(longitud: number, codigoInicial = '') {
  const [codigo, setCodigo] = useState<string[]>(() =>
    Array.from({ length: longitud }, (_, indice) => codigoInicial.replace(/\D/g, '')[indice] ?? ''),
  )
  const referencias = useRef<Array<HTMLInputElement | null>>([])

  function enfocar(indice: number) {
    referencias.current[indice]?.focus()
  }

  function distribuirDigitos(indiceInicial: number, valor: string) {
    const digitos = valor.replace(/\D/g, '').slice(0, longitud - indiceInicial)
    if (!digitos) return

    setCodigo((codigoActual) => {
      const siguienteCodigo = [...codigoActual]
      digitos.split('').forEach((digito, desplazamiento) => {
        siguienteCodigo[indiceInicial + desplazamiento] = digito
      })
      return siguienteCodigo
    })

    enfocar(Math.min(indiceInicial + digitos.length, longitud - 1))
  }

  function cambiarDigito(indice: number, valor: string) {
    const digitos = valor.replace(/\D/g, '')

    if (digitos.length > 1) {
      distribuirDigitos(indice, digitos)
      return
    }

    setCodigo((codigoActual) => {
      const siguienteCodigo = [...codigoActual]
      siguienteCodigo[indice] = digitos
      return siguienteCodigo
    })

    if (digitos && indice < longitud - 1) {
      enfocar(indice + 1)
    }
  }

  function manejarTecla(indice: number, evento: KeyboardEvent<HTMLInputElement>) {
    if (evento.key === 'Backspace' && !codigo[indice] && indice > 0) {
      enfocar(indice - 1)
    }

    if (evento.key === 'ArrowLeft' && indice > 0) {
      evento.preventDefault()
      enfocar(indice - 1)
    }

    if (evento.key === 'ArrowRight' && indice < longitud - 1) {
      evento.preventDefault()
      enfocar(indice + 1)
    }
  }

  function manejarPegado(indice: number, evento: ClipboardEvent<HTMLInputElement>) {
    evento.preventDefault()
    distribuirDigitos(indice, evento.clipboardData.getData('text'))
  }

  function asignarReferencia(indice: number, elemento: HTMLInputElement | null) {
    referencias.current[indice] = elemento
  }

  function reiniciarCodigo() {
    setCodigo(Array.from({ length: longitud }, () => ''))
    enfocar(0)
  }

  return {
    asignarReferencia,
    cambiarDigito,
    codigo,
    codigoCompleto: codigo.join(''),
    manejarPegado,
    manejarTecla,
    reiniciarCodigo,
  }
}

export default useCodigoVerificacionPaciente
