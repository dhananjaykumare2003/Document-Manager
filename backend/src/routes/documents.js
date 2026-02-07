import express from 'express';
import upload from '../middleware/upload.js';
import {
    uploadDocuments,
    listDocuments,
    downloadDocument
} from '../controllers/documentController.js';

const router = express.Router();

// POST /api/documents - Upload multiple documents
router.post('/', upload.array('files'), uploadDocuments);

// GET /api/documents - List documents with pagination, sorting, and search
router.get('/', listDocuments);

// GET /api/documents/:id/download - Download a specific document
router.get('/:id/download', downloadDocument);

export default router;
