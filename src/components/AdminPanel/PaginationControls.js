import React from 'react';

export default function PaginationControls({ current, total, onPageChange }) {
    const pages = Array.from({ length: total }, (_, i) => i + 1);
    return (
        <div className="d-flex justify-content-between align-items-center mt-3">
            <small>Page {current} of {total}</small>
            <nav>
                <ul className="pagination mb-0">
                    <li className={`page-item ${current === 1 ? 'disabled' : ''}`}>
                        <button className="page-link" onClick={() => onPageChange(current - 1)} disabled={current === 1}>Previous</button>
                    </li>
                    {pages.map(page => (
                        <li key={page} className={`page-item ${current === page ? 'active' : ''}`}>
                            <button className="page-link" onClick={() => onPageChange(page)}>{page}</button>
                        </li>
                    ))}
                    <li className={`page-item ${current === total ? 'disabled' : ''}`}>
                        <button className="page-link" onClick={() => onPageChange(current + 1)} disabled={current === total}>Next</button>
                    </li>
                </ul>
            </nav>
        </div>
    );
}