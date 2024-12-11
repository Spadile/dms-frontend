import React, { useCallback, useEffect, useState } from 'react';
import { throttle } from 'lodash';
import { useDropzone } from 'react-dropzone';
import GlobalButton from '../common/buttons/GlobalButton';
import { IoMdCloseCircleOutline } from 'react-icons/io';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { useStore } from '../../store/store';
import unknownImage from '../../assets/other/documents.png'
import { useNavigate } from 'react-router-dom';
import { compressFilesApi, getFileSize, mergeFilesApi } from '../../api/mainAPi';
import { toast, Toaster } from 'sonner';
import Swal from 'sweetalert2';
import axiosInstance from '../../utils/axiosInstance';
import { convertToUnderscore, formatFileSize, formatFileSizeNumber } from '../../utils/functions';
import { getFileTypeApi } from '../../api/adminApi';
import { ALLOWED_DATA_EXTENSIONS } from '../../utils/constants';
import SidePreview from './SidePreview';
import { generatePreview } from '../../utils/generatePreview';


function DragAndDrop() {
    const navigate = useNavigate()
    const [files, setFiles] = useState([]);
    const updateIsFileExist = useStore((state) => state.updateIsFileExist);
    const [selectedName, setSelectedName] = useState([]);
    const employee = useStore((state) => state.employee);
    const isFileExist = useStore((state) => state.isFileExist);
    const [previewData, setPreviewData] = useState(null)
    const [isRight, setIsRight] = useState(null)
    const [isMergeActive, setIsMergeActive] = useState(false)
    const [fileUrl, setFileUrl] = useState(null)
    const [sizeOfFile, setSizeOfFile] = useState(null)
    const [typeData, setTypeData] = useState([])
    const [loading, setLoading] = useState(false)
    const [topPosition, setTopPosition] = useState(0);

    const handleScroll = useCallback(
        throttle(() => {
            setTopPosition(window.scrollY);
        }, 200),
        []
    );

    useEffect(() => {
        // Attach the scroll event listener
        window.addEventListener("scroll", handleScroll);
        // Cleanup on component unmount
        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, [handleScroll]);

    useEffect(() => {
        if (!employee?.name) {
            navigate('/')
        }
        fetchFileTypes()
    }, [employee, navigate])

    useEffect(() => {
        if (files?.length > 0) {
            updateIsFileExist(true);
        } else {
            setIsMergeActive(false)
            updateIsFileExist(false);
        }
        return () => {
            files?.forEach((preview) => {
                if (preview?.type === "image" || preview?.type === "pdf") {
                    URL.revokeObjectURL(preview?.data);
                }
            });
        }
    }, [files, updateIsFileExist]);

    const fetchFileTypes = async () => {
        try {
            const types = await getFileTypeApi()
            setTypeData(types?.document_types)
        } catch (error) {
            console.log(error.message)
        }

    }

    const onDrop = useCallback(async (acceptedFiles) => {
        const resolvedFiles = await Promise.all(
            acceptedFiles?.map(async (file) =>
                Object.assign(file, {
                    preview: await generatePreview(file),
                })
            )
        );
        if (isFileAllowed(resolvedFiles)) {
            setFiles(resolvedFiles); // Set resolved files in the state
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive, open } = useDropzone({ onDrop, noClick: true });


    const handleManualUpload = async (event) => {
        const selectedFilesPromises = Array.from(event.target.files)?.map(async (file) =>
            Object.assign(file, {
                preview: await generatePreview(file),
            })
        );

        const resolvedFiles = await Promise.all(selectedFilesPromises); // Resolve all promises 
        if (isFileAllowed(resolvedFiles)) {
            setFiles((prevFiles) => [...prevFiles, ...resolvedFiles]); // Update state with resolved files
        }
        setIsMergeActive(false);
    };


    const isFileAllowed = (fileData) => {
        for (const file of fileData) {
            const fileExtension = file?.name?.split('.').pop().toLowerCase();
            if (!ALLOWED_DATA_EXTENSIONS?.includes(fileExtension)) {
                toast.warning(`This file type - ${fileExtension} - is not allowed. Please remove ${file?.name}.`);
                return false;
            }
        }
        return true;
    };

    const handleRemoveFile = (fileName, i) => {
        setFiles((prevFiles) => prevFiles.filter((file) => file.name !== fileName));
        setSelectedName((prev) => prev.filter((_, index) => index !== i));
    };


    const handleRenameFile = async (fileName, newName) => {
        // Use a Promise.all to handle all the asynchronous renaming
        const updatedFiles = await Promise.all(
            files.map(async (file, i) => {
                if (file.name === fileName) {
                    // Get the file extension
                    const fileExtension = file?.name?.split('.').pop();

                    // If the new name does not have an extension, add the original extension
                    const renamedFileName = newName?.endsWith(`.${fileExtension}`)
                        ? newName
                        : `${newName}_${employee?.name}_${employee?.department}_${i}.${fileExtension}`;

                    // Create a new File object while preserving all native properties (type, lastModified)
                    const renamedFile = new File([file], renamedFileName, {
                        type: file.type,
                        lastModified: file.lastModified,
                    });

                    // Await the preview generation before assigning it
                    const preview = await generatePreview(renamedFile);
                    renamedFile.preview = preview;
                    renamedFile.path = file.path;
                    renamedFile.relativePath = file.relativePath;

                    // for name view in dropdown
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

        // Once all promises are resolved, update the state
        setFiles(updatedFiles);
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
        setIsMergeActive(true)
    };


    const convertAndMergeHandler = async () => {
        if (!isFileAllowed(files)) {
            return;
        }
        const formData = new FormData();
        // formData.append('files', files);
        formData.append('name', convertToUnderscore(employee?.name));
        formData.append('department', convertToUnderscore(employee?.department));
        files.forEach((file, index) => {
            formData.append('files', file);
        });
        try {
            Swal.fire({
                title: 'loading...',
                allowEscapeKey: false,
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });
            const response = await mergeFilesApi(formData)
            if (response?.status === 200) {
                Swal.close()
                toast.success("Successfully merged files")
                setFileUrl(response?.data?.file_url)
                const size = await getFileSize(response?.data?.file_url)
                if (size) {
                    // const convertedSize = formatFileSize(size)
                    setSizeOfFile(Number(size))
                }
            }
        } catch (error) {
            Swal.close()
            console.log(error?.message)
        } finally {
            Swal.close()
        }
    }

    const compressFileHandler = async (fileUrl) => {
        try {
            Swal.fire({
                title: 'loading...',
                allowEscapeKey: false,
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });
            const data = {
                file_url: fileUrl
            }
            const response = await compressFilesApi(data)
            if (response?.status === 200) {
                Swal.close()
                toast.success("Successfully compressed")
                setFileUrl(response?.data?.file_url)
                const size = await getFileSize(response?.data?.file_url)
                if (size) {
                    // const convertedSize = formatFileSize(size)
                    setSizeOfFile(Number(size))
                }
            }
        } catch (error) {
            Swal.close()
            console.log(error?.message)
        } finally {
            Swal.close()
        }

    }



    const sideViewSetHandler = async (e, file) => {
        const box = e.currentTarget;
        const boxRect = box.getBoundingClientRect();
        const screenWidth = window.innerWidth;
        const isCloserToRight = boxRect.right > screenWidth / 2;

        setIsRight(isCloserToRight)

        const preview = await generatePreview(file);
        setPreviewData({ name: file.name, type: file.type, preview: preview })
    }


    const handleDownload = async (fileLink) => {
        setLoading(true)

        // Show SweetAlert2 modal
        Swal.fire({
            title: 'Downloading...',
            html: `
      <div style="width: 100%; background-color: #f3f3f3; border-radius: 5px;">
        <div id="progress-bar" style="width: 0%; background-color: #4caf50; height: 20px; border-radius: 5px;"></div>
      </div>
      <p>Progress: <b id="progress-number">0%</b></p>
    `,
            allowOutsideClick: false,
            showConfirmButton: false
        });

        try {
            const response = await axiosInstance.get(fileLink, {
                responseType: 'blob',
                onDownloadProgress: (progressEvent) => {
                    const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    Swal.update({
                        html: `
            <div style="width: 100%; background-color: #f3f3f3; border-radius: 5px;">
              <div id="progress-bar" style="width: ${progress}%; background-color: #4caf50; height: 20px; border-radius: 5px;"></div>
            </div>
            <p>Progress: <b id="progress-number">${progress}%</b></p>
          `
                    });
                },
            });
            if (response?.status === 200) {
                Swal.close()
                saveAs(response?.data, getFileNameFromUrl(fileLink));
                Swal.fire('Done!', 'The download has been completed.', 'success');
            }
        } catch (error) {
            console.error('Error downloading the file:', error);
            Swal.fire('Error!', 'Failed to download the file.', error);
        } finally {
            setLoading(false);
        }

    };




    const getFileNameFromUrl = (url) => {
        const urlObj = new URL(url);
        return urlObj.pathname.split('/').pop();
    };

    const createNewClick = () => {
        setFileUrl(null)
        setFiles([])
        setIsMergeActive(false)
        setSizeOfFile(null)
    }


    return (
        <div className='relative w-full p-5 sm:p-10'>
            <Toaster position='top-center' richColors />

            <div className='flex justify-between'>
                <div>
                    <p className='font-semibold text-gray-800 sm:text-lg lg:text-2xl'>{employee?.name}</p>
                    <p className='text-sm text-gray-700 lg:text-lg'>{employee?.department}</p>
                </div>
                {isFileExist && !fileUrl &&
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


            {!fileUrl &&
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
                                    <div key={file?.name} className=" max-w-36 sm:max-w-44">
                                        <div className='flex justify-end mb-2'>
                                            <IoMdCloseCircleOutline onClick={() => handleRemoveFile(file?.name, index)} className="text-lg text-red-600 duration-300 ease-in-out rounded-full cursor-pointer hover:scale-110" />
                                        </div>
                                        <div className={`h-48 p-1 overflow-hidden border-2 rounded-md cursor-pointer  bg-slate-300 w-36 sm:w-44 sm:h-52 no-scrollbar ${previewData?.name === file?.name ? 'border-blue-600  shadow-xl' : 'border-slate-300  shadow-lg'}`}
                                            onClick={(e) => sideViewSetHandler(e, file)}
                                        >

                                            {file?.preview?.type === 'image' ? (
                                                <img src={file?.preview?.data} alt={file?.name} className="object-cover w-full h-full rounded-md" />
                                            ) : file?.preview?.type === 'pdf' ? (
                                                // <iframe src={`${file?.preview?.data}#toolbar=0&navpanes=0`} className="w-40 cursor-pointer no-scrollbar" height="100%" title={file?.name}></iframe>
                                                <div className="relative w-40 cursor-pointer" style={{ height: "100%" }}>
                                                    {/* Iframe Content */}
                                                    <iframe
                                                        src={`${file?.preview?.data}#toolbar=0&navpanes=0&scrollbar=0`}
                                                        className="w-full h-full rounded-md"
                                                        title={file?.name}
                                                    ></iframe>

                                                    {/* Transparent Overlay for Click Handling */}
                                                    <div
                                                        onClick={(e) => sideViewSetHandler(e, file)}
                                                        className="absolute top-0 left-0 w-full h-full"
                                                        style={{ backgroundColor: "transparent" }}
                                                    ></div>
                                                </div>
                                            ) : file?.preview?.type === 'table' ? (
                                                <div className="h-full overflow-auto border rounded-md">
                                                    <table className="min-w-full text-xs text-left text-gray-600 bg-white ">
                                                        <tbody>
                                                            {file?.preview?.data?.map((row, rowIndex) => (
                                                                <tr key={rowIndex}>
                                                                    {row.map((cell, cellIndex) => (
                                                                        <td key={cellIndex} className="px-2 py-1 border">
                                                                            {cell}
                                                                        </td>
                                                                    ))}
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            ) : file?.preview?.type === 'text' ? (
                                                <pre className="p-2 overflow-auto text-sm bg-gray-100 rounded-md max-h-40">
                                                    {file?.preview?.data}
                                                </pre>
                                            ) : (
                                                <img src={file?.preview?.data || unknownImage} alt={file?.name} className="object-cover w-full h-full rounded-md" />
                                            )}
                                        </div>
                                        <p className="px-3 py-1 text-xs truncate">{file?.name}</p>

                                        <select
                                            value={selectedName[index]}
                                            onChange={(e) => handleRenameFile(file?.name, e.target.value)}
                                            className='px-2 py-1 mt-3 text-sm border rounded-sm w-36 sm:w-44 bg-blue-50'
                                        >
                                            <option key={index} value="">Select Document Type</option>

                                            {typeData?.map((value, index) => (
                                                <option key={index} value={value?.name}>{value?.name}</option>)
                                            )}

                                        </select>

                                    </div>
                                ))}
                            </div>
                            {/* Download ZIP Button */}
                            <div className="flex flex-col items-center justify-center px-5 mt-20 gap-7 md:gap-10 md:flex-row lg:px-40 xl:px-60">
                                <GlobalButton type="button" Text="Download renamed files into ZIP" onClick={handleDownloadZip} />
                                <GlobalButton type="button" disabled={!isMergeActive} Text="Convert and merge all documents" onClick={convertAndMergeHandler} />
                            </div>
                        </div>
                    )}
                </div>
            }
            {fileUrl &&
                <div className='w-full min-h-[65vh]  items-center flex flex-col  mt-10 gap-10 justify-center'>
                    <div className="w-40 2xl:w-64 2xl:h-64 xl:w-60 xl:h-60 sm:w-52 lg:h-52">
                        <div className="w-full h-full px-2 py-2 overflow-hidden bg-gray-200 border border-gray-300 rounded-md shadow-md">
                            <iframe
                                src={`${fileUrl}#toolbar=0&navpanes=0`}
                                className="w-full lg:h-full "
                                title={'Merged Pdf'}
                            ></iframe>
                        </div>
                    </div>

                    <div className='text-center' >
                        <p className='text-lg font-semibold text-gray-800 sm:text-xl'>Successfully converted & merged</p>
                        <p className='text-sm text-gray-600 sm:text-base'>The file size is <span className={formatFileSizeNumber(sizeOfFile) < 10 ? 'font-semibold text-green-700' : 'text-orange-700 font-semibold'}>{formatFileSize(sizeOfFile)}</span>  size. Do you want to compress?</p>
                    </div>
                    <div className="flex flex-col items-center justify-center w-full px-5 mt-10 gap-7 md:gap-10 md:flex-row lg:px-40 xl:px-60">
                        <GlobalButton type="button" disabled={formatFileSizeNumber(sizeOfFile) < 10 || loading ? true : false} Text="Yes, I want to compress" onClick={() => compressFileHandler(fileUrl)} />
                        <GlobalButton type="button" Text="No, download this version" onClick={() => handleDownload(fileUrl)} disabled={loading} />
                    </div>
                    {formatFileSizeNumber(sizeOfFile) < 10 && <p className='text-xs text-green-600 '>{`You can only compress the file if the size is more than 10 Mb`}</p>}
                    <button type="button" className='py-1 mt-10 text-xs border-2 rounded-full sm:text-sm px-7 border-emerald-500 text-emerald-500 hover:bg-emerald-500 hover:text-white' onClick={createNewClick} >Create New </button>

                </div>
            }

            {previewData && <SidePreview previewData={previewData} isRight={isRight} unknownImage={unknownImage} topPosition={topPosition} onCloseClick={() => setPreviewData(null)} />}
        </div>
    );
}

export default DragAndDrop;
