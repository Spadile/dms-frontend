import React, { useState } from 'react'
import background from '../assets/backgrounds/creat-newWebp.webp'
import GlobalButton from '../components/common/buttons/GlobalButton'
import CreateUserForm from '../components/common/forms/CreateUserForm'
import Modal from '../components/common/modal/Modal'


function Home() {
    const [open, setOpen] = useState(false)

    const toggleModal = () => {
        setOpen(!open)
    };


    return (
        <div className='w-full'>
            {!open &&
                <div className='w-full h-[80vh] min-h-96 flex flex-col items-center justify-center gap-10'>
                    <div className='w-90 '>
                        <img src={background} alt='daman logo' className='w-full h-auto' loading='lazy' />
                    </div>
                    <div className='w-36 max-w-40 '>
                        <GlobalButton Text='Create New +' onClick={toggleModal} />
                    </div>
                </div>
            }

            <Modal isOpen={open} onClose={toggleModal} title='Please Enter The Details'>
                <CreateUserForm onClose={toggleModal} />
            </Modal>

        </div>
    )
}

export default Home
