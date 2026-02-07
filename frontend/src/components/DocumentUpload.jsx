import { useState } from 'react';
import { uploadDocuments } from '../services/api';

const DocumentUpload = ({ onUploadSuccess }) => {
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const handleFileSelect = (e) => {
        const files = Array.from(e.target.files);
        // Add new files to existing selection instead of replacing
        setSelectedFiles(prevFiles => [...prevFiles, ...files]);
        setError(null);
        setSuccess(false);
        // Reset the input so the same file can be selected again if needed
        e.target.value = '';
    };

    const removeFile = (indexToRemove) => {
        setSelectedFiles(prevFiles => prevFiles.filter((_, index) => index !== indexToRemove));
    };

    const handleUpload = async () => {
        if (selectedFiles.length === 0) {
            setError('Please select at least one file');
            return;
        }

        setUploading(true);
        setError(null);
        setSuccess(false);

        try {
            const result = await uploadDocuments(selectedFiles);
            setSuccess(true);
            setSelectedFiles([]);
            // Reset file input
            document.getElementById('file-input').value = '';

            // Call callback to refresh document list
            if (onUploadSuccess) {
                onUploadSuccess();
            }

            // Clear success message after 3 seconds
            setTimeout(() => setSuccess(false), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to upload documents');
        } finally {
            setUploading(false);
        }
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    return (
        <div className="upload-section">
            <h2>📤 Upload Documents</h2>

            <div className="upload-controls">
                <label htmlFor="file-input" className="file-label">
                    Choose Files
                </label>
                <input
                    id="file-input"
                    type="file"
                    multiple
                    onChange={handleFileSelect}
                    className="file-input"
                />

                <button
                    onClick={handleUpload}
                    disabled={uploading || selectedFiles.length === 0}
                    className="upload-button"
                >
                    {uploading ? 'Uploading...' : `Upload ${selectedFiles.length > 0 ? `(${selectedFiles.length})` : ''}`}
                </button>
            </div>

            {selectedFiles.length > 0 && (
                <div className="selected-files">
                    <h3>Selected Files:</h3>
                    <ul>
                        {selectedFiles.map((file, index) => (
                            <li key={index}>
                                <span className="file-name">{file.name}</span>
                                <span className="file-size">{formatFileSize(file.size)}</span>
                                <button
                                    className="remove-file-btn"
                                    onClick={() => removeFile(index)}
                                    title="Remove file"
                                >
                                    ×
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {error && <div className="error-message">❌ {error}</div>}
            {success && <div className="success-message">✅ Documents uploaded successfully!</div>}
        </div>
    );
};

export default DocumentUpload;
