import React, { useState, useEffect } from 'react';
import { 
  DocumentIcon, 
  DownloadIcon, 
  ShareIcon, 
  DeleteIcon, 
  SearchIcon,
  ShieldIcon,
  EyeIcon,
  EditIcon 
} from './Svg';

const DocumentList = () => {
  const [documents, setDocuments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedDocument, setSelectedDocument] = useState(null);

  // Mock data - replace with actual API call
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        // Simulate API call
        setTimeout(() => {
          setDocuments([
            {
              id: 1,
              name: 'Financial_Report_Q3.pdf',
              size: '2.4 MB',
              uploadDate: '2024-01-15',
              encrypted: true,
              shared: false,
              integrity: 'verified',
              type: 'pdf'
            },
            {
              id: 2,
              name: 'Project_Proposal.docx',
              size: '1.8 MB',
              uploadDate: '2024-01-14',
              encrypted: true,
              shared: true,
              integrity: 'verified',
              type: 'doc'
            },
            {
              id: 3,
              name: 'Confidential_Agreement.pdf',
              size: '3.1 MB',
              uploadDate: '2024-01-13',
              encrypted: true,
              shared: false,
              integrity: 'warning',
              type: 'pdf'
            },
            {
              id: 4,
              name: 'Technical_Specs.xlsx',
              size: '4.2 MB',
              uploadDate: '2024-01-12',
              encrypted: false,
              shared: false,
              integrity: 'pending',
              type: 'xls'
            }
          ]);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching documents:', error);
        setLoading(false);
      }
    };

    fetchDocuments();
  }, []);

  const filteredDocuments = documents.filter(doc =>
    doc.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDownload = async (documentId) => {
    try {
      // API call to download/decrypt document
      console.log('Downloading document:', documentId);
      alert('Document download initiated. Decryption in progress...');
    } catch (error) {
      alert('Error downloading document');
    }
  };

  const handleShare = (document) => {
    setSelectedDocument(document);
    // Open share modal
  };

  const handleDelete = async (documentId) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      try {
        // API call to delete document
        setDocuments(documents.filter(doc => doc.id !== documentId));
        alert('Document deleted successfully');
      } catch (error) {
        alert('Error deleting document');
      }
    }
  };

  const getFileIcon = (type) => {
    const icons = {
      pdf: '📄',
      doc: '📝',
      xls: '📊',
      img: '🖼️',
      default: '📎'
    };
    return icons[type] || icons.default;
  };

  const getIntegrityBadge = (integrity) => {
    const styles = {
      verified: 'bg-green-500',
      warning: 'bg-yellow-500',
      pending: 'bg-gray-500'
    };
    const text = {
      verified: 'Verified',
      warning: 'Warning',
      pending: 'Pending'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[integrity]}`}>
        {text[integrity]}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">My Documents</h1>
          <p className="text-gray-400">Manage your encrypted documents</p>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDocuments.map((document) => (
          <div
            key={document.id}
            className="bg-gray-800 rounded-lg border border-gray-700 p-6 hover:border-blue-500 transition-all duration-200"
          >
            {/* Document Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">
                  {getFileIcon(document.type)}
                </div>
                <div>
                  <h3 className="font-semibold text-white truncate max-w-[200px]">
                    {document.name}
                  </h3>
                  <p className="text-sm text-gray-400">{document.size}</p>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                {document.encrypted && (
                  <ShieldIcon className="w-4 h-4 text-green-400" title="Encrypted" />
                )}
              </div>
            </div>

            {/* Document Info */}
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Uploaded:</span>
                <span className="text-white">{document.uploadDate}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Integrity:</span>
                {getIntegrityBadge(document.integrity)}
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Status:</span>
                <span className={`${document.shared ? 'text-blue-400' : 'text-gray-400'}`}>
                  {document.shared ? 'Shared' : 'Private'}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-between items-center pt-4 border-t border-gray-700">
              <button
                onClick={() => handleDownload(document.id)}
                className="flex items-center space-x-1 text-blue-400 hover:text-blue-300 transition-colors"
                title="Download"
              >
                <DownloadIcon className="w-4 h-4" />
                <span className="text-sm">Download</span>
              </button>

              <div className="flex space-x-2">
                <button
                  onClick={() => handleShare(document)}
                  className="p-2 text-gray-400 hover:text-blue-400 hover:bg-gray-700 rounded transition-colors"
                  title="Share"
                >
                  <ShareIcon className="w-4 h-4" />
                </button>
                
                <button
                  onClick={() => handleDelete(document.id)}
                  className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded transition-colors"
                  title="Delete"
                >
                  <DeleteIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredDocuments.length === 0 && (
        <div className="text-center py-12">
          <DocumentIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No documents found</h3>
          <p className="text-gray-400">
            {searchTerm ? 'Try adjusting your search terms' : 'Upload your first document to get started'}
          </p>
        </div>
      )}

      {/* Share Modal (to be implemented) */}
      {selectedDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Share {selectedDocument.name}</h3>
            {/* Share form goes here */}
            <button
              onClick={() => setSelectedDocument(null)}
              className="mt-4 px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentList;