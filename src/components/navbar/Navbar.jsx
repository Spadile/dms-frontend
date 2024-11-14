import React from 'react'
import logo from '../../assets/logo/logo white.png'
import UserDropdown from './UserDropdown'
import { MdApps } from 'react-icons/md'
import { IoMdSettings } from 'react-icons/io'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../../store/store'

function Navbar() {
    const navigate = useNavigate()
    const user = useStore((state) => state.user)

    const onLogoClick = () => {
        navigate('/')
    }

    const handleSettingsClick = () => {
        navigate('/control-file-type')
    }

    return (
        <div className='flex items-center justify-between w-full px-8 sm:px-10 bg-dmsBlue min-h-20 '>
            <div>
                <img src={logo} alt='daman logo' className='w-auto h-8 cursor-pointer sm:h-14' onClick={onLogoClick} />
            </div>


            <div className='flex items-center gap-5 text-white'>
                <UserDropdown />
                <MdApps className='text-xl cursor-pointer sm:text-2xl hover:animate-wiggle' />
                <IoMdSettings className='text-xl cursor-pointer sm:text-2xl hover:animate-spin-slow ' onClick={handleSettingsClick} />
            </div>
        </div>
    )
}

export default Navbar
