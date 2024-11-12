import React from 'react'
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { IoMdClose } from 'react-icons/io';
import { IoSearchSharp } from 'react-icons/io5';

function Searchbar({ placeholder = "Search", value, onChange, loading }) {

    const triggerCustomChange = (value) => {
        const customEvent = {
            target: {
                value: value,
            },
        };
        onChange(customEvent);
    };


    return (
        <div className="relative flex items-center w-full bg-white rounded-lg">
            <input type="text" value={value} onChange={onChange} className="w-full py-2 pr-4 pl-8 text-sm border rounded-lg  focus:outline-none" placeholder={placeholder} />
            {(loading && value) ? <AiOutlineLoading3Quarters className="absolute text-xl left-2 animate-spin" /> : value ? <IoMdClose className='absolute text-xl cursor-pointer left-2' onClick={() => triggerCustomChange('')} /> : <IoSearchSharp className="absolute text-xl text-gray-600 left-2" />}
        </div>
    )
}

export default Searchbar
