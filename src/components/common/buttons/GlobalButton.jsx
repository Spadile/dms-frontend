import React from 'react'

function GlobalButton({ Text = 'Button', onClick, type = 'button', disabled = false }) {
  return (
    // hover: ring-2 hover: ring - offset - 2 hover: ring - blue - 800
    <button type={type} disabled={disabled} onClick={onClick} className="w-full rounded-full shadow-md  px-5 py-2 overflow-hidden group bg-dmsBlue relative hover:bg-gradient-to-r hover:from-dmsBlue hover:to-blue-800 text-white  transition-all ease-out duration-300">
      <span className="absolute right-0 w-8 h-32 -mt-12 transition-all duration-1000 transform translate-x-12 bg-white opacity-10 rotate-12 group-hover:-translate-x-40 ease"></span>
      <span className="relative">{Text}</span>
    </button>
  )
}

export default GlobalButton
