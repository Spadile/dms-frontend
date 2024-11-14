import React from 'react'
import logo from '../../assets/logo/daman-bg-white.png'
import { IoLogOutOutline } from 'react-icons/io5'
import { logoutApi } from '../../api/authApi'
import { useNavigate } from 'react-router-dom'

function UserDropdown() {
    const navigate = useNavigate()

    const handleLogOut = () => {
        logoutApi()
        navigate('/login')
    }
    return (
        <div className='relative flex gap-3 py-4 cursor-pointer group z-[10] '>
            <div className='w-6 h-6 overflow-hidden rounded-full sm:w-10 sm:h-10'>
                <img src={logo} alt='daman logo' className='w-full h-full' />
            </div>
            <div className='text-xs text-white sm:text-sm'>
                <p className='font-semibold'>Sample Name</p>
                <p className=''>sample@gmail.com</p>
            </div>

            <div className='absolute hidden w-full text-gray-800 px-3 py-2   bg-white border shadow-md group-hover:flex top-[100%] border-slate-200'>
                <div className='flex items-center w-full gap-5 p-1 rounded-sm hover:bg-gray-100' onClick={handleLogOut}>
                    <IoLogOutOutline className='text-lg animate-bounce' />
                    <p className=''>Logout </p>
                </div>
            </div>
        </div>
    )
}

export default UserDropdown
