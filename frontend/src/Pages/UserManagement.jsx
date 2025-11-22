import React, { useState, useEffect } from 'react';
import { 
  UsersIcon, 
  SearchIcon, 
  EditIcon, 
  ShieldIcon, 
  BanIcon,
  CheckIcon,
  RefreshIcon
} from './Svg';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // Mock data - replace with actual API call
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // Simulate API call
        setTimeout(() => {
          setUsers([
            {
              id: 1,
              name: 'John Doe',
              email: 'john@company.com',
              role: 'admin',
              status: 'active',
              lastLogin: '2024-01-15 14:30',
              documentCount: 24,
              joinedDate: '2023-11-10',
              encryptionKeys: 'RSA-2048'
            },
            {
              id: 2,
              name: 'Sarah Wilson',
              email: 'sarah@company.com',
              role: 'user',
              status: 'active',
              lastLogin: '2024-01-16 09:15',
              documentCount: 15,
              joinedDate: '2024-01-05',
              encryptionKeys: 'RSA-2048'
            },
            {
              id: 3,
              name: 'Mike Johnson',
              email: 'mike@company.com',
              role: 'user',
              status: 'inactive',
              lastLogin: '2024-01-10 16:45',
              documentCount: 8,
              joinedDate: '2023-12-20',
              encryptionKeys: 'RSA-2048'
            },
            {
              id: 4,
              name: 'Lisa Chen',
              email: 'lisa@company.com',
              role: 'user',
              status: 'suspended',
              lastLogin: '2024-01-12 11:20',
              documentCount: 32,
              joinedDate: '2023-10-15',
              encryptionKeys: 'RSA-2048'
            },
            {
              id: 5,
              name: 'Alex Rodriguez',
              email: 'alex@company.com',
              role: 'admin',
              status: 'active',
              lastLogin: '2024-01-16 13:10',
              documentCount: 41,
              joinedDate: '2023-09-01',
              encryptionKeys: 'RSA-4096'
            }
          ]);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching users:', error);
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRoleChange = async (userId, newRole) => {
    try {
      // API call to update user role
      setUsers(prev => 
        prev.map(user => 
          user.id === userId 
            ? { ...user, role: newRole }
            : user
        )
      );
      alert(`User role updated to ${newRole}`);
    } catch (error) {
      alert('Error updating user role');
    }
  };

  const handleStatusChange = async (userId, newStatus) => {
    try {
      // API call to update user status
      setUsers(prev => 
        prev.map(user => 
          user.id === userId 
            ? { ...user, status: newStatus }
            : user
        )
      );
      alert(`User status updated to ${newStatus}`);
    } catch (error) {
      alert('Error updating user status');
    }
  };

  const handleResetPassword = async (userId) => {
    if (window.confirm('Are you sure you want to reset this user\'s password?')) {
      try {
        // API call to reset password
        alert('Password reset email sent to user');
      } catch (error) {
        alert('Error resetting password');
      }
    }
  };

  const handleRegenerateKeys = async (userId) => {
    if (window.confirm('Are you sure you want to regenerate encryption keys? This will require the user to re-encrypt their documents.')) {
      try {
        // API call to regenerate keys
        alert('Encryption keys regenerated successfully');
      } catch (error) {
        alert('Error regenerating keys');
      }
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      active: 'bg-green-500 text-white',
      inactive: 'bg-yellow-500 text-black',
      suspended: 'bg-red-500 text-white'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getRoleBadge = (role) => {
    const styles = {
      admin: 'bg-purple-500 text-white',
      user: 'bg-blue-500 text-white'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[role]}`}>
        {role.charAt(0).toUpperCase() + role.slice(1)}
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
          <h1 className="text-2xl font-bold text-white">User Management</h1>
          <p className="text-gray-400">Manage system users and permissions</p>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="text-2xl font-bold text-white">{users.length}</div>
          <div className="text-sm text-gray-400">Total Users</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="text-2xl font-bold text-purple-400">
            {users.filter(u => u.role === 'admin').length}
          </div>
          <div className="text-sm text-gray-400">Admins</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="text-2xl font-bold text-green-400">
            {users.filter(u => u.status === 'active').length}
          </div>
          <div className="text-sm text-gray-400">Active Users</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="text-2xl font-bold text-blue-400">
            {users.reduce((acc, user) => acc + user.documentCount, 0)}
          </div>
          <div className="text-sm text-gray-400">Total Documents</div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-gray-700 text-sm font-medium text-gray-300">
          <div className="col-span-3">User</div>
          <div className="col-span-2">Role</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-2">Last Login</div>
          <div className="col-span-3">Actions</div>
        </div>

        <div className="divide-y divide-gray-700">
          {filteredUsers.map((user) => (
            <div key={user.id} className="grid grid-cols-12 gap-4 px-6 py-4 items-center">
              {/* User Info */}
              <div className="col-span-3 flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-sm font-semibold text-white">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium truncate">
                    {user.name}
                  </p>
                  <p className="text-gray-400 text-sm truncate">
                    {user.email}
                  </p>
                </div>
              </div>

              {/* Role */}
              <div className="col-span-2">
                <div className="flex items-center space-x-2">
                  {getRoleBadge(user.role)}
                  {user.role === 'admin' && (
                    <ShieldIcon className="w-4 h-4 text-purple-400" />
                  )}
                </div>
              </div>

              {/* Status */}
              <div className="col-span-2">
                {getStatusBadge(user.status)}
              </div>

              {/* Last Login */}
              <div className="col-span-2">
                <span className="text-sm text-gray-300">
                  {user.lastLogin}
                </span>
              </div>

              {/* Actions */}
              <div className="col-span-3">
                <div className="flex items-center space-x-2">
                  {/* Role Change */}
                  <select
                    value={user.role}
                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                    className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>

                  {/* Status Change */}
                  <select
                    value={user.status}
                    onChange={(e) => handleStatusChange(user.id, e.target.value)}
                    className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="suspended">Suspend</option>
                  </select>

                  {/* More Actions */}
                  <div className="flex space-x-1">
                    <button
                      onClick={() => handleResetPassword(user.id)}
                      className="p-1 text-gray-400 hover:text-blue-400 hover:bg-gray-700 rounded transition-colors"
                      title="Reset Password"
                    >
                      <RefreshIcon className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => handleRegenerateKeys(user.id)}
                      className="p-1 text-gray-400 hover:text-green-400 hover:bg-gray-700 rounded transition-colors"
                      title="Regenerate Keys"
                    >
                      <ShieldIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Empty State */}
      {filteredUsers.length === 0 && (
        <div className="text-center py-12">
          <UsersIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No users found</h3>
          <p className="text-gray-400">
            {searchTerm ? 'Try adjusting your search terms' : 'No users in the system'}
          </p>
        </div>
      )}

      {/* User Details Modal */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Edit User: {selectedUser.name}</h3>
            {/* Edit form would go here */}
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};



export default UserManagement;