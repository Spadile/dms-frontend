import React from 'react'
import FileTypeTable from '../components/common/tables/FileTypeTable';
import Breadcrumbs from '../components/common/bredcrumbs/Breadcrumbs';

function ControlFileType() {
    const breadcrumbPaths = [
        { label: 'Home', link: '/' },
        { label: 'File Type Management', link: '/control-file-type' },
    ];
    return (
        <div className="relative min-h-screen p-10 bg-stone-100 ">
            <div className='absolute top-2'>
                <Breadcrumbs paths={breadcrumbPaths} />
            </div>
            <div className='py-2 mb-10 border-b-2 border-slate-300'>
                <p className='text-2xl font-semibold text-gray-800'>Add / Delete File Types</p>
            </div>
            <FileTypeTable />
        </div>

    );
}

export default ControlFileType


