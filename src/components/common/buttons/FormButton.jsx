import React from 'react'
import { FORM_BUTTON_COLOR } from '../../../utils/constants'



function FormButton({ Text = 'Button', onClick, type = 'button', disabled = false, buttonColor = FORM_BUTTON_COLOR }) {

    const background = {
        background: `${buttonColor}`
    };
    return (
        <button type={type} disabled={disabled} onClick={onClick} class={`rounded shadow-md  px-5 py-2 overflow-hidden group  relative  text-white  transition-all ease-out duration-300 w-full`} style={background} >
            <span class="absolute right-0 w-8 h-32 -mt-12 transition-all duration-1000 transform translate-x-12 bg-white opacity-10 rotate-12 group-hover:-translate-x-64 ease"></span>
            <span class="relative text-sm sm:text-base">{Text}</span>
        </button>
    )
}

export default FormButton
