import { useState, useEffect } from 'react';
import { getDocuments, downloadDocument } from '../services/api';
import Pagination from './Pagination';

const DocumentList = ({ refreshTrigger }) => {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortOrder, setSortOrder] = useState('desc');
    const [currentPage, setCurrentPage] = useState(1);
    const [pagination, setPagination] = useState(null);
    const [downloading, setDownloading] = useState(null);

    const pageSize = 10;

    const fetchDocuments = async () => {
        setLoading(true);
        setError(null);

        try {
            const data = await getDocuments({
                page: currentPage,
                pageSize,
                sortOrder,
                searchQuery,
            });

            setDocuments(data.documents);
            setPagination(data.pagination);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch documents');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDocuments();
    }, [currentPage, sortOrder, refreshTrigger]);

    const handleSearch = (e) => {
        e.preventDefault();
        setCurrentPage(1); // Reset to first page on new search
        fetchDocuments();
    };

    const handleDownload = async (doc) => {
        setDownloading(doc.id);
        try {
            await downloadDocument(doc.id, doc.filename);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to download document');
        } finally {
            setDownloading(null);
        }
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString();
    };

    if (loading && documents.length === 0) {
        return (
            <div className="document-list">
                <div className="loading">
                    <div className="spinner"></div>
                    <p>Loading documents...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="document-list">
            <h2>📂 Documents</h2>

            <div className="list-controls">
                <form onSubmit={handleSearch} className="search-form">
                    <input
                        type="text"
                        placeholder="Search by title..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="search-input"
                    />
                    <button type="submit" className="search-button">
                        🔍 Search
                    </button>
                </form>

                <div className="sort-control">
                    <label htmlFor="sort">Sort by date:</label>
                    <select
                        id="sort"
                        value={sortOrder}
                        onChange={(e) => {
                            setSortOrder(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="sort-select"
                    >
                        <option value="desc">Newest First</option>
                        <option value="asc">Oldest First</option>
                    </select>
                </div>
            </div>

            {error && <div className="error-message">❌ {error}</div>}

            {documents.length === 0 ? (
                <div className="empty-state">
                    <p>📭 No documents found</p>
                    {searchQuery && <p>Try adjusting your search query</p>}
                </div>
            ) : (
                <>
                    <div className="documents-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>Title</th>
                                    <th>File Size</th>
                                    <th>Uploaded</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {documents.map((doc) => (
                                    <tr key={doc.id}>
                                        <td className="doc-title">{doc.title}</td>
                                        <td>{formatFileSize(doc.filesize)}</td>
                                        <td>{formatDate(doc.uploadedAt)}</td>
                                        <td>
                                            <button
                                                onClick={() => handleDownload(doc)}
                                                disabled={downloading === doc.id}
                                                className="download-button"
                                            >
                                                {downloading === doc.id ? 'Downloading...' : '⬇️ Download'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {pagination && pagination.totalPages > 1 && (
                        <Pagination
                            currentPage={currentPage}
                            totalPages={pagination.totalPages}
                            onPageChange={setCurrentPage}
                        />
                    )}

                    {pagination && (
                        <div className="pagination-info">
                            Showing {documents.length} of {pagination.total} documents
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default DocumentList;
