import React from 'react'

function Modal({ isOpen, onClose, title, children }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center w-full h-full overflow-y-auto bg-opacity-50 bg-gray-800">
            <div className="relative w-full max-w-xl p-4">
                <div className="relative py-2 bg-[#E0E0E0] rounded-lg shadow ">
                    <div id='modal-header' className="flex items-center justify-between p-4 border-b rounded-t border-slate-400 ">
                        <h3 className="font-semibold  sm:text-xl text-slate-800">{title}</h3>
                        <button
                            type="button"
                            className="inline-flex items-center justify-center w-8 h-8 text-sm bg-transparent rounded-lg text-slate-600 hover:bg-gray-200 hover:text-gray-900 ms-auto "
                            onClick={onClose}
                        >
                            <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 1l6 6m0 0l6 6M7 7l6-6M7 7l-6 6" />
                            </svg>
                            <span className="sr-only">Close modal</span>
                        </button>
                    </div>

                    <div className="p-4 space-y-4 md:p-5 max-h-[70vh] overflow-y-auto overflow-hidden no-scrollbar">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Modal
