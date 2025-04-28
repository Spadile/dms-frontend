import React, { useCallback, useEffect, useState } from 'react';
import { throttle } from 'lodash';
import { useDropzone } from 'react-dropzone';
import GlobalButton from '../common/buttons/GlobalButton';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { useStore } from '../../store/store';
import unknownImage from '../../assets/other/documents.png'
import { useNavigate } from 'react-router-dom';
import { compressFilesApi, getFileSize, mergeFilesApi } from '../../api/mainAPi';
import { toast, Toaster } from 'sonner';
import Swal from 'sweetalert2';
import axiosInstance from '../../utils/axiosInstance';
import { convertToUnderscore, formatFileSize, formatFileSizeNumber, renameFiles } from '../../utils/functions';
import { getFileTypeApi } from '../../api/adminApi';
import { ALLOWED_DATA_EXTENSIONS } from '../../utils/constants';
import SidePreview from './SidePreview';
import { generatePreview } from '../../utils/generatePreview';

import { DndContext, closestCenter } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import SortableItem from './SortableItem';


function DragAndDrop() {
    const navigate = useNavigate()

    const employee = useStore((state) => state.employee);
    const isFileExist = useStore((state) => state.isFileExist);
    const updateIsFileExist = useStore((state) => state.updateIsFileExist);

    const [files, setFiles] = useState([]);
    const [selectedName, setSelectedName] = useState([]);
    const [previewData, setPreviewData] = useState(null)
    const [isRight, setIsRight] = useState(null)
    const [isMergeActive, setIsMergeActive] = useState(false)
    const [fileUrl, setFileUrl] = useState(null)
    const [sizeOfFile, setSizeOfFile] = useState(null)
    const [typeData, setTypeData] = useState([])
    const [loading, setLoading] = useState(false)
    const [topPosition, setTopPosition] = useState(0);
    const [isRemoving, setIsRemoving] = useState(false);

    useEffect(() => {
        const handleScroll = throttle(() => {
            setTopPosition(window.scrollY);
        }, 200);

        window.addEventListener("scroll", handleScroll, { passive: true });

        return () => {
            window.removeEventListener("scroll", handleScroll);
            handleScroll.cancel(); // Cancel pending throttled calls
        };
    }, []);

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


    const onDragEnd = async (event) => {
        if (isRemoving || isMergeActive || files?.length <= 1) return;

        const { active, over } = event;
        if (!active || !over || active.id === over.id) return;

        // Find indexes of dragged file and target position
        const oldIndex = files.findIndex((file) => file.name === active.id);
        const newIndex = files.findIndex((file) => file.name === over.id);

        if (oldIndex !== -1 && newIndex !== -1) {
            // Move file within the array
            const updatedFiles = arrayMove(files, oldIndex, newIndex);

            // Rename files based on new order
            const renamedFiles = await renameFiles(updatedFiles);

            setFiles(renamedFiles);

            // Reorder and update selected names dropdown
            setSelectedName((prevNames) => {
                return arrayMove(prevNames, oldIndex, newIndex);
            });
        }
    };




    const fetchFileTypes = async () => {
        try {
            const { document_types } = await getFileTypeApi()
            const formattedData = document_types?.map(item => ({
                id: item.id,
                value: item.name,
                label: item.name
            }));
            setTypeData(formattedData || [])
        } catch (error) {
            console.log(error.message)
        }

    }


    const onDrop = useCallback(async (acceptedFiles) => {
        setIsRemoving(true);

        const resolvedFiles = await Promise.all(
            acceptedFiles?.map(async (file, i) => {
                const fileExtension = file.name.split('.').pop(); // Extract extension
                const fileBaseName = file.name.replace(/\.[^/.]+$/, ""); // Remove extension from name

                const renamedFileName = `${i + 1}_${fileBaseName}_${employee?.name}.${fileExtension}`;

                // Convert to ArrayBuffer for correct binary handling
                const fileContent = await file.arrayBuffer();
                const renamedFile = new File([fileContent], renamedFileName, {
                    type: file.type,
                    lastModified: file.lastModified,
                });

                const preview = await generatePreview(renamedFile);

                return {
                    originalFile: file, // Keep a reference to the original file
                    renamedFile, // Store the new renamed File object
                    preview,
                    path: file.path ?? `./${renamedFileName}`,
                    relativePath: file.relativePath ?? `./${renamedFileName}`,
                    lastModified: file.lastModified,
                    lastModifiedDate: new Date(file.lastModified),
                    size: file.size,
                    type: file.type,
                    name: renamedFileName,
                };
            })
        );

        if (isFileAllowed(resolvedFiles)) {
            setFiles(resolvedFiles);
        }

        setTimeout(() => {
            setIsRemoving(false);
        }, 2000);
    }, [employee?.name]);


    const { getRootProps, getInputProps, isDragActive, open } = useDropzone({ onDrop, noClick: true });


    const handleManualUpload = async (event) => {
        setIsRemoving(true);

        const existingFileCount = files?.length || 0; // Get the current number of files safely

        const selectedFilesPromises = Array.from(event.target.files)?.map(async (file, i) => {
            const fileExtension = file.name.split('.').pop(); // Extract extension
            const fileBaseName = file.name.replace(/\.[^/.]+$/, ""); // Remove extension from name

            // Start numbering from the existing file count + 1
            const renamedFileName = `${existingFileCount + i + 1}_${fileBaseName}_${employee?.name}.${fileExtension}`;

            // Convert to ArrayBuffer for binary handling
            const fileContent = await file.arrayBuffer();
            const renamedFile = new File([fileContent], renamedFileName, {
                type: file.type,
                lastModified: file.lastModified,
            });

            // Generate a preview of the renamed file
            const preview = await generatePreview(renamedFile);

            return {
                originalFile: file, // Store original file for reference
                renamedFile, // Store the new renamed file object
                preview,
                path: file.path ?? `./${renamedFileName}`,
                relativePath: file.relativePath ?? `./${renamedFileName}`,
                lastModified: file.lastModified,
                lastModifiedDate: new Date(file.lastModified),
                size: file.size,
                type: file.type,
                name: renamedFileName,
            };
        });

        const resolvedFiles = await Promise.all(selectedFilesPromises); // Resolve all file promises

        event.target.value = null; // Reset input field

        if (isFileAllowed(resolvedFiles)) {
            setFiles((prevFiles) => [...prevFiles, ...resolvedFiles]); // Append new files to state
        }

        setTimeout(() => {
            setIsRemoving(false);
        }, 2000);

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

    const handleRemoveFile = async (fileName, i) => {
        setIsRemoving(true);

        // Filter out the removed file
        const filesAfterRemoval = files?.filter((file) => file.name !== fileName);

        // Resolve renamed files
        const renamedFileData = await renameFiles(filesAfterRemoval);
        setFiles(renamedFileData);

        // Update selected names dropdown
        setSelectedName((prev) => prev.filter((_, index) => index !== i));

        setTimeout(() => {
            setIsRemoving(false);
        }, 2000);
    };



    const handleRenameFile = async (fileName, newName) => {
        setIsRemoving(true);

        const updatedFiles = await Promise.all(
            files?.map(async (file, i) => {
                if (file?.name === fileName) {
                    // Get the file extension
                    const fileExtension = file?.name.split('.').pop();
                    const fileBaseName = file.name.replace(/\.[^/.]+$/, ""); // Remove extension

                    // Ensure the new name has the correct extension
                    const renamedFileName = newName?.endsWith(`.${fileExtension}`)
                        ? newName
                        : `${i + 1}_${newName}_${employee?.name}.${fileExtension}`;

                    // Extract content safely
                    let fileContent;
                    if (file instanceof File) {
                        fileContent = await file.arrayBuffer();
                    } else if (file.originalFile instanceof File) {
                        fileContent = await file.originalFile.arrayBuffer();
                    } else {
                        console.error("Invalid file format:", file);
                        return file; // Return original if not valid
                    }

                    // Create a new renamed File object
                    const renamedFile = new File([fileContent], renamedFileName, {
                        type: file.type,
                        lastModified: file.lastModified,
                    });

                    // Update the dropdown-selected name
                    setSelectedName((prev) => {
                        const newArr = [...prev];
                        newArr[i] = newName; // Replace value at index i
                        return newArr;
                    });

                    return {
                        ...file, // Preserve other properties
                        ...renamedFile, // Overwrite properties with the new File object
                        preview: file.preview, // Preserve preview
                        path: `./${renamedFileName}`,
                        relativePath: `./${renamedFileName}`,
                        name: renamedFileName, // Ensure the correct name is set
                    };
                }
                return file; // Return unchanged files
            })
        );

        setFiles(updatedFiles);

        setTimeout(() => {
            setIsRemoving(false);
        }, 2000);
    };



    const handleDownloadZip = async () => {
        if (!files || files.length === 0) {
            console.error("No files to download");
            return;
        }
        const zip = new JSZip();

        for (const fileObj of files) {
            try {
                const file = fileObj.renamedFile || fileObj.originalFile; // Use the renamed file if available
                if (file instanceof File) {
                    const fileContent = await file.arrayBuffer(); // Ensure binary integrity
                    zip.file(fileObj.name, fileContent, { binary: true });
                } else {
                    console.error(`Invalid file: ${file}`);
                }
            } catch (error) {
                console.error(`Error processing file ${fileObj.name}:`, error);
            }
        }

        // Generate and download the zip file
        const content = await zip.generateAsync({ type: "blob" });
        saveAs(content, "uploaded-files.zip");
        setIsMergeActive(true);
    };




    const convertAndMergeHandler = async () => {
        if (!isFileAllowed(files)) {
            return;
        }

        const formData = new FormData();
        formData.append("name", convertToUnderscore(employee?.name));
        formData.append("department", convertToUnderscore(employee?.department));

        files?.forEach((fileObj, index) => {
            if (fileObj.renamedFile) {
                formData.append("files", fileObj.renamedFile);
            } else {
                console.error(`File at index ${index} is missing 'renamedFile' property`);
            }
        });

        try {
            Swal.fire({
                title: "loading...",
                allowEscapeKey: false,
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                },
            });

            const response = await mergeFilesApi(formData);

            if (response?.status === 200) {
                Swal.close();
                toast.success("Successfully merged files");
                setFileUrl(response?.data?.file_url);

                const size = await getFileSize(response?.data?.file_url);
                if (size) {
                    setSizeOfFile(Number(size));
                }
            }
        } catch (error) {
            Swal.close();
            console.log(error?.message);
        } finally {
            Swal.close();
        }
    };

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
        // const preview = await generatePreview(file);
        setPreviewData({ name: file.name, type: file.type, preview: file?.preview })
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
        navigate('/')
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
                    {files?.length > 0 ? (
                        <div className="w-full mt-2 min-h-[65vh]">
                            <DndContext collisionDetection={closestCenter} onDragEnd={onDragEnd}>
                                <SortableContext items={files.map((file) => file.name)} strategy={verticalListSortingStrategy}>
                                    <div className="z-10 flex flex-wrap gap-6">
                                        {files?.map((file, index) => (
                                            <SortableItem
                                                key={file?.name}
                                                file={file}
                                                index={index}
                                                handleRemoveFile={handleRemoveFile}
                                                sideViewSetHandler={sideViewSetHandler}
                                                handleRenameFile={handleRenameFile}
                                                selectedName={selectedName}
                                                typeData={typeData}
                                                previewData={previewData}
                                            />
                                        ))}
                                    </div>
                                </SortableContext>
                            </DndContext>

                            {/* Download ZIP Button */}
                            <div className="z-0 flex flex-col items-center justify-center px-5 pt-2 mt-32 gap-7 md:gap-10 md:flex-row lg:px-40 xl:px-60">
                                <GlobalButton type="button" Text="Download renamed files into ZIP" onClick={handleDownloadZip} />
                                <GlobalButton type="button" disabled={!isMergeActive} Text="Convert and merge all documents" onClick={convertAndMergeHandler} />
                            </div>
                        </div>
                    ) :
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
                        <GlobalButton type="button" Text="Yes, I want to compress" disabled={formatFileSizeNumber(sizeOfFile) < 10 || loading ? true : false} onClick={() => compressFileHandler(fileUrl)} />
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
