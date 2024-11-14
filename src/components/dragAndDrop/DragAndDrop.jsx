import React, { useCallback, useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import GlobalButton from '../common/buttons/GlobalButton';
import { IoMdCloseCircleOutline } from 'react-icons/io';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { useStore } from '../../store/store';
import excelImage from '../../assets/other/excel.png'
import unknownImage from '../../assets/other/documents.png'
import { useNavigate } from 'react-router-dom';
import { mergeFilesApi } from '../../api/mainAPi';
import { toast, Toaster } from 'sonner';


function DragAndDrop() {
    const navigate = useNavigate()
    const [files, setFiles] = useState([]);
    const updateIsFileExist = useStore((state) => state.updateIsFileExist);
    const [selectedName, setSelectedName] = useState([]);
    const employee = useStore((state) => state.employee);
    const isFileExist = useStore((state) => state.isFileExist);
    const [previewData, setPreviewData] = useState(null)
    const [isRight, setIsRight] = useState(null)


    useEffect(() => {
        if (!employee?.name) {
            navigate('/')
        }
    }, [employee, navigate])
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



    const generatePreview = (file) => {

        if (file.type.startsWith('image/')) {
            return URL.createObjectURL(file);
        } else if (file.type === 'application/pdf') {
            return URL.createObjectURL(file);
        } else if (
            file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || // .xlsx
            file.type === 'application/vnd.ms-excel' || // .xls 
            file.type === 'text/csv'
        ) {
            return excelImage; // Placeholder for Excel files
        } else {
            return unknownImage; // Generic placeholder
        }
    };

    console.log(files)
    const onDrop = useCallback((acceptedFiles) => {
        setFiles(acceptedFiles.map((file) => Object.assign(file, {
            preview: generatePreview(file)
        })));
    }, []);

    const { getRootProps, getInputProps, isDragActive, open } = useDropzone({ onDrop, noClick: true });

    const handleManualUpload = (event) => {
        const selectedFiles = Array.from(event.target.files).map((file) =>
            Object.assign(file, {
                preview: generatePreview(file),
            })
        );
        setFiles((prevFiles) => [...prevFiles, ...selectedFiles]);
    };

    const handleRemoveFile = (fileName, i) => {
        setFiles((prevFiles) => prevFiles.filter((file) => file.name !== fileName));
        setSelectedName((prev) => prev.filter((_, index) => index !== i));
    };

    const handleRenameFile = (fileName, newName) => {
        setFiles((prevFiles) =>
            prevFiles.map((file, i) => {
                if (file.name === fileName) {

                    // Get the file extension
                    const fileExtension = file.name.split('.').pop();

                    // If the new name does not have an extension, add the original extension
                    const renamedFileName = newName.endsWith(`.${fileExtension}`)
                        ? newName
                        : `${newName}${employee?.name}${employee?.department}${i}.${fileExtension}`;

                    // Create a new File object while preserving all native properties (type, lastModified)
                    const renamedFile = new File([file], renamedFileName, {
                        type: file.type,
                        lastModified: file.lastModified,
                    });

                    // Manually preserve custom properties from the original file

                    renamedFile.preview = generatePreview(renamedFile);
                    renamedFile.path = file.path;
                    renamedFile.relativePath = file.relativePath;
                    // for namve view in dropdown
                    setSelectedName((prev) => {
                        const newArr = [...prev];
                        newArr[i] = newName; // Replace value at index i
                        return newArr;
                    });
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

    const convertAndMergeHandler = async () => {
        console.log(files)

        const formData = new FormData();
        formData.append('file', files);
        formData.append('name', employee?.name);
        try {
            const response = await mergeFilesApi(formData)
            console.log(response)
        } catch (error) {
            console.log(error?.message)
        }
    }


    const sideViewSetHandler = (e, file) => {
        const box = e.currentTarget;
        const boxRect = box.getBoundingClientRect();
        const screenWidth = window.innerWidth;
        const isCloserToRight = boxRect.right > screenWidth / 2;

        setIsRight(isCloserToRight)
        setPreviewData({ name: file.name, type: file.type, preview: generatePreview(file) })
    }


    return (
        <div className='relative w-full p-5 sm:p-10'>
            <Toaster position='top-center' richColors />
            <div className='flex justify-between'>
                <div>
                    <p className='font-semibold text-gray-800 sm:text-lg lg:text-2xl'>{employee?.name}</p>
                    <p className='text-sm text-gray-700 lg:text-lg'>{employee?.department}</p>
                </div>
                {isFileExist &&
                    <div className="mt-4">
                        <label className="px-4 py-1 text-sm text-white transition rounded-full shadow cursor-pointer sm:px-6 sm:py-2 sm:text-base bg-dmsBlue hover:bg-blue-800">
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
                        <p className="mb-8 font-medium text-gray-700 ams:text-lg">
                            {isDragActive
                                ? 'Drop the files here...'
                                : "Drag and drop or choose files from your computer"}
                        </p>

                        <div className=" w-28 sm:w-36">
                            <GlobalButton type="button" Text="Upload" onClick={open} />
                        </div>
                    </div>
                }

                {/* Preview Section */}
                {files?.length > 0 && (
                    <div className="w-full mt-2 min-h-[65vh]">
                        <div className="flex flex-wrap gap-6">
                            {files?.map((file, index) => (
                                <div key={file?.name} className="max-w-44">
                                    <div className='flex justify-end mb-2'>
                                        <IoMdCloseCircleOutline onClick={() => handleRemoveFile(file.name, index)} className="text-lg text-gray-500 rounded-full cursor-pointer" />
                                    </div>
                                    <div className="px-3 py-3 overflow-hidden bg-gray-200 border border-gray-300 rounded-md shadow-md w-44 h-52 no-scrollbar"
                                        onMouseEnter={(e) => sideViewSetHandler(e, file)}
                                        onMouseLeave={() => setPreviewData(null)}>

                                        {file.type.startsWith('image/') ? (
                                            <img src={file?.preview} alt={file?.name} className="object-cover w-full h-full rounded-md" />
                                        ) : file.type === 'application/pdf' ? (
                                            <iframe src={file?.preview} className="w-40 no-scrollbar" height='100%' title={file.name}></iframe>
                                        ) : (
                                            <img src={file?.preview} alt={file?.name} className="object-cover w-full h-full rounded-md" />
                                        )}
                                    </div>
                                    <p className="px-3 py-1 text-xs truncate">{file.name}</p>

                                    <select
                                        value={selectedName[index]}
                                        onChange={(e) => handleRenameFile(file.name, e.target.value)}
                                        className='px-2 py-1 mt-3 text-sm border rounded-sm w-44 bg-blue-50'
                                    >
                                        <option value="Select">Select Document Type</option>
                                        <option value="CoverLetter">Cover Letter</option>
                                        <option value="Passport">Passport</option>
                                        <option value="EmiratesId">Emirates Id</option>
                                    </select>

                                </div>
                            ))}
                        </div>
                        {/* Download ZIP Button */}
                        <div className="flex flex-col items-center justify-center px-5 mt-20 gap-7 md:gap-10 md:flex-row lg:px-40 xl:px-60">
                            <GlobalButton type="button" Text="Download renamed files into ZIP" onClick={handleDownloadZip} />
                            <GlobalButton type="button" Text="Convert and merge all documents" onClick={convertAndMergeHandler} />
                        </div>
                    </div>
                )}
            </div>

            {previewData &&
                <div className={` top-0 ${isRight ? 'left-0' : 'right-0'} z-50 fixed max-h-screen hidden lg:inline-block px-3 py-3 overflow-hidden bg-gray-200 border border-gray-300 rounded-md shadow-md w-[30vw] h-full no-scrollbar`}>
                    {previewData?.type.startsWith('image/') ? (
                        <img src={previewData?.preview} alt={previewData?.name} className="object-cover w-full h-auto rounded-md" />
                    ) : previewData?.type === 'application/pdf' ? (
                        <iframe src={previewData?.preview} className="w-full no-scrollbar" height='100%' title={previewData?.name}></iframe>
                    ) : (
                        <img src={previewData?.preview} alt={previewData?.name} className="object-cover w-full h-auto rounded-md" />
                    )}
                </div>}
        </div>
    );
}

export default DragAndDrop;
