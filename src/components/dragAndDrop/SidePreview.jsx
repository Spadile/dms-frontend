import React from 'react'
import { MdClose } from 'react-icons/md'

function SidePreview({ previewData, isRight, unknownImage, topPosition, onCloseClick }) {

    return (
        <div
            className={`${isRight ? 'left-0' : 'right-0'} ${topPosition < 80 ? 'top-20 max-h-[90vh]' : 'top-0 max-h-screen'} group z-[100] fixed  hidden lg:inline-block py-2 overflow-hidden bg-gray-200 border border-gray-300 rounded-md shadow-md w-[35vw] h-full overflow-y-auto  no-scrollbar`}
        >
            <div className='absolute top-0 justify-end hidden w-full px-5 py-3 transition-transform bg-opacity-60 bg-slate-800 group-hover:flex'>
                <MdClose className='text-2xl text-white cursor-pointer hover:scale-110' onClick={onCloseClick} />
            </div>
            {previewData?.preview?.type === 'image' ? (
                <img
                    src={previewData?.preview?.data}
                    alt={previewData?.name}
                    className="object-cover w-full h-auto rounded-md"
                />
            ) : previewData?.preview?.type === 'pdf' ? (
                <iframe
                    src={`${previewData?.preview?.data}#toolbar=0&navpanes=0&scrollbar=0`}
                    className="w-full no-scrollbar"
                    height="100%"
                    title={previewData?.name}
                ></iframe>
            ) : previewData?.preview?.type === 'table' ? (
                <div className="max-h-full overflow-auto bg-white border rounded-md">
                    <table className="min-w-full text-sm text-left text-gray-700">
                        <tbody>
                            {previewData?.preview?.data?.map((row, rowIndex) => (
                                <tr key={rowIndex}>
                                    {row.map((cell, cellIndex) => (
                                        <td key={cellIndex} className="px-2 py-1 border border-gray-300">
                                            {cell}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : previewData?.preview?.type === 'text' ? (
                <pre className="max-h-full p-2 overflow-auto text-sm bg-gray-100 rounded-md">
                    {previewData?.preview?.data}
                </pre>
            ) : (
                <div className="p-4 text-center">
                    <p className="text-gray-600">Unsupported file type</p>
                    <img
                        src={unknownImage} // Placeholder for unsupported file types
                        alt="Unsupported"
                        className="object-cover w-full h-auto rounded-md"
                    />
                </div>
            )}
        </div>
    )
}

export default SidePreview
