interface BotonSecundarioCompProps {
  children: string
  disabled?: boolean
  onClick?: () => void
}

function BotonSecundarioComp({ children, disabled = false, onClick }: BotonSecundarioCompProps) {
  return (
    <button
      className='mt-2 h-9 w-full cursor-pointer rounded-lg border border-[#d6e1ec] bg-white text-[9px] font-bold text-[#38517f] transition hover:border-[#b9cddd] hover:bg-[#f7fafc] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#08aabb] disabled:cursor-not-allowed disabled:opacity-60'
      disabled={disabled}
      onClick={onClick}
      type='button'
    >
      {children}
    </button>
  )
}

export default BotonSecundarioComp
