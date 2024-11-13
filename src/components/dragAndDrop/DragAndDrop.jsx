import React, { useCallback, useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import GlobalButton from '../common/buttons/GlobalButton';
import { IoMdCloseCircleOutline } from 'react-icons/io';
import { useStore } from '../../store/store';

function DragAndDrop() {
    const [files, setFiles] = useState([]);
    const updateIsFileExist = useStore((state) => state.updateIsFileExist)
    const employee = useStore((state) => state.employee)
    const isFileExist = useStore((state) => state.isFileExist)

    useEffect(() => {
        if (files?.length > 0) {
            updateIsFileExist(true)
        } else {
            updateIsFileExist(false)
        }
    }, [files, updateIsFileExist])

    useEffect(() => {
        return () => files?.forEach(file => URL.revokeObjectURL(file.preview));
    }, [files]);

    const onDrop = useCallback((acceptedFiles) => {
        setFiles(acceptedFiles.map(file => Object.assign(file, {
            preview: URL.createObjectURL(file)
        })));
    }, []);
    const { getRootProps, getInputProps, isDragActive, open } = useDropzone({ onDrop, noClick: true });



    const handleManualUpload = (event) => {
        const selectedFiles = Array.from(event.target.files).map((file) =>
            Object.assign(file, {
                preview: URL.createObjectURL(file),
            })
        );
        setFiles((prevFiles) => [...prevFiles, ...selectedFiles]);
    };

    const handleRemoveFile = (fileName) => {
        setFiles((prevFiles) => prevFiles.filter(file => file.name !== fileName));
    };



    return (
        <div className='w-full p-10'>

            <div className='flex justify-between'>
                <div>
                    <p className='font-semibold text-lg lg:text-2xl text-gray-800'>{employee?.name}</p>
                    <p className='text-gray-700 lg:text-lg'>{employee?.department}</p>
                </div>
                {isFileExist &&
                    <div className="mt-4">
                        <label className="px-6 py-2 bg-dmsBlue text-white rounded-full shadow hover:bg-blue-800 transition cursor-pointer">
                            Add More
                            <input
                                type="file"
                                multiple
                                onChange={handleManualUpload}
                                className="hidden"
                            />
                        </label>
                    </div>
                }
            </div>

            <div className='w-full min-h-[65vh] flex items-start mt-10 justify-center '>
                {!isFileExist &&
                    <div
                        {...getRootProps()}
                        className={`flex flex-col w-full items-center lg:min-h-96 justify-center p-8 border-2 rounded-lg border-dashed 
          ${isDragActive ? 'border-blue-500 bg-blue-100' : 'border-gray-400 bg-gray-100'} 
          hover:bg-gray-200 transition duration-300 ease-in-out`}
                    >
                        <input {...getInputProps()} />
                        <p className="text-gray-700 text-lg font-medium mb-8">
                            {isDragActive
                                ? 'Drop the files here...'
                                : "Drag and drop or choose files from your computer"}
                        </p>

                        <div className="w-36">
                            <GlobalButton type="button" Text="Upload" onClick={open} />
                        </div>
                    </div>
                }

                {/* Preview Section */}
                {files?.length > 0 && (
                    <div className="mt-2 w-full">
                        <div className="flex flex-wrap gap-6">
                            {files?.map(file => (
                                <div key={file?.name} className="">
                                    <div className='flex justify-end mb-2'>
                                        <IoMdCloseCircleOutline onClick={() => handleRemoveFile(file.name)} className="  text-gray-500  rounded-full text-lg cursor-pointer" />
                                    </div>
                                    <div className=" border rounded-md px-3 py-3 border-gray-300 bg-gray-200 shadow-md ">
                                        {file?.type?.startsWith('image') ? (
                                            <img
                                                src={file?.preview}
                                                alt={file?.name}
                                                className="w-40 h-48 object-cover rounded-md  border"
                                            />
                                        ) : (
                                            <p className="truncate">{file?.name}</p>
                                        )}
                                    </div>

                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default DragAndDrop;
