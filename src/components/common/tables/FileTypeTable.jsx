import React from 'react'
import { AiOutlineDelete } from 'react-icons/ai'
import { MdOutlineModeEdit } from 'react-icons/md'
import LoadingTwo from '../loading/LoadingTwo'
import PaginationReport from '../pagination/PaginationReport'

function FileTypeTable({ data, editHandler, deleteHandler, totalPages, loading }) {
    return (
        <div className="w-full h-full ">
            <div className="border border-slate-200 bg-white px-5 pb-2.5 min-h-64 pt-6 overflow-x-auto shadow-lg rounded-xl sm:px-7.5 xl:pb-1">
                <table className="min-w-[600px] w-full table-auto">
                    <thead className="border-b bg-gray-2 border-slate-300">
                        <tr>
                            <th className="p-2.5 xl:p-3 text-sm font-medium uppercase xsm:text-base text-left">Sl.No</th>
                            <th className="p-2.5 xl:p-3 text-sm font-medium uppercase xsm:text-base text-left">File Type</th>
                            <th className="p-2.5 xl:p-3 text-sm font-medium uppercase xsm:text-base text-center">Action</th>
                        </tr>
                    </thead>
                    {(data?.length > 0 && !loading) &&
                        <tbody className="mt-5">
                            {data?.map((item, index) => (
                                <tr key={index} className="hover:bg-slate-100">
                                    <td className="p-2.5 xl:p-3 text-black whitespace-normal break-words">{index + 1}</td>
                                    <td className="p-2.5 xl:p-3 text-black whitespace-normal break-words">{item?.name}</td>
                                    <td className="p-2.5 xl:p-3 flex justify-center gap-5">
                                        {/* <div className="relative flex justify-center group">
                                            <MdOutlineModeEdit
                                                className="text-lg text-blue-700 cursor-pointer hover:text-blue-800"
                                                onClick={() => editHandler(item?.email, item?.rolls)}
                                            />
                                            <p className="absolute hidden px-3 py-[0.05rem] bg-white text-xs border border-slate-400 text-slate-600 rounded-lg -top-6 group-hover:flex">
                                                Edit
                                            </p>
                                        </div> */}
                                        <div className="relative flex justify-center group">
                                            <AiOutlineDelete
                                                className="text-lg cursor-pointer hover:text-orange-800 text-red"
                                                onClick={() => deleteHandler(item?.id)}
                                            />
                                            <p className="absolute hidden px-3 py-[0.05rem] bg-white text-xs border border-slate-400 text-slate-600 rounded-lg -top-6 group-hover:flex">
                                                Delete
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    }
                </table>
                {(!data || data?.length === 0 || loading) &&
                    <div className="" >
                        {loading ? <LoadingTwo /> : <p className='p-5 font-semibold text-center text-slate-700'>No data available</p>}
                    </div>
                }
            </div>
            <div className="flex overflow-x-auto lg:justify-center">
                <PaginationReport totalPages={totalPages} />
            </div>
        </div>
    )
}

export default FileTypeTable
