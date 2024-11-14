import React from 'react';
import { IoMdArrowDropright } from 'react-icons/io';
import { Link } from 'react-router-dom';

function Breadcrumbs({ paths }) {
    console.log(paths)
    return (
        <nav className="" aria-label="breadcrumb">
            <ul className="flex items-center gap-1 ">
                {paths?.map((path, index) => (
                    <li key={index} className={`text-gray-500 font-semibold text-sm ${index === paths.length - 1 ? 'text-gray-700' : ''}`}>
                        {index === paths.length - 1 ? (
                            <p>{path.label}</p>
                        ) : (
                            <Link to={path.link} >
                                <p className='flex items-center'>
                                    <span>{path.label}</span> <span><IoMdArrowDropright className='text-lg mt-[2px]' /></span>
                                </p>
                            </Link>
                        )}
                    </li>
                ))}
            </ul>
        </nav>
    );
};

export default Breadcrumbs;
