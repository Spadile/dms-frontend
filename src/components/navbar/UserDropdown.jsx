import React from 'react'
import logo from '../../assets/logo/daman-bg-white.png'

function UserDropdown() {
    return (
        <div className='flex gap-3'>
            <div className='w-10 h-10 rounded-full overflow-hidden'>
                <img src={logo} alt='daman logo' className='w-full h-full' />
            </div>
            <div className='text-white text-sm'>
                <p className='font-semibold'>Sample Name</p>
                <p className=''>sample@gmail.com</p>
            </div>
        </div>
    )
}

export default UserDropdown
