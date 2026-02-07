import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create database connection
const db = new Database(path.join(__dirname, '../../documents.db'));

// Enable WAL mode for better concurrent access
db.pragma('journal_mode = WAL');

// Create documents table
const createTableSQL = `
  CREATE TABLE IF NOT EXISTS documents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    filename TEXT NOT NULL,
    filepath TEXT NOT NULL,
    filesize INTEGER NOT NULL,
    mimetype TEXT,
    uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`;

db.exec(createTableSQL);

// Create index for faster searches
db.exec('CREATE INDEX IF NOT EXISTS idx_title ON documents(title)');
db.exec('CREATE INDEX IF NOT EXISTS idx_uploaded_at ON documents(uploaded_at)');

console.log('✅ Database initialized successfully');

export default db;
