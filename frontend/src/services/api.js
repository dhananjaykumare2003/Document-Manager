import axios from 'axios';

const API_BASE_URL = '/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Upload multiple documents
export const uploadDocuments = async (files) => {
    const formData = new FormData();

    for (let i = 0; i < files.length; i++) {
        formData.append('files', files[i]);
    }

    const response = await api.post('/documents', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });

    return response.data;
};

// Get documents with pagination, sorting, and search
export const getDocuments = async ({ page = 1, pageSize = 10, sortOrder = 'desc', searchQuery = '' }) => {
    const response = await api.get('/documents', {
        params: {
            page,
            pageSize,
            sortOrder,
            q: searchQuery,
        },
    });

    return response.data;
};

// Download a document
export const downloadDocument = async (id, title) => {
    const response = await api.get(`/documents/${id}/download`, {
        responseType: 'blob',
    });

    // Create a download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', title);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
};

export default api;
