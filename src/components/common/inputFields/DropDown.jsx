import { useState } from 'react';

function Dropdown({ options, selectedValue, onChange, isOpen, setIsOpen, index }) {
    // const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="relative ">
            <button
                onClick={() => setIsOpen(index)}
                className="px-2 py-1 mt-3 text-sm text-left border rounded-sm w-36 sm:w-44 bg-blue-50"
            >
                {selectedValue || 'Select Document Type'}
            </button>

            {(isOpen === index) && (
                <div className="absolute z-10 w-full mt-1 overflow-y-auto bg-white border border-gray-300 rounded-sm custom-scrollbar max-h-32">
                    <ul>
                        {options?.map((value, index) => (
                            <li
                                key={index}
                                className="px-2 py-1 cursor-pointer hover:bg-blue-100"
                                onClick={() => {
                                    onChange(value?.name);
                                    setIsOpen(-1);
                                }}
                            >
                                {value?.name}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default Dropdown