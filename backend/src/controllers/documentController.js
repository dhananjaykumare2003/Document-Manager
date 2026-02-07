import db from '../config/database.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Upload multiple documents
export const uploadDocuments = async (req, res, next) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                error: 'No files uploaded',
                message: 'Please select at least one file to upload'
            });
        }

        const insertStmt = db.prepare(`
      INSERT INTO documents (title, filename, filepath, filesize, mimetype)
      VALUES (?, ?, ?, ?, ?)
    `);

        const uploadedDocs = [];

        for (const file of req.files) {
            const title = req.body.title || file.originalname;

            const result = insertStmt.run(
                title,
                file.filename,
                file.path,
                file.size,
                file.mimetype
            );

            uploadedDocs.push({
                id: result.lastInsertRowid,
                title,
                filename: file.originalname,
                size: file.size,
                uploadedAt: new Date().toISOString()
            });
        }

        res.status(201).json({
            message: `Successfully uploaded ${uploadedDocs.length} document(s)`,
            documents: uploadedDocs
        });
    } catch (error) {
        next(error);
    }
};

// List documents with pagination, sorting, and search
export const listDocuments = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.pageSize) || 10;
        const sortOrder = req.query.sortOrder || 'desc'; // 'asc' or 'desc'
        const searchQuery = req.query.q || '';

        // Validate inputs
        if (page < 1 || pageSize < 1 || pageSize > 100) {
            return res.status(400).json({
                error: 'Invalid pagination parameters',
                message: 'Page must be >= 1 and pageSize must be between 1 and 100'
            });
        }

        if (!['asc', 'desc'].includes(sortOrder.toLowerCase())) {
            return res.status(400).json({
                error: 'Invalid sort order',
                message: 'sortOrder must be either "asc" or "desc"'
            });
        }

        const offset = (page - 1) * pageSize;

        // Build query
        let whereClause = '';
        let params = [];

        if (searchQuery) {
            whereClause = 'WHERE LOWER(title) LIKE LOWER(?)';
            params.push(`%${searchQuery}%`);
        }

        // Get total count
        const countQuery = `SELECT COUNT(*) as total FROM documents ${whereClause}`;
        const { total } = db.prepare(countQuery).get(...params);

        // Get documents
        const documentsQuery = `
      SELECT 
        id,
        title,
        filename,
        filesize,
        mimetype,
        uploaded_at as uploadedAt
      FROM documents
      ${whereClause}
      ORDER BY uploaded_at ${sortOrder.toUpperCase()}
      LIMIT ? OFFSET ?
    `;

        const documents = db.prepare(documentsQuery).all(...params, pageSize, offset);

        const totalPages = Math.ceil(total / pageSize);

        res.json({
            documents,
            pagination: {
                page,
                pageSize,
                total,
                totalPages,
                hasNext: page < totalPages,
                hasPrev: page > 1
            }
        });
    } catch (error) {
        next(error);
    }
};

// Download document (streaming)
export const downloadDocument = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Get document metadata
        const document = db.prepare('SELECT * FROM documents WHERE id = ?').get(id);

        if (!document) {
            return res.status(404).json({
                error: 'Document not found',
                message: `No document exists with ID ${id}`
            });
        }

        // Check if file exists
        if (!fs.existsSync(document.filepath)) {
            return res.status(404).json({
                error: 'File not found',
                message: 'The file has been deleted from storage'
            });
        }

        // Set headers for file download
        res.setHeader('Content-Type', document.mimetype || 'application/octet-stream');
        res.setHeader('Content-Disposition', `attachment; filename="${document.filename}"`);
        res.setHeader('Content-Length', document.filesize);

        // Stream the file
        const fileStream = fs.createReadStream(document.filepath);

        fileStream.on('error', (error) => {
            console.error('File stream error:', error);
            if (!res.headersSent) {
                res.status(500).json({
                    error: 'Error reading file',
                    message: 'An error occurred while reading the file'
                });
            }
        });

        fileStream.pipe(res);
    } catch (error) {
        next(error);
    }
};
