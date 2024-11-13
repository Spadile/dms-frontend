import { INPUT_MAX_LENGTH } from '@/utils/constants';
import React from 'react'

function InputField({ placeholder = 'Enter', type = "text", value, onChange, required, name = '', disabled = false, minLength = 2, maxLength = INPUT_MAX_LENGTH, validateMessage = 'Please fill out this field.' }) {


    const validateInput = (e) => {
        const input = e.target;
        // Updated Email Regex for stricter email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;

        if (input.validity.valueMissing) {
            input.setCustomValidity(input.type === 'email' ? 'Please enter an email address.' : validateMessage);
        }
        // Check email-specific validation
        else if (input.type === 'email') {
            if (!emailRegex.test(input.value)) {
                input.setCustomValidity('Please enter a valid email address.');
            } else {
                input.setCustomValidity('');
            }
        }
        // Check for too short
        else if (input.validity.tooShort) {
            input.setCustomValidity(`Minimum required length is ${minLength} characters.`);
        }
        else {
            input.setCustomValidity('');
        }

        // Trigger validation message display
        input.reportValidity();
    };

    return (
        <input

            name={name}
            required={required}
            disabled={disabled}
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={(e) => {
                validateInput(e);
                onChange(e);
            }}
            onInvalid={validateInput}
            minLength={minLength}
            maxLength={maxLength}
            onInput={(e) => e.target.setCustomValidity('')}
            className='w-full px-3 py-2 border rounded-lg outline-none border-slate-300 focus:bg-slate-100 ' />

    )
}

export default InputField
