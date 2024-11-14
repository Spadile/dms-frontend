import React from 'react'
import logo from '../../assets/logo/logo white.png'
import UserDropdown from './UserDropdown'
import { MdApps } from 'react-icons/md'
import { IoMdSettings } from 'react-icons/io'
import Searchbar from '../common/inputFields/Searchbar'
import { useNavigate } from 'react-router-dom'

function Navbar() {
    const navigate = useNavigate()

    const onLogoClick = () => {
        navigate('/')
    }

    return (
        <div className='flex items-center justify-between w-full px-10 bg-dmsBlue min-h-20 '>
            <div>
                <img src={logo} alt='daman logo' className='w-auto cursor-pointer h-14' onClick={onLogoClick} />
            </div>

            {/* <div className='w-72 '>
                <Searchbar />
            </div> */}
            <div className='flex items-center gap-5 text-white'>
                <UserDropdown />
                <MdApps className='text-2xl cursor-pointer hover:animate-wiggle' />
                <IoMdSettings className='text-2xl cursor-pointer hover:animate-spin-slow ' />
            </div>
        </div>
    )
}

export default Navbar
