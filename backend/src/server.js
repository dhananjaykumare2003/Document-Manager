import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import documentRoutes from './routes/documents.js';
import errorHandler from './middleware/errorHandler.js';
import './config/database.js'; // Initialize database

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Routes
app.use('/api/documents', documentRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        message: 'Document Manager API is running',
        timestamp: new Date().toISOString()
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Not found',
        message: `Route ${req.method} ${req.url} not found`
    });
});

// Error handler (must be last)
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📁 Upload directory: ${path.join(__dirname, '../uploads')}`);
    console.log(`📊 API endpoints:`);
    console.log(`   POST   /api/documents          - Upload documents`);
    console.log(`   GET    /api/documents          - List documents`);
    console.log(`   GET    /api/documents/:id/download - Download document`);
});

export default app;
