import { useNavigate } from 'react-router-dom'

function useRedirrecion() {
  const navigate = useNavigate()

  function redirigir(ruta: string) {
    navigate(ruta)
  }

  return redirigir
}

export default useRedirrecion
