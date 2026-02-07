# 📄 Mini Document Manager

A full-stack document management system that supports uploading, listing, searching, and downloading documents with a clean, modern interface.

## 📋 Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Setup Instructions](#setup-instructions)
- [API Documentation](#api-documentation)
- [Architecture](#architecture)
- [Key Tradeoffs](#key-tradeoffs)
- [Design Questions](#design-questions)

## ✨ Features

### Backend
- ✅ Multi-file upload support (up to 10 files per request, 50MB each)
- ✅ Pagination with configurable page size
- ✅ Sorting by upload date (ascending/descending)
- ✅ Text search on document titles
- ✅ Streaming file downloads (memory efficient)
- ✅ SQLite database for metadata storage
- ✅ Local disk storage for files
- ✅ Comprehensive error handling

### Frontend
- ✅ Multi-file upload with progress feedback
- ✅ Document list with search functionality
- ✅ Sort controls (newest/oldest first)
- ✅ Pagination with page navigation
- ✅ Download functionality
- ✅ Loading, empty, and error states
- ✅ Responsive, modern UI design

## 🛠 Tech Stack

### Backend
- **Runtime**: Node.js (ES Modules)
- **Framework**: Express.js
- **Database**: SQLite (better-sqlite3)
- **File Upload**: Multer
- **Language**: JavaScript

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **HTTP Client**: Axios
- **Styling**: Modern CSS with CSS Variables
- **Language**: JavaScript (JSX)

## 📁 Project Structure

```
Finfully_Assignment/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js          # SQLite setup and schema
│   │   ├── controllers/
│   │   │   └── documentController.js # Business logic for documents
│   │   ├── middleware/
│   │   │   ├── upload.js            # Multer configuration
│   │   │   └── errorHandler.js      # Global error handler
│   │   ├── routes/
│   │   │   └── documents.js         # API routes
│   │   └── server.js                # Express app entry point
│   ├── uploads/                     # File storage directory
│   ├── documents.db                 # SQLite database (auto-generated)
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── DocumentUpload.jsx   # Upload component
│   │   │   ├── DocumentList.jsx     # List with search/sort/pagination
│   │   │   └── Pagination.jsx       # Pagination controls
│   │   ├── services/
│   │   │   └── api.js               # Axios API client
│   │   ├── App.jsx                  # Main app component
│   │   ├── App.css                  # Styles
│   │   └── main.jsx                 # Entry point
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
└── README.md
```

## 🚀 Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- npm (v9 or higher)

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Start the server:
```bash
npm start
```

The backend will run on `http://localhost:3000`

### Frontend Setup

1. Navigate to frontend directory (in a new terminal):
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

### Access the Application
Open your browser and navigate to `http://localhost:5173`

## 📡 API Documentation

### Base URL
```
http://localhost:3000/api
```

### Endpoints

#### 1. Upload Documents
```http
POST /documents
Content-Type: multipart/form-data

Field: files (multiple files supported)
```

**Response** (201 Created):
```json
{
  "message": "Successfully uploaded 2 document(s)",
  "documents": [
    {
      "id": 1,
      "title": "example.pdf",
      "filename": "example.pdf",
      "size": 245678,
      "uploadedAt": "2026-02-07T13:50:00.000Z"
    }
  ]
}
```

**Error Responses**:
- `400 Bad Request` - No files uploaded or file size exceeded
- `500 Internal Server Error` - Server error

#### 2. List Documents
```http
GET /documents?page=1&pageSize=10&sortOrder=desc&q=search
```

**Query Parameters**:
- `page` (optional): Page number, default: 1
- `pageSize` (optional): Items per page (1-100), default: 10
- `sortOrder` (optional): Sort order (`asc` or `desc`), default: `desc`
- `q` (optional): Search query for document title

**Response** (200 OK):
```json
{
  "documents": [
    {
      "id": 1,
      "title": "example.pdf",
      "filename": "example-1707312600000-123456789.pdf",
      "filesize": 245678,
      "mimetype": "application/pdf",
      "uploadedAt": "2026-02-07T13:50:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 10,
    "total": 25,
    "totalPages": 3,
    "hasNext": true,
    "hasPrev": false
  }
}
```

#### 3. Download Document
```http
GET /documents/:id/download
```

**Response** (200 OK):
- Headers:
  - `Content-Type`: Document MIME type
  - `Content-Disposition`: Attachment with filename
  - `Content-Length`: File size
- Body: File stream

**Error Responses**:
- `404 Not Found` - Document doesn't exist

### Health Check
```http
GET /api/health
```

Returns server status and timestamp.

## 🏗 Architecture

### System Overview

```
┌─────────────────┐
│   React App     │
│  (Port 5173)    │
│                 │
│  - Upload UI    │
│  - Search/Sort  │
│  - Pagination   │
│  - Download     │
└────────┬────────┘
         │ HTTP/REST
         ▼
┌─────────────────┐
│  Express API    │
│  (Port 3000)    │
│                 │
│  - Routes       │
│  - Controllers  │
│  - Middleware   │
└────┬───────┬────┘
     │       │
     │       ▼
     │   ┌──────────────┐
     │   │ Multer       │
     │   │ (File Upload)│
     │   └──────┬───────┘
     │          │
     ▼          ▼
┌──────────┐  ┌─────────────┐
│  SQLite  │  │ File System │
│          │  │             │
│ Metadata:│  │   uploads/  │
│ • title  │  │             │
│ • size   │  │  Binary     │
│ • date   │  │  Files      │
│ • path   │  │             │
└──────────┘  └─────────────┘
```

### Upload Flow

1. **User selects files** → React component captures files
2. **Files sent via FormData** → Single HTTP POST with multiple files
3. **Multer processes** → Saves files to `uploads/` directory
4. **Controller saves metadata** → Inserts records into SQLite
5. **Response sent** → Returns uploaded document metadata
6. **UI refreshes** → Document list re-fetches and updates

### Download Flow

1. **User clicks download** → React sends GET request
2. **Controller queries database** → Retrieves file path
3. **File stream created** → Node.js `fs.createReadStream()`
4. **Stream piped to response** → No memory buffering
5. **Browser receives** → Triggers file download
6. **Stream cleaned up** → Resources released immediately

### Database Schema

```sql
CREATE TABLE documents (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  filename TEXT NOT NULL,        -- Stored filename (unique)
  filepath TEXT NOT NULL,         -- Full path to file
  filesize INTEGER NOT NULL,      -- Size in bytes
  mimetype TEXT,                  -- MIME type
  uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_title ON documents(title);
CREATE INDEX idx_uploaded_at ON documents(uploaded_at);
```

## ⚖️ Key Tradeoffs

### 1. Single Request vs Multiple Requests for Upload
**Decision**: Single request with multiple files

**Pros**:
- Simpler error handling (all or nothing)
- Fewer HTTP round trips
- Easier to implement with FormData

**Cons**:
- Total size limited by server timeout
- Slower initial feedback (must wait for all files)

**Alternative**: Could use individual requests with Promise.all() for parallel uploads with per-file progress.

### 2. SQLite vs PostgreSQL
**Decision**: SQLite for simplicity

**Pros**:
- Zero configuration
- No external dependencies
- Perfect for assignment scope
- File-based, easy to inspect

**Cons**:
- Not suitable for high concurrency
- No built-in replication

**Production Alternative**: PostgreSQL with connection pooling for multi-user scenarios.

### 3. Local Disk vs Cloud Storage
**Decision**: Local disk storage

**Pros**:
- No external service dependencies
- Simpler implementation
- Faster for development/testing

**Cons**:
- Not horizontally scalable
- No redundancy
- Depends on server disk space

**Production Alternative**: S3/GCS with signed URLs (see Design Questions below).

### 4. Offset Pagination vs Cursor Pagination
**Decision**: Offset-based pagination

**Pros**:
- Simpler to implement
- Works with SQL LIMIT/OFFSET
- Easier for users to jump to pages

**Cons**:
- Can skip/duplicate items if data changes
- Less efficient for large offsets

**Production Alternative**: Cursor-based pagination with `WHERE id > lastId` for better performance.

### 5. Case-Insensitive Search Implementation
**Decision**: SQL `LOWER()` function

**Pros**:
- Works across all databases
- Simple to implement

**Cons**:
- Cannot use indexes effectively
- Slower for large datasets

**Production Alternative**: Full-text search (SQLite FTS5 or Elasticsearch).

## 💡 Design Questions

### 1. Multiple Uploads

**How does your system handle uploading multiple documents?**

The system handles multiple document uploads in a **single HTTP request**:

- **Frontend**: Uses the HTML5 `<input type="file" multiple>` attribute to allow users to select multiple files. These files are collected into a `FormData` object where each file is appended with the same field name (`files`).

- **Backend**: Multer middleware is configured with `.array('files')` to accept multiple files in the `files` field. Each file is processed sequentially, saved to disk with a unique filename (timestamp + random number), and metadata is inserted into the database.

**One request or many?**
- **One request** containing multiple files via `multipart/form-data`

**Limits and tradeoffs:**

| Aspect | Limit | Tradeoff |
|--------|-------|----------|
| Files per request | 10 files | Prevents abuse, keeps request size manageable |
| File size | 50MB per file | Balances usability vs. server memory/timeout |
| Total request size | ~500MB theoretical max | Limited by Express timeout (default 2 min) |

**Tradeoffs**:
- ✅ **Simpler error handling**: Either all files succeed or all fail
- ✅ **Atomic operation**: All metadata inserted in one transaction
- ✅ **Fewer HTTP round trips**: Better for network efficiency
- ❌ **No per-file progress**: User doesn't see granular upload progress
- ❌ **All-or-nothing**: One failed file can fail the entire batch
- ❌ **Timeout risk**: Large batches may exceed server timeout

**Alternative approach**: Multiple parallel requests (one per file) with Promise.all() would enable:
- Individual progress tracking
- Partial success (some files upload even if others fail)
- Better handling of large files
- But adds complexity in error handling and UI state management

### 2. Streaming

**Why is streaming important for upload/download?**

Streaming is **critical** for handling files without loading them entirely into memory.

**For Downloads (Implemented)**:

Our system uses Node.js streams via `fs.createReadStream()`:

```javascript
const fileStream = fs.createReadStream(document.filepath);
fileStream.pipe(res);
```

**Benefits**:
1. **Memory Efficiency**: Processes file in small chunks (~64KB default)
2. **Scalability**: Handles files larger than available RAM
3. **Responsiveness**: Download starts immediately, no buffering delay
4. **Concurrent Users**: Server can handle multiple downloads without OOM (Out Of Memory)

**Problems if file loaded into memory**:

| Issue | Without Streaming | With Streaming |
|-------|------------------|----------------|
| 50MB file | 50MB RAM per download | ~64KB RAM per download |
| 10 concurrent users | 500MB RAM | ~640KB RAM |
| 500MB file | **Server crashes** | Works fine |
| Response time | Wait for full read | Immediate start |

**For Uploads**:

Multer uses streams internally to handle incoming files:
- Writes directly to disk as data arrives
- Doesn't buffer entire file in memory
- Critical for large files (videos, backups, etc.)

**Example Scenario**:
- Without streaming: Uploading a 100MB file would require 100MB of server RAM
- With streaming: Same upload uses ~1-2MB of RAM (Multer's buffer)

**Conclusion**: Streaming is **essential** for production systems to prevent memory exhaustion and enable handling of large files.

### 3. Moving to S3

**If files move to object storage (e.g., S3), what changes in your backend?**

Migrating to S3 would require several architectural changes:

**What Changes**:

1. **Upload Flow**:
   ```javascript
   // Current (Disk)
   multer.diskStorage({ destination: 'uploads/' })
   
   // S3 Approach
   import multerS3 from 'multer-s3';
   import { S3Client } from '@aws-sdk/client-s3';
   
   multer({
     storage: multerS3({
       s3: new S3Client({ region: 'us-east-1' }),
       bucket: 'my-documents',
       key: (req, file, cb) => {
         cb(null, `${Date.now()}-${file.originalname}`);
       }
     })
   })
   ```

2. **Database Changes**:
   - Replace `filepath` with `s3Key` and `s3Bucket`
   - Store S3 object URL or construct it dynamically

3. **Download Flow** (Two Options):

   **Option A: Proxy through backend** (not recommended)
   ```javascript
   // Backend fetches from S3 and streams to client
   const { GetObjectCommand } = require('@aws-sdk/client-s3');
   const s3Stream = await s3.send(new GetObjectCommand({
     Bucket: 'my-documents',
     Key: document.s3Key
   }));
   s3Stream.Body.pipe(res);
   ```
   - ❌ Backend still handles file bytes
   - ❌ Wastes server bandwidth and processing
   - ✅ Can add access control
   - ✅ Hides S3 URLs from users

   **Option B: Signed URLs** (recommended)
   ```javascript
   // Backend generates temporary signed URL
   import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
   
   const url = await getSignedUrl(s3, new GetObjectCommand({
     Bucket: 'my-documents',
     Key: document.s3Key
   }), { expiresIn: 3600 }); // 1 hour
   
   res.json({ downloadUrl: url });
   ```
   - ✅ **Direct download from S3** (backend doesn't handle bytes)
   - ✅ Scales infinitely
   - ✅ Leverages S3's CDN/edge locations
   - ✅ Frees up server resources
   - ⚠️ URL expires after time limit

**Would the backend still handle file bytes?**

- **Option A (Proxy)**: Yes - Backend retrieves from S3 and streams to client
  - Use case: Strict access control, URL hiding, request logging
  
- **Option B (Signed URLs)**: **No** - Backend only generates URLs, S3 serves files directly
  - Use case: High traffic, large files, global users
  - **This is the recommended approach** for scalability

**Additional Changes Needed**:

| Component | Change Required |
|-----------|----------------|
| **Dependencies** | Add `@aws-sdk/client-s3`, `@aws-sdk/s3-request-presigner` |
| **Configuration** | AWS credentials, region, bucket name |
| **Database** | Replace `filepath` with `s3_key`, `s3_bucket` |
| **Upload** | Use `multer-s3` or upload to S3 after Multer |
| **Download** | Generate signed URLs instead of streaming |
| **Delete** | Call S3 DeleteObject API |
| **Cost** | Consider S3 storage costs, transfer fees |
| **Security** | IAM roles, bucket policies, signed URL expiration |

**Benefits of S3 Migration**:
- ✅ Horizontal scalability
- ✅ Built-in redundancy (99.999999999% durability)
- ✅ CDN integration (CloudFront)
- ✅ No disk space management
- ✅ Versioning and lifecycle policies

**Summary**: With signed URLs, the backend becomes purely a **metadata manager** and **authorization layer**, while S3 handles all file storage and delivery.

### 4. Frontend UX

**If you had more time, how would you add document preview?**

**Implementation Approach**:

1. **Inline Preview** (for common formats):
   ```javascript
   // Detect supported formats
   const previewableTypes = ['image/', 'application/pdf', 'text/'];
   
   const canPreview = (mimetype) => {
     return previewableTypes.some(type => mimetype.startsWith(type));
   };
   
   // Generate preview URL
   const getPreviewUrl = (id) => `/api/documents/${id}/preview`;
   ```

2. **Backend Preview Endpoint**:
   ```javascript
   // Stream with inline disposition (browser renders instead of downloads)
   res.setHeader('Content-Disposition', 'inline');
   res.setHeader('Content-Type', document.mimetype);
   fileStream.pipe(res);
   ```

3. **Component Design**:
   ```jsx
   // DocumentPreview.jsx
   const DocumentPreview = ({ document }) => {
     if (document.mimetype.startsWith('image/')) {
       return <img src={`/api/documents/${document.id}/preview`} />;
     }
     
     if (document.mimetype === 'application/pdf') {
       return (
         <iframe
           src={`/api/documents/${document.id}/preview`}
           width="100%"
           height="600px"
         />
       );
     }
     
     if (document.mimetype.startsWith('text/')) {
       // Fetch and display text content
       return <pre>{textContent}</pre>;
     }
     
     return <p>Preview not available for this file type</p>;
   };
   ```

4. **UI Integration**:
   - Add "👁️ Preview" button next to Download
   - Open modal/drawer with preview component
   - For unsupported types, show file icon and metadata

**Challenges**:
- Security: Sanitize HTML/text content to prevent XSS
- Performance: Large PDFs may be slow to render
- Format support: Limited by browser capabilities

**How would you show upload progress?**

**Implementation**:

1. **Use Axios Upload Progress**:
   ```javascript
   const uploadWithProgress = (files, onProgress) => {
     const formData = new FormData();
     files.forEach(file => formData.append('files', file));
     
     return axios.post('/api/documents', formData, {
       headers: { 'Content-Type': 'multipart/form-data' },
       onUploadProgress: (progressEvent) => {
         const percentCompleted = Math.round(
           (progressEvent.loaded * 100) / progressEvent.total
         );
         onProgress(percentCompleted);
       }
     });
   };
   ```

2. **UI Component**:
   ```jsx
   const DocumentUpload = () => {
     const [uploadProgress, setUploadProgress] = useState(0);
     const [uploading, setUploading] = useState(false);
     
     const handleUpload = async () => {
       setUploading(true);
       await uploadWithProgress(files, setUploadProgress);
       setUploading(false);
       setUploadProgress(0);
     };
     
     return (
       <>
         <button onClick={handleUpload}>Upload</button>
         {uploading && (
           <div className="progress-bar">
             <div 
               className="progress-fill" 
               style={{ width: `${uploadProgress}%` }}
             />
             <span>{uploadProgress}%</span>
           </div>
         )}
       </>
     );
   };
   ```

3. **Enhanced Version** (Per-file Progress):
   ```javascript
   // Upload files individually for granular progress
   const uploadFiles = async (files) => {
     const uploads = files.map((file, index) => ({
       file,
       progress: 0,
       status: 'pending'
     }));
     
     setFileUploadStates(uploads);
     
     for (let i = 0; i < files.length; i++) {
       await uploadSingleFile(files[i], (progress) => {
         setFileUploadStates(prev => {
           const updated = [...prev];
           updated[i].progress = progress;
           return updated;
         });
       });
     }
   };
   ```

4. **Visual Design**:
   - Overall progress bar with percentage
   - Per-file progress indicators
   - Checkmarks for completed files
   - Error indicators for failed uploads
   - Animated loading states

**Additional Enhancements**:
- **Estimated time remaining**: Calculate based on current speed
- **Cancel upload**: Use AbortController to cancel in-progress uploads
- **Retry failed**: Allow retrying individual failed files
- **Drag & drop**: Add drag-drop zone for better UX
- **File validation**: Show errors before upload (size, type)

**Trade-off**: Individual file uploads provide better progress visibility but increase complexity and HTTP overhead.

---

## 📝 Notes

- This implementation prioritizes **clarity** and **correctness** over premature optimization
- Code is structured for **readability** and **maintainability**
- Error handling covers common failure scenarios
- The system is designed to be easily extendable (e.g., adding authentication, file type restrictions)

## 🎯 Assignment Completion Checklist

- ✅ Multi-file upload functionality
- ✅ Document listing with pagination
- ✅ Search by document title
- ✅ Sort by upload date
- ✅ Streaming file downloads
- ✅ Clean API contracts
- ✅ Separation of metadata and binary storage
- ✅ Error handling and validation
- ✅ Loading/empty/error states in UI
- ✅ Comprehensive README
- ✅ All design questions answered
- ⏳ Architecture diagram (separate file)
- ⏳ Screen recording demo

---

## 📧 Submission

**Submitting to**: internship@finfully.co

**Includes**:
1. ✅ Complete source code (backend + frontend)
2. ✅ This README with design questions
3. ⏳ Architecture diagram (PNG/PDF)
4. ⏳ Screen recording (5 min max, Google Drive link)

---

**Developer**: Dhananjay Kumare (Finfully Full-Stack Intern Assignment)  
**Date**: February 2026  
**Time Spent**: ~90 minutes
