import React from 'react'
import logo from '../../assets/logo/logo white.png'
import UserDropdown from './UserDropdown'
import { MdApps } from 'react-icons/md'
import { IoMdSettings } from 'react-icons/io'
import Searchbar from '../common/inputFields/Searchbar'

function Navbar() {
    return (
        <div className='bg-dmsBlue min-h-20 w-full flex justify-between px-10 items-center '>
            <div>
                <img src={logo} alt='daman logo' className='w-auto h-14' />
            </div>

            <div className='w-72 '>
                <Searchbar />
            </div>
            <div className='text-white flex gap-5 items-center'>
                <UserDropdown />
                <MdApps className='text-2xl' />
                <IoMdSettings className='text-2xl' />
            </div>
        </div>
    )
}

export default Navbar
