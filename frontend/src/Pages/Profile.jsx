import React, { useState, useEffect } from 'react';
import { ProfileIcon, KeyIcon, ShieldIcon } from './Svg';

const Profile = () => {
  const [user, setUser] = useState({
    name: '',
    email: '',
    role: 'user',
    createdAt: '',
    lastLogin: '',
    profilePicture: ''
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [initialLoad, setInitialLoad] = useState(true);

  const API_BASE_URL = 'http://localhost:5000';

  // Enhanced token retrieval
  const getToken = () => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    console.log('Retrieved token:', token ? 'Token exists' : 'No token found');
    return token;
  };

  // Enhanced fetch user profile with better error handling
  const fetchUserProfile = async () => {
    try {
      setInitialLoad(true);
      const token = getToken();
      
      if (!token) {
        setMessage('Please log in to view profile');
        // Redirect to login if no token
        window.location.href = '/login';
        return;
      }

      console.log('Fetching profile with token...');

      const response = await fetch(`${API_BASE_URL}/api/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Profile response status:', response.status);

      if (response.status === 401) {
        // Token is invalid or expired
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
        setMessage('Session expired. Please log in again.');
        window.location.href = '/login';
        return;
      }

      const data = await response.json();
      console.log('Profile data received:', data);

      if (data.success) {
        const userData = data.data.user;
        setUser({
          name: userData.name || 'No name set',
          email: userData.email || 'No email set',
          role: userData.role || 'user',
          createdAt: userData.createdAt || '',
          lastLogin: userData.lastLogin || userData.lastlogin || '', // Handle both camelCase and lowercase
          profilePicture: userData.profilePicture || '/uploads/profilepics/pfp.png'
        });
        setMessage('');
      } else {
        setMessage(data.message || 'Failed to fetch profile');
        console.error('Profile fetch error:', data.message);
      }
    } catch (error) {
      console.error('Error fetching profile data:', error);
      setMessage('Error fetching profile data. Please check your connection.');
      
      // If it's a network error, suggest checking backend
      if (error.name === 'TypeError' || error.message.includes('Failed to fetch')) {
        setMessage('Cannot connect to server. Please make sure the backend is running.');
      }
    } finally {
      setInitialLoad(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      setMessage('');

      const token = getToken();
      if (!token) {
        setMessage('Please log in to update profile');
        return;
      }

      // Validate inputs
      if (!user.name.trim() || !user.email.trim()) {
        setMessage('Name and email are required');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/profile/update`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: user.name.trim(),
          email: user.email.trim().toLowerCase()
        }),
      });

      if (response.status === 401) {
        setMessage('Session expired. Please log in again.');
        localStorage.removeItem('token');
        window.location.href = '/login';
        return;
      }

      const data = await response.json();

      if (data.success) {
        setMessage('Profile updated successfully');
        await fetchUserProfile(); // Refresh data
      } else {
        setMessage(data.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage('Error updating profile');
    } finally {
      setLoading(false);
    }
  };

  const handleProfilePictureUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setMessage('Please select an image file');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setMessage('Image must be smaller than 5MB');
      return;
    }

    try {
      setLoading(true);
      setMessage('');

      const formData = new FormData();
      formData.append('profilePicture', file);

      const token = getToken();
      const response = await fetch(`${API_BASE_URL}/api/profile/picture`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.status === 401) {
        setMessage('Session expired. Please log in again.');
        localStorage.removeItem('token');
        window.location.href = '/login';
        return;
      }

      const data = await response.json();

      if (data.success) {
        setMessage('Profile picture updated successfully');
        await fetchUserProfile();
      } else {
        setMessage(data.message || 'Failed to upload profile picture');
      }
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      setMessage('Error uploading profile picture');
    } finally {
      setLoading(false);
      // Clear the file input
      event.target.value = '';
    }
  };

  const handleDeleteProfilePicture = async () => {
    if (!window.confirm('Are you sure you want to remove your profile picture?')) {
      return;
    }

    try {
      setLoading(true);
      const token = getToken();
      const response = await fetch(`${API_BASE_URL}/api/profile/picture`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 401) {
        setMessage('Session expired. Please log in again.');
        localStorage.removeItem('token');
        window.location.href = '/login';
        return;
      }

      const data = await response.json();

      if (data.success) {
        setMessage('Profile picture removed successfully');
        await fetchUserProfile();
      } else {
        setMessage(data.message || 'Failed to remove profile picture');
      }
    } catch (error) {
      console.error('Error removing profile picture:', error);
      setMessage('Error removing profile picture');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    const currentPassword = prompt('Enter your current password:');
    if (!currentPassword) return;

    const newPassword = prompt('Enter new password:');
    if (!newPassword) return;

    const confirmPassword = prompt('Confirm new password:');
    if (!confirmPassword) return;

    if (newPassword !== confirmPassword) {
      setMessage('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setMessage('Password must be at least 6 characters');
      return;
    }

    try {
      setLoading(true);
      const token = getToken();
      const response = await fetch(`${API_BASE_URL}/api/profile/password`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword,
          newPassword
        }),
      });

      if (response.status === 401) {
        setMessage('Session expired. Please log in again.');
        localStorage.removeItem('token');
        window.location.href = '/login';
        return;
      }

      const data = await response.json();

      if (data.success) {
        setMessage('Password changed successfully');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage(data.message || 'Failed to change password');
      }
    } catch (error) {
      setMessage('Error changing password');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'Never';
    try {
      return new Date(dateString).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  const getProfilePictureUrl = () => {
    if (!user.profilePicture) return `${API_BASE_URL}/uploads/profilepics/pfp.png`;
    
    if (user.profilePicture.startsWith('http')) {
      return user.profilePicture;
    }
    
    // Handle both absolute and relative paths
    if (user.profilePicture.startsWith('/')) {
      return `${API_BASE_URL}${user.profilePicture}`;
    }
    
    return `${API_BASE_URL}/${user.profilePicture}`;
  };

  // Delete Icon SVG Component
  const DeleteIcon = ({ className = "w-4 h-4" }) => (
    <svg 
      className={className} 
      fill="none" 
      stroke="currentColor" 
      viewBox="0 0 24 24"
    >
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={2} 
        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" 
      />
    </svg>
  );

  useEffect(() => {
    fetchUserProfile();
  }, []);

  // Debug: Check what's in localStorage
  useEffect(() => {
    console.log('Current localStorage:', {
      token: localStorage.getItem('token'),
      userRole: localStorage.getItem('userRole'),
      userName: localStorage.getItem('userName'),
      userId: localStorage.getItem('userId')
    });
  }, []);

  if (initialLoad) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-white text-lg">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Profile Settings</h1>
        <p className="text-gray-400">Manage your account</p>
      </div>

      {message && (
        <div className={`p-4 rounded-lg ${
          message.includes('successfully') || message.includes('Success') || (!message.includes('Error') && !message.includes('Failed') && !message.includes('expired'))
            ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
            : 'bg-red-500/20 text-red-400 border border-red-500/30'
        }`}>
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Personal Information</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={user.name}
                  onChange={(e) => setUser(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={user.email}
                  onChange={(e) => setUser(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your email address"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Role
                  </label>
                  <input
                    type="text"
                    value={user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'User'}
                    disabled
                    className="w-full bg-gray-600 border border-gray-600 rounded-lg px-3 py-2 text-gray-400 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Member Since
                  </label>
                  <input
                    type="text"
                    value={formatDate(user.createdAt)}
                    disabled
                    className="w-full bg-gray-600 border border-gray-600 rounded-lg px-3 py-2 text-gray-400 cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={handleSaveProfile}
              disabled={loading}
              className="mt-6 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed rounded-lg text-white font-medium transition-colors"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
            <div className="text-center">
              <div className="relative w-24 h-24 mx-auto mb-4 group">
                <img
                  src={getProfilePictureUrl()}
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover border-2 border-blue-500"
                  onError={(e) => {
                    // If image fails to load, show fallback
                    e.target.style.display = 'none';
                    // The fallback will be shown by the parent logic
                  }}
                />
                {user.profilePicture && user.profilePicture !== '/uploads/profilepics/pfp.png' && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      onClick={handleDeleteProfilePicture}
                      disabled={loading}
                      className="text-white bg-red-600 hover:bg-red-700 p-2 rounded-full disabled:bg-red-400 transition-colors"
                      title="Remove profile picture"
                    >
                      <DeleteIcon className="w-4 h-4" />
                    </button>
                  </div>
                )}
                
                <label htmlFor="profilePictureUpload" className="absolute bottom-0 right-0 bg-blue-600 rounded-full p-2 cursor-pointer hover:bg-blue-700 transition-colors shadow-lg">
                  <ProfileIcon className="w-5 h-5 text-white" />
                  <input
                    id="profilePictureUpload"
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePictureUpload}
                    className="hidden"
                    disabled={loading}
                  />
                </label>
              </div>
              
              <h3 className="text-lg font-semibold text-white">{user.name || 'User Name'}</h3>
              <p className="text-gray-400 text-sm">{user.email || 'user@example.com'}</p>
              <div className="mt-2 px-3 py-1 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-full text-sm inline-block font-medium">
                {user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'User'}
              </div>
            </div>

            <div className="mt-6 space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Last Login:</span>
                <span className="text-white text-right">{formatDateTime(user.lastLogin)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Member Since:</span>
                <span className="text-white text-right">{formatDate(user.createdAt)}</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
            <h4 className="font-semibold text-white mb-4">Quick Actions</h4>
            
            <div className="space-y-3">
              <button 
                onClick={handleChangePassword}
                disabled={loading}
                className="w-full flex items-center space-x-3 p-3 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg transition-colors"
              >
                <KeyIcon className="w-5 h-5 text-yellow-400" />
                <span className="text-white">Change Password</span>
              </button>

              <button className="w-full flex items-center space-x-3 p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors">
                <ShieldIcon className="w-5 h-5 text-blue-400" />
                <span className="text-white">Privacy Settings</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;