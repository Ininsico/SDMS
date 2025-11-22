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
  const [uploadProgress, setUploadProgress] = useState(0);

  // FIX: Use absolute URL for API calls
  const API_BASE_URL = 'http://localhost:5000'; 

  const getToken = () => {
    return localStorage.getItem('token') || sessionStorage.getItem('token');
  };

  const fetchUserProfile = async () => {
    try {
      const token = getToken();
      if (!token) {
        setMessage('Please log in to view profile');
        return;
      }

      console.log('🔍 Fetching profile from:', `${API_BASE_URL}/api/profile`);
      
      const response = await fetch(`${API_BASE_URL}/api/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('🔍 Response status:', response.status);
      
      // Check if response is HTML
      const responseText = await response.text();
      console.log('🔍 Response preview:', responseText.substring(0, 500));
      
      if (responseText.trim().startsWith('<!DOCTYPE') || responseText.trim().startsWith('<!doctype')) {
        throw new Error('Server returned HTML instead of JSON. Check your API URL and CORS configuration.');
      }

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('❌ JSON parse error:', parseError);
        console.error('❌ Response was:', responseText);
        throw new Error('Invalid JSON response from server');
      }

      if (response.ok) {
        console.log('✅ User data received:', data);
        const userData = data.data.user;
        
        setUser({
          name: userData.name || 'No name set',
          email: userData.email || 'No email set',
          role: userData.role || 'user',
          createdAt: userData.createdAt || '',
          lastLogin: userData.lastLogin || '',
          profilePicture: userData.profilePicture || ''
        });
      } else {
        setMessage(data.message || 'Failed to fetch profile');
      }
    } catch (error) {
      console.error('❌ Error fetching profile:', error);
      setMessage(`Error: ${error.message}`);
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

      const response = await fetch(`${API_BASE_URL}/api/profile/update`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: user.name,
          email: user.email
        }),
      });

      const responseText = await response.text();
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('❌ JSON parse error:', parseError);
        setMessage('Invalid response from server');
        return;
      }

      if (response.ok) {
        setMessage('Profile updated successfully');
        await fetchUserProfile();
      } else {
        setMessage(data.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage('Error updating profile: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Update all other API calls to use API_BASE_URL too...
  const handleProfilePictureUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      setLoading(true);
      setUploadProgress(0);
      setMessage('');

      const formData = new FormData();
      formData.append('profilePicture', file);

      const token = getToken();
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percentComplete = (e.loaded / e.total) * 100;
          setUploadProgress(percentComplete);
        }
      });

      xhr.addEventListener('load', async () => {
        if (xhr.status === 200) {
          let data;
          try {
            data = JSON.parse(xhr.responseText);
          } catch (parseError) {
            setMessage('Invalid response from server');
            return;
          }
          setMessage('Profile picture updated successfully');
          await fetchUserProfile();
        } else {
          let data;
          try {
            data = JSON.parse(xhr.responseText);
            setMessage(data.message || 'Failed to upload profile picture');
          } catch (parseError) {
            setMessage('Failed to upload profile picture');
          }
        }
        setUploadProgress(0);
        setLoading(false);
      });

      xhr.addEventListener('error', () => {
        setMessage('Error uploading profile picture');
        setUploadProgress(0);
        setLoading(false);
      });

      xhr.open('POST', `${API_BASE_URL}/api/profile/picture`);
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      xhr.send(formData);

    } catch (error) {
      console.error('Error uploading profile picture:', error);
      setMessage('Error uploading profile picture');
      setUploadProgress(0);
      setLoading(false);
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

      const responseText = await response.text();
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        setMessage('Invalid response from server');
        return;
      }

      if (response.ok) {
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

      const responseText = await response.text();
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        setMessage('Invalid response from server');
        return;
      }

      if (response.ok) {
        setMessage('Password changed successfully');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage(data.message || 'Failed to change password');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      setMessage('Error changing password');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (error) {
      return 'Invalid date';
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'Never';
    try {
      return new Date(dateString).toLocaleString();
    } catch (error) {
      return 'Invalid date';
    }
  };

  const getProfilePictureUrl = () => {
    if (!user.profilePicture) return '';
    if (user.profilePicture.startsWith('http')) return user.profilePicture;
    return `${API_BASE_URL}${user.profilePicture}`;
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Profile Settings</h1>
        <p className="text-gray-400">Manage your account</p>
      </div>

      {message && (
        <div className={`p-4 rounded-lg ${
          message.includes('successfully') || !message.includes('Error')
            ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
            : 'bg-red-500/20 text-red-400 border border-red-500/30'
        }`}>
          {message}
        </div>
      )}

      {/* Rest of your JSX remains the same */}
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
                    className="w-full bg-gray-600 border border-gray-600 rounded-lg px-3 py-2 text-gray-400"
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
                    className="w-full bg-gray-600 border border-gray-600 rounded-lg px-3 py-2 text-gray-400"
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
                {user.profilePicture ? (
                  <>
                    <img
                      src={getProfilePictureUrl()}
                      alt="Profile"
                      className="w-24 h-24 rounded-full object-cover border-2 border-blue-500"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        onClick={handleDeleteProfilePicture}
                        disabled={loading}
                        className="text-white text-xs bg-red-600 hover:bg-red-700 px-3 py-2 rounded disabled:bg-red-400"
                      >
                        Remove Photo
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-3xl font-bold text-white">
                      {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </span>
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