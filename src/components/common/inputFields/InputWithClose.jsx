
import React from 'react'
import { IoMdClose } from 'react-icons/io';
import { INPUT_MAX_LENGTH } from '../../../utils/constants';

function InputWithClose({ placeholder = "Search", value, onChange, name = '', disabled = false, minLength = 4, maxLength = INPUT_MAX_LENGTH, onClose }) {

    const triggerCustomChange = (value) => {
        const customEvent = {
            target: {
                value: value,
            },
        };
        onChange(customEvent);
    };

    const closeInput = () => {
        triggerCustomChange('');
        onClose();
    }

    return (
        <div className="relative flex items-center w-full">
            <input type="text" value={value} onChange={onChange} minLength={minLength} name={name} disabled={disabled} maxLength={maxLength} className="w-full py-2 pl-4 pr-10 text-sm border rounded-lg border-slate-300 focus:border-slate-400 focus:outline-none" placeholder={placeholder} />
            {value ? <IoMdClose className='absolute text-xl cursor-pointer right-4' onClick={() => closeInput()} /> : ''}
        </div>
    )
}

export default InputWithClose
