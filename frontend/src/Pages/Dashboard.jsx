import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import DocumentUpload from './DocumentUpload';
import DocumentList from './DocumentList';
import SharedDocuments from './SharedDocuments';
import UserManagement from './UserManagement';
import KeyManagement from './KeyManagement';
import AccessControl from './AccessControl';
import EncryptionStatus from './EncryptionStatus';
import Profile from './Profile';
import { 
  DocumentIcon, 
  UploadIcon, 
  ShareIcon, 
  UsersIcon, 
  KeyIcon, 
  LockIcon, 
  ShieldIcon,
  LogoutIcon,
  ProfileIcon,
  MenuIcon,
  CloseIcon 
} from './Svg';

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get user info from localStorage (set during login)
  const userRole = localStorage.getItem('userRole') || 'user';
  const userName = localStorage.getItem('userName') || 'User';

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    navigate('/login');
  };

  const navigationItems = [
    { id: 'documents', name: 'My Documents', icon: DocumentIcon, path: '/dashboard' },
    { id: 'upload', name: 'Upload Document', icon: UploadIcon, path: '/dashboard/upload' },
    { id: 'shared', name: 'Shared Documents', icon: ShareIcon, path: '/dashboard/shared' },
    { id: 'keys', name: 'Key Management', icon: KeyIcon, path: '/dashboard/keys' },
    { id: 'access', name: 'Access Control', icon: LockIcon, path: '/dashboard/access' },
    { id: 'encryption', name: 'Encryption Status', icon: ShieldIcon, path: '/dashboard/encryption' },
    ...(userRole === 'admin' ? [{ id: 'users', name: 'User Management', icon: UsersIcon, path: '/dashboard/users' }] : []),
    { id: 'profile', name: 'Profile', icon: ProfileIcon, path: '/dashboard/profile' },
  ];

  const getActiveTab = () => {
    const currentPath = location.pathname;
    const activeItem = navigationItems.find(item => currentPath === item.path);
    return activeItem?.id || 'documents';
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-gray-800 transform transition duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between h-16 px-4 bg-gray-900 border-b border-gray-700">
          <h1 className="text-xl font-bold text-blue-400">SecureDMS</h1>
          <button 
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700"
          >
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="mt-8 px-4 space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = getActiveTab() === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => {
                  navigate(item.path);
                  setSidebarOpen(false);
                }}
                className={`
                  w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200
                  ${isActive 
                    ? 'bg-blue-600 text-white shadow-lg' 
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }
                `}
              >
                <Icon className="w-5 h-5 mr-3" />
                {item.name}
              </button>
            );
          })}
        </nav>

        {/* User info and logout at bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-700 bg-gray-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-sm font-semibold">{userName.charAt(0).toUpperCase()}</span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-white">{userName}</p>
                <p className="text-xs text-gray-400 capitalize">{userRole}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-gray-400 hover:text-red-400 transition-colors"
              title="Logout"
            >
              <LogoutIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:ml-64">
        {/* Header */}
        <header className="bg-gray-800 border-b border-gray-700">
          <div className="flex items-center justify-between h-16 px-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700"
            >
              <MenuIcon className="w-6 h-6" />
            </button>
            
            <div className="flex-1 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-white capitalize">
                {navigationItems.find(item => item.id === getActiveTab())?.name || 'Dashboard'}
              </h2>
              
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-300">
                  Welcome back, <span className="font-semibold text-white">{userName}</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6">
          <Routes>
            <Route path="/" element={<DocumentList />} />
            <Route path="/upload" element={<DocumentUpload />} />
            <Route path="/shared" element={<SharedDocuments />} />
            <Route path="/keys" element={<KeyManagement />} />
            <Route path="/access" element={<AccessControl />} />
            <Route path="/encryption" element={<EncryptionStatus />} />
            <Route path="/profile" element={<Profile />} />
            {userRole === 'admin' && (
              <Route path="/users" element={<UserManagement />} />
            )}
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;