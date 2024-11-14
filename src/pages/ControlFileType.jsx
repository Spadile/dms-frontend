import React, { useEffect, useState } from 'react'
import FileTypeTable from '../components/common/tables/FileTypeTable';
import Breadcrumbs from '../components/common/bredcrumbs/Breadcrumbs';
import { addFileTypeApi, deleteFileTypeApi, getFileTypeApi, updateFileTypeApi } from '../api/adminApi';
import { toast, Toaster } from 'sonner';
import GlobalButton from '../components/common/buttons/GlobalButton';
import InputWithClose from '../components/common/inputFields/InputWithClose';
import Swal from 'sweetalert2';

const breadcrumbPaths = [
    { label: 'Home', link: '/' },
    { label: 'File Type Management', link: '/control-file-type' },
];
function ControlFileType() {
    const [tableData, setableData] = useState([])
    const [fileType, setFileType] = useState('')
    const [typeId, setTypeId] = useState('')
    const [loading, setLoading] = useState(false)
    const [totalPages, setTotalPages] = useState(1)

    useEffect(() => {
        refetchData()
    }, [])

    const handleInputClose = () => {
        setFileType('')
        setTypeId('')
    }

    const refetchData = async () => {
        setLoading(true)
        try {
            const types = await getFileTypeApi()
            setableData(types)
            setTotalPages(types?.pagination?.totalPages)
        } catch (error) {
            console.log(error.message)
        } finally {
            setLoading(false)
        }

    }

    const addFileTypeHandler = async () => {
        const data = {
            name: fileType,
            ...(typeId && { id: typeId })
        }

        if (!data?.name) {
            toast.info("Please provide a name")
            return
        }

        const text = typeId ? "edit file type" : "add file type"
        const successText = typeId ? 'updated' : 'added'
        const apiCall = typeId ? updateFileTypeApi : addFileTypeApi

        const result = await Swal.fire({
            title: "Are you sure?",
            text: `Need to ${text}!`,
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes"
        })
        if (result.isConfirmed) {
            Swal.fire({
                title: 'loading...',
                allowEscapeKey: false,
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });
            try {
                const respose = await apiCall(data)
                if (respose.status === 200 || respose?.status === 201) {
                    toast.success(`File type ${successText} successfully`);
                    setFileType('')
                    setTypeId('')
                    refetchData()
                }
            } catch (error) {
                console.log(error.message)
            } finally {
                Swal.close()
            }
        };
    }

    const deleteHandler = async (id) => {

        const result = await Swal.fire({
            title: "Are you sure?",
            text: `Need to Delete this file type!`,
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes"
        })
        if (result.isConfirmed) {
            Swal.fire({
                title: 'loading...',
                allowEscapeKey: false,
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            try {
                const response = await deleteFileTypeApi(id)
                if (response?.status === 200) {
                    Swal.close();
                    Swal.fire({
                        title: `File type Deleted`,
                        text: `File type List updated successfully`,
                        icon: "success",
                        allowOutsideClick: false
                    })
                    refetchData()
                } else {
                    Swal.close();
                }
            } catch (error) {
                console.log(error?.message)
                Swal.close();
            }

        }
    }

    return (
        <div className="relative min-h-screen p-10 bg-stone-100 ">
            <Toaster position='top-center' richColors />
            <div className='absolute top-2'>
                <Breadcrumbs paths={breadcrumbPaths} />
            </div>

            <div className='my-4'>
                <div className='flex flex-col w-full gap-5 px-5 py-5 mt-3 bg-white border shadow-lg sm:px-8 rounded-xl border-slate-200 '>
                    <div className='flex items-center '>
                        <p className='text-base font-semibold sm:text-lg md:text-xl text-slate-800'>File Types</p>
                    </div>

                    <div className='flex justify-end gap-5 '>
                        <InputWithClose placeholder='Enter New File Type' value={fileType} onChange={(e) => setFileType(e.target.value)} onClose={() => handleInputClose()} />
                        <div className='w-44'>
                            <GlobalButton Text={typeId ? 'Update File Type' : 'Add New +'} onClick={() => addFileTypeHandler()} />
                        </div>
                    </div>
                </div>
            </div>
            <FileTypeTable data={tableData} totalPages={totalPages} loading={loading} deleteHandler={deleteHandler} />
        </div>

    );
}

export default ControlFileType


