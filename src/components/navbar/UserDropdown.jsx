import React from 'react'
import logo from '../../assets/logo/daman-bg-white.png'
import { IoLogOutOutline } from 'react-icons/io5'
import { logoutApi } from '../../api/authApi'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../../store/store'

function UserDropdown() {
    const navigate = useNavigate()
    const user = useStore((state) => state.user)
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
                <p className='font-semibold'>{user?.name}</p>
                <p className=''>{user?.email}</p>
            </div>

            <div className='absolute hidden w-full min-w-fit text-gray-800  py-1 sm:py-2  px-1  bg-white border shadow-md group-hover:flex top-[100%] border-slate-200'>
                <div className='flex items-center w-full gap-1 p-1 rounded-sm sm:px-4 sm:gap-5 hover:bg-gray-200' onClick={handleLogOut}>
                    <IoLogOutOutline className='sm:text-lg sm:animate-bounce' />
                    <p className='text-xs sm:text-base'>Logout </p>
                </div>
            </div>
        </div>
    )
}

export default UserDropdown
