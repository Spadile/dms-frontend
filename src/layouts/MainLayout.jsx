import React from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from '../components/navbar/Navbar'

function MainLayout() {
    return (
        <div>
            <Navbar />
            <main className="">
                <Outlet />
            </main>
        </div>
    )
}

export default MainLayout
