
import React, { useState } from 'react'
import FormButton from '../buttons/FormButton';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useStore } from '../../../store/store';

function CreateUserForm({ onClose }) {
    const navigate = useNavigate()
    const [name, setName] = useState('')
    const [department, setDepartment] = useState('')
    const updateEmployee = useStore((state) => state.updateEmployee)


    const handleSubmit = (e) => {
        e.preventDefault();
        console.log(name, department)
        if (name && department) {
            updateEmployee({ name: name, department: department })
            navigate('/upload-files');
        } else {
            toast.warning('Please add name and department')
        }
    }
    return (
        <form onSubmit={handleSubmit} className='flex flex-col gap-6 text-sm sm:text-base'>
            <div>
                <input type='text' className='w-full px-3 py-2 border rounded-md outline-none focus:border-blue-300 ' required placeholder='Employee Name' value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
                <input type='text' className='w-full px-3 py-2 border rounded-md outline-none focus:border-blue-300 ' required placeholder='Department' value={department} onChange={(e) => setDepartment(e.target.value)} />
            </div>
            <div className='flex justify-between gap-4 mt-3'>
                <FormButton Text='Cancel' type='button' buttonColor='black' onClick={onClose} />
                <FormButton Text='Create' type='submit' />
            </div>
        </form>
    )
}

export default CreateUserForm
