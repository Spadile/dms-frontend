import React from 'react'
import { Outlet } from 'react-router-dom'

function MainLayout() {
    return (
        <div>
            <main className="">
                <Outlet />
            </main>
        </div>
    )
}

export default MainLayout
