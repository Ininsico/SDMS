import React, { useState, useEffect } from 'react';

const DocumentList = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const API_BASE_URL = 'http://localhost:5000';

  const getToken = () => {
    return localStorage.getItem('token');
  };

  // Fetch documents
  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const token = getToken();
      
      const response = await fetch(`${API_BASE_URL}/api/documents`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const result = await response.json();
      
      if (result.success) {
        setDocuments(result.data.documents);
      } else {
        setError(result.message);
      }
    } catch (error) {
      setError('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('document', file);

      const token = getToken();
      const response = await fetch(`${API_BASE_URL}/api/documents/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const result = await response.json();
      
      if (result.success) {
        setDocuments([result.data.document, ...documents]);
        alert('Document uploaded!');
        event.target.value = '';
      } else {
        alert('Upload failed: ' + result.message);
      }
    } catch (error) {
      alert('Upload error');
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (documentId, originalName) => {
    try {
      const token = getToken();
      const response = await fetch(`${API_BASE_URL}/api/documents/download/${documentId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = originalName;
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        alert('Download failed');
      }
    } catch (error) {
      alert('Download error');
    }
  };

  const handleDelete = async (documentId, originalName) => {
    if (!window.confirm(`Delete "${originalName}"?`)) return;

    try {
      const token = getToken();
      const response = await fetch(`${API_BASE_URL}/api/documents/${documentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const result = await response.json();
      
      if (result.success) {
        setDocuments(documents.filter(doc => doc._id !== documentId));
        alert('Document deleted');
      } else {
        alert('Delete failed');
      }
    } catch (error) {
      alert('Delete error');
    }
  };

  // Get file icon based on file type
  const getFileIcon = (fileType) => {
    if (fileType.includes('pdf')) return '📄';
    if (fileType.includes('word')) return '📝';
    if (fileType.includes('excel') || fileType.includes('sheet')) return '📊';
    if (fileType.includes('image')) return '🖼️';
    if (fileType.includes('text')) return '📃';
    return '📁';
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-white text-lg">Loading documents...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header with Upload */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">My Documents</h1>
          <p className="text-gray-400 mt-2">Manage your uploaded files</p>
        </div>
        <label className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg cursor-pointer transition duration-200 font-medium">
          {uploading ? '📤 Uploading...' : '📁 Upload Document'}
          <input
            type="file"
            className="hidden"
            onChange={handleUpload}
            disabled={uploading}
          />
        </label>
      </div>

      {error && (
        <div className="bg-red-500 text-white p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Documents Grid */}
      {documents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {documents.map((doc) => (
            <div
              key={doc._id}
              className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-blue-500 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/20 group relative"
            >
              {/* File Icon and Info - Clickable for download */}
              <div 
                className="cursor-pointer"
                onClick={() => handleDownload(doc._id, doc.originalName)}
              >
                <div className="text-5xl mb-4 text-center group-hover:scale-110 transition-transform duration-300">
                  {getFileIcon(doc.filetype)}
                </div>

                <div className="text-center">
                  <h3 className="text-white font-semibold text-lg mb-2 truncate" title={doc.name}>
                    {doc.name}
                  </h3>
                  <p className="text-gray-400 text-sm mb-1">
                    {formatFileSize(doc.size)}
                  </p>
                  <p className="text-gray-500 text-xs">
                    {new Date(doc.uploadDate).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Download Button on Hover */}
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <button
                  onClick={() => handleDownload(doc._id, doc.originalName)}
                  className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-lg transition duration-200"
                  title="Download"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </button>
              </div>

              {/* Delete Button on Hover */}
              <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <button
                  onClick={() => handleDelete(doc._id, doc.originalName)}
                  className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg transition duration-200"
                  title="Delete"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>

              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-blue-600 bg-opacity-10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-16">
          <div className="text-8xl mb-4">📁</div>
          <h3 className="text-2xl font-bold text-white mb-2">No documents yet</h3>
          <p className="text-gray-400 mb-6">Upload your first document to get started</p>
          <label className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg cursor-pointer transition duration-200 font-medium inline-block">
            📁 Upload Your First Document
            <input
              type="file"
              className="hidden"
              onChange={handleUpload}
              disabled={uploading}
            />
          </label>
        </div>
      )}
    </div>
  );
};

export default DocumentList;