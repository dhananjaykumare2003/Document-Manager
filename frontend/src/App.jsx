import { useState } from 'react';
import DocumentUpload from './components/DocumentUpload';
import DocumentList from './components/DocumentList';
import './App.css';

function App() {
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const handleUploadSuccess = () => {
        // Trigger document list refresh
        setRefreshTrigger(prev => prev + 1);
    };

    return (
        <div className="app">
            <header className="app-header">
                <h1>📄 Document Manager</h1>
                <p>Upload, search, and manage your documents</p>
            </header>

            <main className="app-main">
                <DocumentUpload onUploadSuccess={handleUploadSuccess} />
                <DocumentList refreshTrigger={refreshTrigger} />
            </main>

            <footer className="app-footer">
                <p>Built with React + Express + SQLite</p>
            </footer>
        </div>
    );
}

export default App;
