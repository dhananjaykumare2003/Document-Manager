// Global error handler middleware
const errorHandler = (err, req, res, next) => {
    console.error('Error:', err);

    // Multer errors
    if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
            error: 'File too large',
            message: 'File size cannot exceed 50MB'
        });
    }

    if (err.code === 'LIMIT_FILE_COUNT') {
        return res.status(400).json({
            error: 'Too many files',
            message: 'Cannot upload more than 10 files at once'
        });
    }

    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        return res.status(400).json({
            error: 'Unexpected field',
            message: 'Unexpected file field in request'
        });
    }

    // Database errors
    if (err.code === 'SQLITE_ERROR') {
        return res.status(500).json({
            error: 'Database error',
            message: 'An error occurred while accessing the database'
        });
    }

    // File system errors
    if (err.code === 'ENOENT') {
        return res.status(404).json({
            error: 'File not found',
            message: 'The requested file does not exist'
        });
    }

    // Default error
    res.status(err.status || 500).json({
        error: err.message || 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};

export default errorHandler;
