import Dropdown from "../common/inputFields/DropDown";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { IoMdCloseCircleOutline } from "react-icons/io";
import { RxDragHandleDots2 } from "react-icons/rx";
import unknownImage from '../../assets/other/documents.png'



function SortableItem({ file, index, handleRemoveFile, sideViewSetHandler, handleRenameFile, selectedName, typeData, previewData, isOpen, setIsOpen }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: file?.name });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 1000 : "auto",
        position: isDragging ? "relative" : "static",
    };

    return (
        <div ref={setNodeRef} style={style} className="max-w-36 sm:max-w-44">
            {/* File Header: Close Button & Drag Handle */}
            <div className='flex justify-between mb-2'>
                {/* Drag Handle (Only this can be dragged) */}
                <span {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
                    <RxDragHandleDots2 className="text-xl text-gray-500 hover:text-gray-700" />
                </span>

                {/* Close Button */}
                <IoMdCloseCircleOutline
                    onClick={() => handleRemoveFile(file?.name, index)}
                    className="text-lg text-red-600 duration-300 ease-in-out rounded-full cursor-pointer hover:scale-110"
                />

            </div>

            {/* File Preview */}
            <div
                className={`h-48 p-1 overflow-hidden border-2 rounded-md cursor-pointer bg-slate-300 w-36 sm:w-44 sm:h-52 no-scrollbar ${previewData?.name === file?.name ? 'border-blue-600 shadow-xl' : 'border-slate-300 shadow-lg'
                    }`}
                onClick={(e) => sideViewSetHandler(e, file)}
            >
                {file?.preview?.type === 'image' ? (
                    <img src={file?.preview?.data} alt={file?.name} className="object-cover w-full h-full rounded-md" />
                ) : file?.preview?.type === 'pdf' ? (
                    <div className="relative w-40 cursor-pointer" style={{ height: "100%" }}>
                        <iframe
                            src={`${file?.preview?.data}#toolbar=0&navpanes=0&scrollbar=0`}
                            className="w-full h-full rounded-md"
                            title={file?.name}
                        ></iframe>
                        <div onClick={(e) => sideViewSetHandler(e, file)} className="absolute top-0 left-0 w-full h-full"></div>
                    </div>
                ) : file?.preview?.type === 'table' ? (
                    <div className="w-full h-full overflow-auto bg-white border rounded-md">
                        <table className="w-full h-full text-sm text-left text-gray-700">
                            <tbody>
                                {file?.preview?.data?.map((row, rowIndex) => (
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
                ) : file?.preview?.type === 'text' ? (
                    <pre className="h-full p-2 overflow-auto text-sm bg-gray-100 rounded-md ">
                        {file?.preview?.data}
                    </pre>
                ) : (
                    <img src={file?.preview?.data || unknownImage} alt={file?.name} className="object-cover w-full h-full rounded-md" />
                )}
            </div>

            {/* File Name */}
            <p className="px-3 py-1 text-xs truncate">{file?.name}</p>

            {/* File Type Dropdown */}
            <Dropdown
                options={typeData}
                selectedValue={selectedName[index]}
                onChange={(value) => handleRenameFile(file?.name, value)}
                isOpen={isOpen}
                setIsOpen={setIsOpen}
                index={index}
            />
        </div>
    );
};

export default SortableItem