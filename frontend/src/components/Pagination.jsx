const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    const pages = [];

    // Generate page numbers
    for (let i = 1; i <= totalPages; i++) {
        // Show first page, last page, current page, and pages around current
        if (
            i === 1 ||
            i === totalPages ||
            (i >= currentPage - 1 && i <= currentPage + 1)
        ) {
            pages.push(i);
        } else if (pages[pages.length - 1] !== '...') {
            pages.push('...');
        }
    }

    return (
        <div className="pagination">
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="page-button"
            >
                ← Previous
            </button>

            {pages.map((page, index) => (
                page === '...' ? (
                    <span key={`ellipsis-${index}`} className="page-ellipsis">...</span>
                ) : (
                    <button
                        key={page}
                        onClick={() => onPageChange(page)}
                        className={`page-button ${currentPage === page ? 'active' : ''}`}
                    >
                        {page}
                    </button>
                )
            ))}

            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="page-button"
            >
                Next →
            </button>
        </div>
    );
};

export default Pagination;
