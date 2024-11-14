import React from 'react'
import DragAndDrop from '../components/dragAndDrop/DragAndDrop'
import Breadcrumbs from '../components/common/bredcrumbs/Breadcrumbs'

const breadcrumbPaths = [
    { label: 'Home', link: '/' },
    { label: 'File Upload', link: '/upload-files' },
];

function UploadFiles() {

    return (
        <div className=''>
            <div className='px-5 pt-2 sm:px-10'>
                <Breadcrumbs paths={breadcrumbPaths} />
            </div>
            <DragAndDrop />
        </div>
    )
}

export default UploadFiles
