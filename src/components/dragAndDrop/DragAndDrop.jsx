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
import { compressFilesApi, getFileSize, mergeFilesApi } from '../../api/mainAPi';
import { toast, Toaster } from 'sonner';
import Swal from 'sweetalert2';
import axiosInstance from '../../utils/axiosInstance';
import { convertToUnderscore, formatFileSize, formatFileSizeNumber } from '../../utils/functions';
import { getFileTypeApi } from '../../api/adminApi';
import * as XLSX from 'xlsx';
import mammoth from 'mammoth';


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

    const [progress, setProgress] = useState(0);

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
            updateIsFileExist(false);
        }
    }, [files, updateIsFileExist]);

    useEffect(() => {
        if (files?.length === 0) {
            setIsMergeActive(false)
        }
        return () => files?.forEach((file) => URL.revokeObjectURL(file.preview));
    }, [files]);


    const fetchFileTypes = async () => {
        try {
            const types = await getFileTypeApi()
            setTypeData(types?.document_types)
        } catch (error) {
            console.log(error.message)
        }

    }

    // const generatePreview = (file) => {

    //     if (file.type.startsWith('image/')) {
    //         return URL.createObjectURL(file);
    //     } else if (file.type === 'application/pdf') {
    //         return URL.createObjectURL(file);
    //     } else if (
    //         file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || // .xlsx
    //         file.type === 'application/vnd.ms-excel' || // .xls 
    //         file.type === 'text/csv'
    //     ) {
    //         return excelImage; // Placeholder for Excel files
    //     } else {
    //         return unknownImage; // Generic placeholder
    //     }
    // };


    const generatePreview = async (file) => {
        if (file.type.startsWith('image/')) {
            // Preview for images
            return { type: 'image', data: URL.createObjectURL(file) };
        } else if (file.type === 'application/pdf') {
            // Preview for PDFs
            return { type: 'pdf', data: URL.createObjectURL(file) };
        } else if (
            file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || // .xlsx
            file.type === 'application/vnd.ms-excel' || // .xls
            file.type === 'application/vnd.ms-excel.sheet.macroEnabled.12' || // .xlsm
            file.type === 'application/vnd.oasis.opendocument.spreadsheet' || // .ods
            file.type === 'text/csv'
        ) {
            // Parse Excel or CSV files
            const data = await parseExcelOrCSV(file);
            return { type: 'table', data }; // Return as table data
        } else if (
            file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || // .docx
            file.type === 'application/msword' || // .doc
            file.type === 'text/plain' // .txt
        ) {
            // Parse Word or text files
            const data = await parseDocument(file);
            return { type: 'text', data }; // Return as text content
        } else {
            // Fallback for unknown formats
            return { type: 'unknown', data: unknownImage };
        }
    };


    const parseExcelOrCSV = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const binary = e.target.result;
                const workbook = XLSX.read(binary, { type: 'binary' });
                const sheetName = workbook.SheetNames[0];
                const sheet = workbook.Sheets[sheetName];
                const data = XLSX.utils.sheet_to_json(sheet, { header: 1 }); // 2D array of data
                resolve(data);
            };
            reader.onerror = () => reject(reader.error);
            reader.readAsBinaryString(file);
        });
    };


    // const parseDocument = (file) => {
    //     return new Promise((resolve, reject) => {
    //         const reader = new FileReader();
    //         reader.onload = async (e) => {
    //             const content = e.target.result;
    //             if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    //                 // Parse .docx files
    //                 const { value } = await mammoth.extractRawText({ arrayBuffer: content });
    //                 resolve(value); // Extracted text
    //             } else {
    //                 // Parse .txt or .doc (basic text)
    //                 resolve(content);
    //             }
    //         };
    //         reader.onerror = () => reject(reader.error);
    //         reader.readAsArrayBuffer(file);
    //     });
    // };

    const parseDocument = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = async (e) => {
                const content = e.target.result;

                // Check if the file is a .docx file
                if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
                    // Parse .docx files using Mammoth
                    const { value } = await mammoth.extractRawText({ arrayBuffer: content });
                    resolve(value); // Extracted text from the .docx file
                } else if (file.type === 'text/plain') {
                    // For .txt files, read as text directly
                    resolve(content); // Content is a string already
                } else {
                    // For other types (like .doc), you can handle them as needed
                    resolve(content);
                }
            };

            reader.onerror = () => reject(reader.error);

            // Use readAsText for .txt files and readAsArrayBuffer for .docx files or other formats
            if (file.type === 'text/plain') {
                reader.readAsText(file); // Read text files as plain text
            } else {
                reader.readAsArrayBuffer(file); // Read .docx and other files as array buffers
            }
        });
    };


    // const onDrop = useCallback(async (acceptedFiles) => {
    //     setFiles(acceptedFiles.map(async (file) => Object.assign(file, {
    //         preview: await generatePreview(file)
    //     })));
    // }, []);

    const onDrop = useCallback(async (acceptedFiles) => {
        const resolvedFiles = await Promise.all(
            acceptedFiles.map(async (file) =>
                Object.assign(file, {
                    preview: await generatePreview(file),
                })
            )
        );
        setFiles(resolvedFiles); // Set resolved files in the state
    }, []);

    const { getRootProps, getInputProps, isDragActive, open } = useDropzone({ onDrop, noClick: true });

    // const handleManualUpload = (event) => {
    //     const selectedFiles = Array.from(event.target.files).map(async (file) =>
    //         Object.assign(file, {
    //             preview: await generatePreview(file),
    //         })
    //     );
    //     setFiles((prevFiles) => [...prevFiles, ...selectedFiles]);
    //     setIsMergeActive(false)
    // };

    const handleManualUpload = async (event) => {
        const selectedFilesPromises = Array.from(event.target.files).map(async (file) =>
            Object.assign(file, {
                preview: await generatePreview(file),
            })
        );

        const resolvedFiles = await Promise.all(selectedFilesPromises); // Resolve all promises
        setFiles((prevFiles) => [...prevFiles, ...resolvedFiles]); // Update state with resolved files
        setIsMergeActive(false);
    };

    const handleRemoveFile = (fileName, i) => {
        setFiles((prevFiles) => prevFiles.filter((file) => file.name !== fileName));
        setSelectedName((prev) => prev.filter((_, index) => index !== i));
    };

    // const handleRenameFile = (fileName, newName) => {
    //     setFiles((prevFiles) =>
    //         prevFiles.map(async (file, i) => {
    //             if (file.name === fileName) {

    //                 // Get the file extension
    //                 const fileExtension = file?.name?.split('.').pop();

    //                 // If the new name does not have an extension, add the original extension
    //                 const renamedFileName = newName?.endsWith(`.${fileExtension}`)
    //                     ? newName
    //                     : `${newName}_${employee?.name}_${employee?.department}_${i}.${fileExtension}`;

    //                 // Create a new File object while preserving all native properties (type, lastModified)
    //                 const renamedFile = new File([file], renamedFileName, {
    //                     type: file.type,
    //                     lastModified: file.lastModified,
    //                 });

    //                 // Manually preserve custom properties from the original file


    //                 const preview = await generatePreview(renamedFile);
    //                 console.log('preview', preview)
    //                 renamedFile.preview = preview;
    //                 renamedFile.path = file.path;
    //                 renamedFile.relativePath = file.relativePath;
    //                 // for namve view in dropdown
    //                 setSelectedName((prev) => {
    //                     const newArr = [...prev];
    //                     newArr[i] = newName; // Replace value at index i
    //                     return newArr;
    //                 });
    //                 return renamedFile; // Return the new File object with the new name and preserved properties
    //             }
    //             return file; // No changes to other files
    //         })
    //     );
    // };

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
        setProgress(0);

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
                    // console.log(`Progress: ${progress}%`);
                    setProgress(progress);
                    // Update SweetAlert2 dynamically
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
            Swal.fire('Error!', 'Failed to download the file.', 'error');
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
                                        <div className="h-48 px-1 py-1 overflow-hidden border rounded-md shadow-lg border-slate-300 bg-slate-300 w-36 sm:w-44 sm:h-52 no-scrollbar"
                                            onMouseEnter={(e) => sideViewSetHandler(e, file)}
                                            onMouseLeave={() => setPreviewData(null)}>

                                            {/* {file.type.startsWith('image/') ? (
                                                <img src={file?.preview} alt={file?.name} className="object-cover w-full h-full rounded-md" />
                                            ) : file.type === 'application/pdf' ? (
                                                <iframe src={file?.preview} className="w-40 no-scrollbar" height='100%' title={file.name}></iframe>
                                            ) : (
                                                <img src={file?.preview} alt={file?.name} className="object-cover w-full h-full rounded-md" />
                                            )} */}
                                            {file?.preview?.type === 'image' ? (
                                                <img src={file?.preview?.data} alt={file?.name} className="object-cover w-full h-full rounded-md" />
                                            ) : file?.preview?.type === 'pdf' ? (
                                                <iframe src={`${file?.preview?.data}#toolbar=0&navpanes=0`} className="w-40 no-scrollbar" height="100%" title={file?.name}></iframe>
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

            {/* {previewData &&
                <div className={` top-0 ${isRight ? 'left-0' : 'right-0'} z-[100] fixed max-h-screen hidden lg:inline-block px-3 py-3 overflow-hidden bg-gray-200 border border-gray-300 rounded-md shadow-md w-[30vw] h-full no-scrollbar`}>
                    {previewData?.type.startsWith('image/') ? (
                        <img src={previewData?.preview} alt={previewData?.name} className="object-cover w-full h-auto rounded-md" />
                    ) : previewData?.type === 'application/pdf' ? (
                        <iframe src={previewData?.preview} className="w-full no-scrollbar" height='100%' title={previewData?.name}></iframe>
                    ) : (
                        <img src={previewData?.preview} alt={previewData?.name} className="object-cover w-full h-auto rounded-md" />
                    )}
                </div>} */}

            {previewData && (
                <div
                    className={`top-0 ${isRight ? 'left-0' : 'right-0'} z-[100] fixed max-h-screen hidden lg:inline-block px-2 py-2 overflow-hidden bg-gray-200 border border-gray-300 rounded-md shadow-md w-[35vw] h-full no-scrollbar`}
                >
                    {previewData.preview.type === 'image' ? (
                        <img
                            src={previewData.preview.data}
                            alt={previewData.name}
                            className="object-cover w-full h-auto rounded-md"
                        />
                    ) : previewData.preview.type === 'pdf' ? (
                        <iframe
                            src={`${previewData.preview.data}#toolbar=0&navpanes=0&scrollbar=0`}
                            className="w-full no-scrollbar"
                            height="100%"
                            title={previewData.name}
                        ></iframe>
                    ) : previewData.preview.type === 'table' ? (
                        <div className="max-h-full overflow-auto bg-white border rounded-md">
                            <table className="min-w-full text-sm text-left text-gray-500">
                                <tbody>
                                    {previewData.preview.data.map((row, rowIndex) => (
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
                    ) : previewData.preview.type === 'text' ? (
                        <pre className="max-h-full p-2 overflow-auto text-sm bg-gray-100 rounded-md">
                            {previewData.preview.data}
                        </pre>
                    ) : (
                        <div className="p-4 text-center">
                            <p className="text-gray-500">Unsupported file type</p>
                            <img
                                src={unknownImage} // Placeholder for unsupported file types
                                alt="Unsupported"
                                className="object-cover w-full h-auto rounded-md"
                            />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default DragAndDrop;
