# Testing Guide for Document Manager

## Quick Start Testing

### 1. Start the Servers

Open two terminal windows:

**Terminal 1 - Backend:**
```bash
cd c:\Users\dhana\development\assignments\Finfully_Assignment\backend
npm start
```

Expected output:
```
✅ Database initialized successfully
🚀 Server running on http://localhost:3000
📁 Upload directory: C:\Users\dhana\development\assignments\Finfully_Assignment\backend\uploads
📊 API endpoints:
   POST   /api/documents          - Upload documents
   GET    /api/documents          - List documents
   GET    /api/documents/:id/download - Download document
```

**Terminal 2 - Frontend:**
```bash
cd c:\Users\dhana\development\assignments\Finfully_Assignment\frontend
npm run dev
```

Expected output:
```
  VITE v5.0.8  ready in 500 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h to show help
```

### 2. Open the Application

Navigate to: http://localhost:5173

## Test Cases

### ✅ Test Case 1: Initial Load
**Steps:**
1. Open http://localhost:5173
2. Observe the page

**Expected Results:**
- Header shows "📄 Document Manager"
- Upload section visible with "Choose Files" and "Upload" buttons
- Document list shows "📭 No documents found" (empty state)
- No errors in browser console

---

### ✅ Test Case 2: Multi-File Upload
**Steps:**
1. Click "Choose Files" button
2. Select 2-3 files from your computer
3. Observe the file preview list
4. Click "Upload" button
5. Wait for upload to complete

**Expected Results:**
- Selected files appear in preview with names and sizes
- Upload button shows "Uploading..." during upload
- Success message: "✅ Documents uploaded successfully!"
- Documents appear in the list below
- File preview clears after successful upload

**Verify:**
- Each document shows title (filename)
- Document shows file size (e.g., "2.45 MB")
- Document shows upload date and time
- Download button is present for each document

---

### ✅ Test Case 3: Search Functionality
**Steps:**
1. Upload several files with different names
2. In the search input, type part of one filename
3. Click "🔍 Search" button
4. Observe results
5. Clear search (empty the input)
6. Click "🔍 Search" again

**Expected Results:**
- Only matching documents appear in the list
- Non-matching documents are hidden
- "Showing X of Y documents" updates correctly
- Clearing search shows all documents again
- If no matches: "📭 No documents found" with suggestion to adjust query

---

### ✅ Test Case 4: Sorting
**Steps:**
1. Upload 3+ files with a few seconds between each upload
2. Observe default sort order (newest first)
3. Click sort dropdown
4. Select "Oldest First"
5. Observe the list
6. Select "Newest First" again

**Expected Results:**
- Default shows newest uploads at the top
- "Oldest First": List reverses, oldest at top
- "Newest First": List reverses back
- Sort maintains persistent while searching/paginating

---

### ✅ Test Case 5: Pagination
**Steps:**
1. Upload at least 11 documents (more than pageSize of 10)
2. Observe pagination controls appear
3. Click "Next" or page "2"
4. Click "Previous" or page "1"
5. Try clicking on various page numbers

**Expected Results:**
- Pagination appears when >10 documents
- Shows "<< Previous [1] [2] [3] Next >>"
- Active page is highlighted
- Previous disabled on page 1
- Next disabled on last page
- Page changes update the document list
- "Showing X of Y documents" updates correctly

---

### ✅ Test Case 6: Download Document
**Steps:**
1. Upload a known file (e.g., a test PDF or image)
2. Click "⬇️ Download" button for that document
3. Check your browser's downloads folder

**Expected Results:**
- Download initiates immediately
- Browser shows download progress (if file is large)
- File appears in downloads folder
- Downloaded file has correct name
- Downloaded file opens correctly and matches original
- Download button shows "Downloading..." briefly

---

### ✅ Test Case 7: Error Handling - No File Selected
**Steps:**
1. Click "Upload" without selecting any files

**Expected Results:**
- Error message appears: "❌ Please select at least one file"
- No API request is made
- Document list unchanged

---

### ✅ Test Case 8: Large File Upload
**Steps:**
1. Select a file >50MB

**Expected Results:**
- Upload fails with error: "File size cannot exceed 50MB"
- User is notified of the size limit

---

### ✅ Test Case 9: Many Files Upload
**Steps:**
1. Select more than 10 files at once

**Expected Results:**
- Upload fails with error: "Cannot upload more than 10 files at once"
- User is notified of the file count limit

---

### ✅ Test Case 10: Search + Sort + Pagination Combined
**Steps:**
1. Upload 20+ documents
2. Apply a search query (should have 5+ results)
3. Change sort order
4. Navigate pagination (if results span multiple pages)

**Expected Results:**
- All three features work together seamlessly
- Changing search resets to page 1
- Changing sort maintains current page (if possible)
- Pagination only shows pages for current search results

---

### ✅ Test Case 11: Empty State
**Steps:**
1. Start with fresh database (or delete all documents)
2. Load the page

**Expected Results:**
- Upload section visible and functional
- Document list shows: "📭 No documents found"
- No pagination controls
- No errors

---

### ✅ Test Case 12: Loading States
**Steps:**
1. Upload files and observe UI
2. Perform search and observe UI
3. Change pages and observe UI

**Expected Results:**
- Upload button shows "Uploading..." during upload
- Document list shows spinner during initial load
- Download buttons show "Downloading..." during download

---

## API Testing (Optional - Using curl or Postman)

### Health Check
```bash
curl http://localhost:3000/api/health
```

Expected:
```json
{
  "status": "ok",
  "message": "Document Manager API is running",
  "timestamp": "2026-02-07T..."
}
```

### Upload Documents
```bash
curl -X POST http://localhost:3000/api/documents \
  -F "files=@C:\path\to\file1.pdf" \
  -F "files=@C:\path\to\file2.jpg"
```

### List Documents
```bash
curl "http://localhost:3000/api/documents?page=1&pageSize=10&sortOrder=desc"
```

### Download Document
```bash
curl "http://localhost:3000/api/documents/1/download" --output test-download.pdf
```

---

## Browser Console Testing

Open Chrome DevTools (F12) → Console tab

### Check for Errors
- No red errors should appear
- Warnings (if any) should not affect functionality

### Check Network Tab
- Upload should show POST to `/api/documents`
- List should show GET to `/api/documents?...`
- Download should show GET to `/api/documents/:id/download`

---

## Performance Testing

### Test with Large Files
1. Upload a 40MB file
2. Observe memory usage (Task Manager)
3. Expected: Memory should not spike dramatically

### Test with Many Documents
1. Upload 50+ small files
2. Test pagination performance
3. Search performance
4. Expected: No significant lag

---

## Cross-Browser Testing (if time permits)

Test on:
- ✅ Chrome
- ✅ Firefox
- ✅ Edge
- ✅ Safari (macOS)

All features should work identically.

---

## Checklist After Testing

- [ ] All 12 test cases pass
- [ ] No errors in browser console
- [ ] Backend shows no errors in terminal
- [ ] Files download correctly
- [ ] Upload/download work with various file types
- [ ] UI is responsive on different screen sizes
- [ ] Loading states appear appropriately
- [ ] Error messages are user-friendly

---

**Testing Complete!** If all tests pass, the application is ready for the screen recording demo.
