import React from 'react'
import background from '../assets/backgrounds/creat-new.png'
import GlobalButton from '../components/common/buttons/GlobalButton'


function Home() {
    return (
        <div className='w-full'>
            <div className='w-full h-[80vh] flex flex-col items-center justify-center gap-10'>
                <div className='w-90 '>
                    <img src={background} alt='daman logo' className='w-full h-auto' />
                </div>
                <GlobalButton Text='Create New +' />
            </div>
        </div>
    )
}

export default Home
