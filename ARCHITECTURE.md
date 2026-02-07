# Document Manager - System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     REACT FRONTEND (Port 5173)                  │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────────┐  │
│  │  Document    │  │  Document    │  │   App Component     │  │
│  │   Upload     │  │    List      │  │                     │  │
│  │              │  │              │  │  - State Management │  │
│  │ • Multi-file │  │ • Search Bar │  │  - Component Coord  │  │
│  │ • Preview    │  │ • Sort Select│  │  - Refresh Trigger  │  │
│  │ • Progress   │  │ • Pagination │  │                     │  │
│  │              │  │ • Download   │  │                     │  │
│  └──────────────┘  └──────────────┘  └─────────────────────┘  │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │             API Service (Axios)                         │   │
│  │  • uploadDocuments()  • getDocuments()                  │   │
│  │  • downloadDocument()                                   │   │
│  └─────────────────────────────────────────────────────────┘   │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │  HTTP/REST API
                         │  - FormData (upload)
                         │  - JSON (list)
                         │  - Blob (download)
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                  EXPRESS BACKEND API (Port 3000)                │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                      ROUTES                             │   │
│  │  POST   /api/documents          - Upload               │   │
│  │  GET    /api/documents          - List (paginate)      │   │
│  │  GET    /api/documents/:id/download - Download         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                         │                                       │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                   MIDDLEWARE                            │   │
│  │  • Multer (multi-file upload, 50MB limit)              │   │
│  │  • CORS (cross-origin support)                         │   │
│  │  • Error Handler (global error handling)               │   │
│  └─────────────────────────────────────────────────────────┘   │
│                         │                                       │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                  CONTROLLERS                            │   │
│  │  • uploadDocuments()   - Process files, save metadata  │   │
│  │  • listDocuments()     - Query with filters/pagination │   │
│  │  • downloadDocument()  - Stream file from disk         │   │
│  └─────────────────────────────────────────────────────────┘   │
└────────────┬────────────────────────────┬───────────────────────┘
             │                            │
             │ Metadata Queries           │ Binary File I/O
             │                            │
             ▼                            ▼
┌──────────────────────────┐   ┌─────────────────────────────┐
│   SQLite Database        │   │   File System Storage       │
│   (documents.db)         │   │   (uploads/ directory)      │
│                          │   │                             │
│  TABLE: documents        │   │  Files stored with          │
│  ┌───────────────────┐   │   │  unique filenames:          │
│  │ id (PK)           │   │   │                             │
│  │ title             │   │   │  example-1707312600000-     │
│  │ filename          │   │   │    123456789.pdf            │
│  │ filepath ─────────┼───┼───▶                             │
│  │ filesize          │   │   │  video-1707312700000-       │
│  │ mimetype          │   │   │    987654321.mp4            │
│  │ uploaded_at       │   │   │                             │
│  └───────────────────┘   │   │  document-1707312800000-    │
│                          │   │    456789123.docx           │
│  Indexes:                │   │                             │
│  • idx_title             │   │  Storage: Local Disk        │
│  • idx_uploaded_at       │   │  Max per file: 50MB         │
│                          │   │                             │
└──────────────────────────┘   └─────────────────────────────┘
```

## Upload Flow

```
1. User selects files
   │
   ▼
2. React creates FormData with files
   │
   ▼
3. POST /api/documents
   │
   ▼
4. Multer intercepts request
   │
   ├─▶ Saves files to uploads/ directory
   │   (with unique filenames)
   │
   ▼
5. Controller receives file metadata
   │
   ├─▶ Inserts metadata into SQLite
   │   (title, filename, path, size, type, date)
   │
   ▼
6. Returns JSON response
   │
   ▼
7. Frontend displays success + refreshes list
```

## Download Flow

```
1. User clicks download button
   │
   ▼
2. GET /api/documents/:id/download
   │
   ▼
3. Controller queries database
   │
   ├─▶ SELECT filepath FROM documents WHERE id = ?
   │
   ▼
4. Controller creates file stream
   │
   ├─▶ fs.createReadStream(filepath)
   │   (NO memory buffering)
   │
   ▼
5. Stream piped to HTTP response
   │
   ├─▶ stream.pipe(res)
   │   (Chunks sent progressively)
   │
   ▼
6. Browser receives file
   │
   ▼
7. Download initiated
   │
   ▼
8. Stream automatically closed
```

## Key Architectural Principles

### 1. Separation of Concerns
- **Metadata** → SQLite (searchable, queryable, indexed)
- **Binary Files** → Filesystem (efficient storage, no DB bloat)

### 2. Streaming Architecture
- **Upload**: Multer streams incoming files directly to disk
- **Download**: Node.js streams files without loading into memory
- **Benefit**: Can handle files larger than available RAM

### 3. Stateless API
- No server-side sessions
- Each request contains all necessary information
- Horizontally scalable (can add more backend instances)

### 4. Client-Side State Management
- React manages UI state (loading, errors, pagination)
- No Redux needed for this scope
- State lifted to App component for coordination

### 5. RESTful Design
- Resources: Documents
- Standard HTTP methods (POST, GET)
- Proper status codes (200, 201, 400, 404, 500)
- JSON for metadata, streams for binary data

## Technology Rationale

| Technology | Reason |
|------------|--------|
| SQLite | Zero-config, file-based, perfect for assignment scope |
| Express | Minimal, flexible, well-documented Node.js framework |
| Multer | Industry standard for multipart/form-data in Express |
| React | Component-based, great dev experience with Vite |
| Axios | Promise-based HTTP client, better than fetch API |
| better-sqlite3 | Synchronous API, faster than async wrappers |

## Scalability Considerations

### Current Implementation (Single Server)
- ✅ Works for 1-100 concurrent users
- ✅ Suitable for internal tools, demos
- ⚠️ File storage limited by disk space
- ⚠️ SQLite has write concurrency limits

### Production Migration Path
1. **Database**: Migrate to PostgreSQL for better concurrency
2. **File Storage**: Move to S3/GCS with signed URLs
3. **Caching**: Add Redis for frequently accessed metadata
4. **Load Balancing**: Multiple backend instances with sticky sessions
5. **CDN**: Serve static files through CloudFront/Cloudflare
6. **Search**: Implement Elasticsearch for full-text search

## Security Considerations

### Implemented
- ✅ File size limits (prevents DoS)
- ✅ File count limits (prevents abuse)
- ✅ Error handling (no sensitive info leaked)
- ✅ SQL parameterization (prevents SQL injection)

### Not Implemented (Out of Scope)
- ❌ Authentication/Authorization
- ❌ File type validation
- ❌ Virus scanning
- ❌ Rate limiting
- ❌ HTTPS/SSL
- ❌ CSRF protection

---

**This architecture supports all assignment requirements while maintaining clean separation of concerns and production-ready patterns.**
