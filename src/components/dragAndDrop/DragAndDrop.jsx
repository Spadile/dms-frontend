import React, { useCallback, useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import GlobalButton from '../common/buttons/GlobalButton';
import { IoMdCloseCircleOutline } from 'react-icons/io';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { useStore } from '../../store/store';

function DragAndDrop() {
    const [files, setFiles] = useState([]);
    const updateIsFileExist = useStore((state) => state.updateIsFileExist);
    const employee = useStore((state) => state.employee);
    const isFileExist = useStore((state) => state.isFileExist);

    useEffect(() => {
        if (files?.length > 0) {
            updateIsFileExist(true);
        } else {
            updateIsFileExist(false);
        }
    }, [files, updateIsFileExist]);

    useEffect(() => {
        return () => files?.forEach((file) => URL.revokeObjectURL(file.preview));
    }, [files]);

    const onDrop = useCallback((acceptedFiles) => {
        setFiles(acceptedFiles.map((file) => Object.assign(file, {
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
        setFiles((prevFiles) => prevFiles.filter((file) => file.name !== fileName));
    };

    const handleRenameFile = (fileName, newName) => {
        setFiles((prevFiles) =>
            prevFiles.map((file) => {
                if (file.name === fileName) {

                    // Get the file extension
                    const fileExtension = file.name.split('.').pop();

                    // If the new name does not have an extension, add the original extension
                    const renamedFileName = newName.endsWith(`.${fileExtension}`)
                        ? newName
                        : `${newName}${employee?.name}${employee?.department}.${fileExtension}`;

                    // Create a new File object while preserving all native properties (type, lastModified)
                    const renamedFile = new File([file], renamedFileName, {
                        type: file.type,
                        lastModified: file.lastModified,
                    });

                    // Manually preserve custom properties from the original file

                    renamedFile.preview = URL.createObjectURL(renamedFile);
                    renamedFile.path = file.path;
                    renamedFile.relativePath = file.relativePath;

                    return renamedFile; // Return the new File object with the new name and preserved properties
                }
                return file; // No changes to other files
            })
        );
    };

    const handleDownloadZip = async () => {
        if (!files || files.length === 0) {
            console.error("No files to download");
            return;
        }

        const zip = new JSZip();

        for (const file of files) {
            if (file instanceof File) {
                try {
                    // Use file.slice() to create a Blob with the same content and MIME type
                    const fileContent = file.slice(0, file.size); // Slice the entire content
                    const blob = new Blob([fileContent], { type: file.type });

                    // Add the renamed file to the zip, using the updated name and original type
                    zip.file(file.name, blob);
                } catch (error) {
                    console.error(`Error processing file ${file.name}:`, error);
                }
            } else {
                console.error(`Invalid file: ${file}`);
            }
        }

        // Generate and download the zip file
        const content = await zip.generateAsync({ type: 'blob' });
        saveAs(content, 'uploaded-files.zip');
    };

    console.log(files)
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

            <div className='w-full min-h-[65vh] flex items-start mt-10 justify-center'>
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
                                        <IoMdCloseCircleOutline onClick={() => handleRemoveFile(file.name)} className="text-gray-500 rounded-full text-lg cursor-pointer" />
                                    </div>
                                    <div className="border rounded-md px-3 py-3 border-gray-300 bg-gray-200 shadow-md">
                                        {file?.type?.startsWith('image') ? (
                                            <img
                                                src={file?.preview}
                                                alt={file?.name}
                                                className="w-40 h-48 object-cover rounded-md border"
                                            />
                                        ) : (
                                            <p className="truncate">{file?.name}</p>
                                        )}
                                    </div>

                                    <select
                                        value={file.name}
                                        onChange={(e) => handleRenameFile(file.name, e.target.value)}
                                        className='mt-3 border px-2 text-sm py-1 bg-blue-50 w-full rounded-sm'
                                    >
                                        <option value="">Select Document Type</option>
                                        <option value="CoverLetter">Cover Letter</option>
                                        <option value="Passport">Passport</option>
                                        <option value="EmiratesId">Emirates Id</option>
                                    </select>

                                </div>
                            ))}
                        </div>
                        {/* Download ZIP Button */}
                        <div className="mt-10 flex items-center justify-center gap-10 px-60">
                            <GlobalButton type="button" Text="Download renamed files into ZIP" onClick={handleDownloadZip} />
                            <GlobalButton type="button" Text="Convert and merge all documents" onClick={handleDownloadZip} />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default DragAndDrop;
