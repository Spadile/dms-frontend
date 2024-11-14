"use client";

import { useState } from "react";


function PaginationReport({ totalPages, setPage, setPageLimit }) {

    const [currentPage, setCurrentPage] = useState(1);
    const [limit, setLimit] = useState(15);


    // Function to handle page change
    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page)
            setPage(page);
        }
    };

    const handleLimitChange = (e) => {
        const newLimit = e.target.value;
        setLimit(newLimit);
        setPageLimit(newLimit);
    }

    const getDisplayedPages = () => {
        if (totalPages <= 4) return Array.from({ length: totalPages }, (_, i) => i + 1);
        const start = Math.max(2, currentPage - 1);
        const end = Math.min(totalPages - 1, currentPage + 1);
        const pages = [1, ...(start > 2 ? ["..."] : []), ...Array.from({ length: end - start + 1 }, (_, i) => start + i), ...(end < totalPages - 1 ? ["..."] : []), totalPages];
        return pages;
    };


    return (
        <nav aria-label="Page navigation example" className="flex justify-start gap-5 mt-5 font-semibold">
            <ul className="inline-flex -space-x-px text-sm">
                {/* Previous Button */}
                <li>
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        className={`flex items-center justify-center px-3 h-8 leading-tight border border-e-0 border-slate-300 rounded-s-lg ${currentPage === 1 ? "text-slate-300" : "text-slate-500 hover:bg-slate-200 hover:text-slate-700"
                            }`}
                        disabled={currentPage === 1}
                    >
                        Previous
                    </button>
                </li>


                {getDisplayedPages().map((page, index) => (
                    <li key={index}>
                        {page === "..." ? (
                            <span className="flex items-center justify-center h-6 px-1 text-slate-400">...</span>
                        ) : (
                            <button
                                onClick={() => handlePageChange(page)}
                                className={`flex items-center justify-center px-3 h-8 leading-tight border border-slate-300 ${page === currentPage
                                    ? "text-blue-600 bg-blue-100 hover:bg-blue-100 hover:text-blue-700"
                                    : "text-slate-500 bg-white hover:bg-slate-100 hover:text-slate-700"
                                    }`}
                            >
                                {page}
                            </button>
                        )}
                    </li>
                ))}

                {/* Next Button */}
                <li>
                    <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        className={`flex items-center justify-center px-3 h-8 leading-tight border border-slate-300 rounded-e-lg ${currentPage === totalPages ? "text-slate-300" : "text-slate-500 hover:bg-slate-200 hover:text-slate-700"
                            }`}
                        disabled={currentPage === totalPages}
                    >
                        Next
                    </button>
                </li>


            </ul>
            <div className="flex items-center space-x-3">
                <span className="text-slate-700">limit:</span>
                <select
                    value={limit}
                    onChange={handleLimitChange}
                    className="px-3 py-1 border rounded-md border-slate-300 text-slate-700"
                >
                    <option value={10}>10</option>
                    <option value={15}>15</option>
                    <option value={20}>20</option>
                    <option value={25}>25</option>
                    <option value={30}>30</option>
                </select>
            </div>
        </nav>
    );
};

export default PaginationReport
