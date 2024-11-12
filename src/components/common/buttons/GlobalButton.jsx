import React from 'react'

function GlobalButton({ Text = 'Button', onClick, type = 'button', disabled = false }) {
  return (
    <button type={type} disabled={disabled} className="relative  flex-shrink-0 flex items-center justify-center px-4 py-1.5 md:py-2  text-sm text-white rounded-full md:px-5 group min-w-24 " onClick={onClick}>
      <span className="absolute top-0 left-0 w-full h-full rounded-full opacity-50 filter blur-sm bg-gradient-to-br from-dmsBlue to-blue-900"></span>
      <span className="absolute inset-0 w-full h-full transition-all duration-200 ease-out rounded-full shadow-xl bg-gradient-to-br filter group-active:opacity-0 group-hover:blur-sm from-dmsBlue to-blue-900"></span>
      <span className="absolute inset-0 w-full h-full transition duration-200 ease-out rounded-full bg-gradient-to-br to-dmsBlue from-blue-900"></span>
      <span className="relative text-xs md:text-sm">{Text}</span>
    </button>
  )
}

export default GlobalButton
