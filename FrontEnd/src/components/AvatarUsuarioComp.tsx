import IconoMedico from './IconoMedico'

interface AvatarUsuarioCompProps {
  clase?: string
  foto?: string
  nombre?: string
}

function obtenerIniciales(nombre: string) {
  return nombre
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((parte) => parte.charAt(0).toLocaleUpperCase('es-PE'))
    .join('')
}

function AvatarUsuarioComp({ clase = 'h-10 w-10', foto, nombre = '' }: AvatarUsuarioCompProps) {
  return (
    <span
      className={`grid shrink-0 place-items-center overflow-hidden rounded-full border-2 border-white bg-gradient-to-br from-[#dff7f7] to-[#c9ecf4] font-black text-[#087f91] shadow-[0_0_0_1px_#d4e4eb] ${clase}`}
    >
      {foto ? (
        <img alt={`Foto de ${nombre || 'usuario'}`} className='h-full w-full object-cover' src={foto} />
      ) : obtenerIniciales(nombre) ? (
        <span aria-hidden='true'>{obtenerIniciales(nombre)}</span>
      ) : (
        <IconoMedico className='h-1/2 w-1/2' nombre='user' />
      )}
    </span>
  )
}

export default AvatarUsuarioComp
