import React, { useState, useEffect } from 'react';
import { 
  LockIcon, 
  UsersIcon, 
  SearchIcon, 
  EditIcon, 
  ClockIcon,
  EyeIcon,
  DownloadIcon,
  BanIcon,
  CheckIcon
} from './Svg';

const AccessControl = () => {
  const [accessRules, setAccessRules] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddRuleModal, setShowAddRuleModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [newRule, setNewRule] = useState({
    documentId: '',
    userId: '',
    permissions: 'view',
    expiryDate: '',
    notes: ''
  });

  // Mock data - replace with actual API calls
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Simulate API calls
        setTimeout(() => {
          setDocuments([
            { id: 1, name: 'Financial_Report_Q3.pdf', owner: 'You' },
            { id: 2, name: 'Project_Proposal.docx', owner: 'You' },
            { id: 3, name: 'Client_Contract.pdf', owner: 'You' },
          ]);

          setUsers([
            { id: 1, name: 'Sarah Wilson', email: 'sarah@company.com' },
            { id: 2, name: 'Mike Johnson', email: 'mike@company.com' },
            { id: 3, name: 'Lisa Chen', email: 'lisa@company.com' },
          ]);

          setAccessRules([
            {
              id: 1,
              documentId: 1,
              documentName: 'Financial_Report_Q3.pdf',
              userId: 1,
              userName: 'Sarah Wilson',
              userEmail: 'sarah@company.com',
              permissions: 'view',
              grantedDate: '2024-01-15',
              expiryDate: '2024-02-15',
              status: 'active',
              grantedBy: 'You'
            },
            {
              id: 2,
              documentId: 2,
              documentName: 'Project_Proposal.docx',
              userId: 2,
              userName: 'Mike Johnson',
              userEmail: 'mike@company.com',
              permissions: 'download',
              grantedDate: '2024-01-14',
              expiryDate: '2024-01-21',
              status: 'active',
              grantedBy: 'You'
            },
            {
              id: 3,
              documentId: 3,
              documentName: 'Client_Contract.pdf',
              userId: 3,
              userName: 'Lisa Chen',
              userEmail: 'lisa@company.com',
              permissions: 'view',
              grantedDate: '2024-01-10',
              expiryDate: '2024-01-17',
              status: 'expired',
              grantedBy: 'You'
            },
            {
              id: 4,
              documentId: 1,
              documentName: 'Financial_Report_Q3.pdf',
              userId: 3,
              userName: 'Lisa Chen',
              userEmail: 'lisa@company.com',
              permissions: 'download',
              grantedDate: '2024-01-12',
              expiryDate: '2024-02-12',
              status: 'revoked',
              grantedBy: 'You'
            }
          ]);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredRules = accessRules.filter(rule =>
    rule.documentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rule.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rule.userEmail.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddRule = async () => {
    if (!newRule.documentId || !newRule.userId) {
      alert('Please select both document and user');
      return;
    }

    try {
      const document = documents.find(d => d.id === parseInt(newRule.documentId));
      const user = users.find(u => u.id === parseInt(newRule.userId));

      const rule = {
        id: Date.now(),
        documentId: newRule.documentId,
        documentName: document.name,
        userId: newRule.userId,
        userName: user.name,
        userEmail: user.email,
        permissions: newRule.permissions,
        grantedDate: new Date().toISOString().split('T')[0],
        expiryDate: newRule.expiryDate,
        status: 'active',
        grantedBy: 'You'
      };

      setAccessRules(prev => [rule, ...prev]);
      setShowAddRuleModal(false);
      setNewRule({
        documentId: '',
        userId: '',
        permissions: 'view',
        expiryDate: '',
        notes: ''
      });
      alert('Access rule added successfully');
    } catch (error) {
      alert('Error adding access rule');
    }
  };

  const handleRevokeAccess = async (ruleId) => {
    if (window.confirm('Are you sure you want to revoke this access?')) {
      try {
        setAccessRules(prev => 
          prev.map(rule => 
            rule.id === ruleId 
              ? { ...rule, status: 'revoked' }
              : rule
          )
        );
        alert('Access revoked successfully');
      } catch (error) {
        alert('Error revoking access');
      }
    }
  };

  const handleExtendAccess = async (ruleId, newExpiryDate) => {
    try {
      setAccessRules(prev => 
        prev.map(rule => 
          rule.id === ruleId 
            ? { ...rule, expiryDate: newExpiryDate, status: 'active' }
            : rule
        )
      );
      alert('Access extended successfully');
    } catch (error) {
      alert('Error extending access');
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      active: 'bg-green-500 text-white',
      expired: 'bg-red-500 text-white',
      revoked: 'bg-gray-500 text-white'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getPermissionBadge = (permissions) => {
    const styles = {
      view: 'bg-blue-500 text-white',
      download: 'bg-purple-500 text-white',
      edit: 'bg-orange-500 text-white'
    };
    const icons = {
      view: <EyeIcon className="w-3 h-3 mr-1" />,
      download: <DownloadIcon className="w-3 h-3 mr-1" />,
      edit: <EditIcon className="w-3 h-3 mr-1" />
    };
    const text = {
      view: 'View Only',
      download: 'Can Download',
      edit: 'Can Edit'
    };
    return (
      <span className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${styles[permissions]}`}>
        {icons[permissions]}
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
          <h1 className="text-2xl font-bold text-white">Access Control</h1>
          <p className="text-gray-400">Manage document sharing and permissions</p>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search access rules..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <button
            onClick={() => setShowAddRuleModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium transition-colors"
          >
            <LockIcon className="w-5 h-5" />
            <span>Share Document</span>
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="text-2xl font-bold text-white">{accessRules.length}</div>
          <div className="text-sm text-gray-400">Total Rules</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="text-2xl font-bold text-green-400">
            {accessRules.filter(r => r.status === 'active').length}
          </div>
          <div className="text-sm text-gray-400">Active Access</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="text-2xl font-bold text-red-400">
            {accessRules.filter(r => r.status === 'expired').length}
          </div>
          <div className="text-sm text-gray-400">Expired</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="text-2xl font-bold text-blue-400">
            {new Set(accessRules.map(r => r.documentId)).size}
          </div>
          <div className="text-sm text-gray-400">Shared Documents</div>
        </div>
      </div>

      {/* Access Rules Table */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-gray-700 text-sm font-medium text-gray-300">
          <div className="col-span-3">Document & User</div>
          <div className="col-span-2">Permissions</div>
          <div className="col-span-2">Access Period</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-3">Actions</div>
        </div>

        <div className="divide-y divide-gray-700">
          {filteredRules.map((rule) => (
            <div key={rule.id} className="grid grid-cols-12 gap-4 px-6 py-4 items-center">
              {/* Document & User Info */}
              <div className="col-span-3">
                <div className="space-y-2">
                  <div>
                    <p className="text-white font-medium text-sm">
                      {rule.documentName}
                    </p>
                    <p className="text-gray-400 text-xs">
                      Shared with: {rule.userName}
                    </p>
                  </div>
                  <p className="text-gray-500 text-xs">
                    {rule.userEmail}
                  </p>
                </div>
              </div>

              {/* Permissions */}
              <div className="col-span-2">
                {getPermissionBadge(rule.permissions)}
              </div>

              {/* Access Period */}
              <div className="col-span-2">
                <div className="space-y-1 text-sm">
                  <div className="flex items-center space-x-1">
                    <CheckIcon className="w-3 h-3 text-green-400" />
                    <span className="text-gray-300">{rule.grantedDate}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <ClockIcon className="w-3 h-3 text-yellow-400" />
                    <span className={`${isExpired(rule.expiryDate) ? 'text-red-400' : 'text-gray-300'}`}>
                      {rule.expiryDate}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status */}
              <div className="col-span-2">
                {getStatusBadge(rule.status)}
              </div>

              {/* Actions */}
              <div className="col-span-3">
                <div className="flex items-center space-x-2">
                  {rule.status === 'active' && (
                    <>
                      <button
                        onClick={() => handleRevokeAccess(rule.id)}
                        className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm font-medium transition-colors"
                      >
                        Revoke
                      </button>
                      <button
                        onClick={() => handleExtendAccess(rule.id, '2024-03-01')}
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm font-medium transition-colors"
                      >
                        Extend
                      </button>
                    </>
                  )}
                  {rule.status === 'expired' && (
                    <button
                      onClick={() => handleExtendAccess(rule.id, '2024-03-01')}
                      className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-sm font-medium transition-colors"
                    >
                      Renew
                    </button>
                  )}
                  {rule.status === 'revoked' && (
                    <span className="text-gray-400 text-sm">Revoked</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Empty State */}
      {filteredRules.length === 0 && (
        <div className="text-center py-12">
          <LockIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No access rules</h3>
          <p className="text-gray-400">
            {searchTerm 
              ? 'No access rules match your search criteria' 
              : 'Start sharing documents to create access rules'
            }
          </p>
        </div>
      )}

      {/* Add Rule Modal */}
      {showAddRuleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Share Document</h3>
            
            <div className="space-y-4">
              {/* Document Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Select Document
                </label>
                <select
                  value={newRule.documentId}
                  onChange={(e) => setNewRule(prev => ({ ...prev, documentId: e.target.value }))}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Choose a document...</option>
                  {documents.map(doc => (
                    <option key={doc.id} value={doc.id}>
                      {doc.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* User Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Share With User
                </label>
                <select
                  value={newRule.userId}
                  onChange={(e) => setNewRule(prev => ({ ...prev, userId: e.target.value }))}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a user...</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.email})
                    </option>
                  ))}
                </select>
              </div>

              {/* Permissions */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Permissions
                </label>
                <select
                  value={newRule.permissions}
                  onChange={(e) => setNewRule(prev => ({ ...prev, permissions: e.target.value }))}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="view">View Only</option>
                  <option value="download">Download</option>
                  <option value="edit">Edit</option>
                </select>
              </div>

              {/* Expiry Date */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Expiry Date (Optional)
                </label>
                <input
                  type="date"
                  value={newRule.expiryDate}
                  onChange={(e) => setNewRule(prev => ({ ...prev, expiryDate: e.target.value }))}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={newRule.notes}
                  onChange={(e) => setNewRule(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Add any notes about this sharing..."
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowAddRuleModal(false)}
                className="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddRule}
                className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Share Document
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccessControl;