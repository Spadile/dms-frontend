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
            <p className='px-5 pt-2 text-xs text-center text-red-700 xl:text-sm sm:px-10 '>"Only the following file formats are accepted: PDF, PNG, JPG, JPEG, WEBP, DOCX, XLSX, CSV, ODS, EML, and TXT. Please upload files in one of these formats."</p>
            <DragAndDrop />
        </div>
    )
}

export default UploadFiles
