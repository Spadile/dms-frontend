import React from 'react'

function GlobalButton({ Text = 'Button', onClick, type = 'button', disabled = false }) {
  return (
    // hover: ring-2 hover: ring - offset - 2 hover: ring - blue - 800
    <button type={type} disabled={disabled} onClick={onClick} className={`relative w-full px-3 py-1 overflow-hidden text-white transition-all duration-300 ease-out rounded-full shadow-md sm:px-5 sm:py-2 group  hover:bg-gradient-to-r ${disabled ? 'bg-gray-500' : 'bg-dmsBlue hover:from-dmsBlue hover:to-blue-800 '}`}>
      <span className="absolute right-0 w-8 h-32 -mt-12 transition-all duration-1000 transform translate-x-12 bg-white opacity-10 rotate-12 group-hover:-translate-x-40 ease"></span>
      <span className="relative text-sm sm:text-base">{Text} </span>

    </button>
  )
}

export default GlobalButton
