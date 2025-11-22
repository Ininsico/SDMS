import React, { useState, useEffect } from 'react';
import { 
  DocumentIcon, 
  DownloadIcon, 
  EyeIcon, 
  UsersIcon,
  ShieldIcon,
  SearchIcon,
  ClockIcon 
} from './Svg';

const SharedDocuments = () => {
  const [sharedDocs, setSharedDocs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all'); // all, pending, accepted
  const [loading, setLoading] = useState(true);

  // Mock data - replace with actual API call
  useEffect(() => {
    const fetchSharedDocuments = async () => {
      try {
        // Simulate API call
        setTimeout(() => {
          setSharedDocs([
            {
              id: 1,
              name: 'Project_Budget.xlsx',
              sharedBy: 'john@company.com',
              sharedDate: '2024-01-15',
              expiryDate: '2024-02-15',
              permissions: 'view',
              status: 'accepted',
              encrypted: true,
              size: '2.1 MB',
              type: 'xlsx'
            },
            {
              id: 2,
              name: 'Client_Contract.pdf',
              sharedBy: 'sarah@company.com',
              sharedDate: '2024-01-14',
              expiryDate: '2024-01-21',
              permissions: 'download',
              status: 'accepted',
              encrypted: true,
              size: '3.4 MB',
              type: 'pdf'
            },
            {
              id: 3,
              name: 'Research_Data.csv',
              sharedBy: 'mike@company.com',
              sharedDate: '2024-01-16',
              expiryDate: '2024-01-23',
              permissions: 'view',
              status: 'pending',
              encrypted: true,
              size: '5.7 MB',
              type: 'csv'
            },
            {
              id: 4,
              name: 'Meeting_Minutes.docx',
              sharedBy: 'lisa@company.com',
              sharedDate: '2024-01-13',
              expiryDate: '2024-02-13',
              permissions: 'download',
              status: 'accepted',
              encrypted: false,
              size: '1.2 MB',
              type: 'docx'
            }
          ]);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching shared documents:', error);
        setLoading(false);
      }
    };

    fetchSharedDocuments();
  }, []);

  const filteredDocs = sharedDocs.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.sharedBy.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || doc.status === filter;
    return matchesSearch && matchesFilter;
  });

  const handleAccept = async (docId) => {
    try {
      // API call to accept shared document
      setSharedDocs(prev => 
        prev.map(doc => 
          doc.id === docId 
            ? { ...doc, status: 'accepted' }
            : doc
        )
      );
      alert('Document access accepted');
    } catch (error) {
      alert('Error accepting document');
    }
  };

  const handleReject = async (docId) => {
    if (window.confirm('Are you sure you want to reject this shared document?')) {
      try {
        // API call to reject shared document
        setSharedDocs(prev => prev.filter(doc => doc.id !== docId));
        alert('Document rejected');
      } catch (error) {
        alert('Error rejecting document');
      }
    }
  };

  const handleDownload = async (docId) => {
    try {
      // API call to download shared document
      console.log('Downloading shared document:', docId);
      alert('Downloading shared document...');
    } catch (error) {
      alert('Error downloading document');
    }
  };

  const getFileIcon = (type) => {
    const icons = {
      pdf: '📄',
      doc: '📝',
      docx: '📝',
      xlsx: '📊',
      csv: '📊',
      default: '📎'
    };
    return icons[type] || icons.default;
  };

  const getStatusBadge = (status) => {
    const styles = {
      accepted: 'bg-green-500 text-white',
      pending: 'bg-yellow-500 text-black',
      expired: 'bg-red-500 text-white'
    };
    const text = {
      accepted: 'Accepted',
      pending: 'Pending',
      expired: 'Expired'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
        {text[status]}
      </span>
    );
  };

  const getPermissionBadge = (permissions) => {
    const styles = {
      view: 'bg-blue-500 text-white',
      download: 'bg-purple-500 text-white',
      edit: 'bg-orange-500 text-white'
    };
    const text = {
      view: 'View Only',
      download: 'Can Download',
      edit: 'Can Edit'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[permissions]}`}>
        {text[permissions]}
      </span>
    );
  };

  const isExpired = (expiryDate) => {
    return new Date(expiryDate) < new Date();
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
          <h1 className="text-2xl font-bold text-white">Shared Documents</h1>
          <p className="text-gray-400">Documents shared with you by other users</p>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Filter */}
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Documents</option>
            <option value="pending">Pending</option>
            <option value="accepted">Accepted</option>
          </select>

          {/* Search */}
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search shared documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Documents List */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-gray-700 text-sm font-medium text-gray-300">
          <div className="col-span-4">Document</div>
          <div className="col-span-2">Shared By</div>
          <div className="col-span-2">Permissions</div>
          <div className="col-span-2">Expires</div>
          <div className="col-span-2">Actions</div>
        </div>

        <div className="divide-y divide-gray-700">
          {filteredDocs.map((doc) => (
            <div key={doc.id} className="grid grid-cols-12 gap-4 px-6 py-4 items-center">
              {/* Document Info */}
              <div className="col-span-4 flex items-center space-x-3">
                <div className="text-2xl">
                  {getFileIcon(doc.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <p className="text-white font-medium truncate">
                      {doc.name}
                    </p>
                    {doc.encrypted && (
                      <ShieldIcon className="w-4 h-4 text-green-400 flex-shrink-0" />
                    )}
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-400">
                    <span>{doc.size}</span>
                    <span>{doc.sharedDate}</span>
                  </div>
                </div>
              </div>

              {/* Shared By */}
              <div className="col-span-2">
                <div className="flex items-center space-x-2">
                  <UsersIcon className="w-4 h-4 text-gray-400" />
                  <span className="text-white text-sm">{doc.sharedBy}</span>
                </div>
              </div>

              {/* Permissions */}
              <div className="col-span-2">
                {getPermissionBadge(doc.permissions)}
              </div>

              {/* Expiry */}
              <div className="col-span-2">
                <div className="flex items-center space-x-2">
                  <ClockIcon className="w-4 h-4 text-gray-400" />
                  <span className={`text-sm ${
                    isExpired(doc.expiryDate) ? 'text-red-400' : 'text-white'
                  }`}>
                    {doc.expiryDate}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="col-span-2">
                <div className="flex items-center space-x-2">
                  {doc.status === 'pending' ? (
                    <>
                      <button
                        onClick={() => handleAccept(doc.id)}
                        className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-sm font-medium transition-colors"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleReject(doc.id)}
                        className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm font-medium transition-colors"
                      >
                        Reject
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleDownload(doc.id)}
                        className="p-2 text-blue-400 hover:text-blue-300 hover:bg-gray-700 rounded transition-colors"
                        title="Download"
                      >
                        <DownloadIcon className="w-4 h-4" />
                      </button>
                      <button
                        className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
                        title="View Details"
                      >
                        <EyeIcon className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Empty State */}
      {filteredDocs.length === 0 && (
        <div className="text-center py-12">
          <DocumentIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">
            {filter === 'pending' ? 'No pending shared documents' : 'No shared documents'}
          </h3>
          <p className="text-gray-400">
            {searchTerm 
              ? 'No documents match your search criteria' 
              : 'Documents shared with you will appear here'
            }
          </p>
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="text-2xl font-bold text-white">{sharedDocs.length}</div>
          <div className="text-sm text-gray-400">Total Shared</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="text-2xl font-bold text-green-400">
            {sharedDocs.filter(d => d.status === 'accepted').length}
          </div>
          <div className="text-sm text-gray-400">Accepted</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="text-2xl font-bold text-yellow-400">
            {sharedDocs.filter(d => d.status === 'pending').length}
          </div>
          <div className="text-sm text-gray-400">Pending</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="text-2xl font-bold text-blue-400">
            {sharedDocs.filter(d => d.encrypted).length}
          </div>
          <div className="text-sm text-gray-400">Encrypted</div>
        </div>
      </div>
    </div>
  );
};



export default SharedDocuments;