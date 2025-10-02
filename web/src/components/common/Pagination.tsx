import React from 'react';

export const Pagination: React.FC<{ itemsPerPage: number; totalItems: number; paginate: (pageNumber: number) => void; currentPage: number; }> = ({ itemsPerPage, totalItems, paginate, currentPage }) => {
    const pageNumbers = Array.from({ length: Math.ceil(totalItems / itemsPerPage) }, (_, i) => i + 1);
    if (pageNumbers.length <= 1) return null;
    return (
        <nav className="pagination-container">
            <ul className="pagination-list">
                {pageNumbers.map(number => (
                    <li key={number} className={`pagination-item ${currentPage === number ? 'active' : ''}`}>
                        <button onClick={() => paginate(number)} className="pagination-link">{number}</button>
                    </li>
                ))}
            </ul>
        </nav>
    );
};