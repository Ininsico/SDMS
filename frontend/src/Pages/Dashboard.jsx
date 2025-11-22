import React, { useState } from 'react';
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
    SearchIcon,
    DownloadIcon
} from './Svg';
import DocumentUpload from './DocumentUpload';
import DocumentList from './DocumentList';
import KeyManagement from './KeyManagement';
import AccessControl from './AccessControl';
import EncryptionStatus from './EncryptionStatus';
import SharedDocuments from './SharedDocuments';
import UserManagement from './UserManagement';
import Profile from './Profile';

const Dashboard = () => {
    const [activeSection, setActiveSection] = useState('documents');
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const handleNavigation = (section) => {
        setActiveSection(section);
    };

    const navItems = [
        { id: 'documents', label: 'My Documents', icon: DocumentIcon },
        { id: 'upload', label: 'Upload Document', icon: UploadIcon },
        { id: 'shared', label: 'Shared Documents', icon: ShareIcon },
        { id: 'keys', label: 'Key Management', icon: KeyIcon },
        { id: 'access', label: 'Access Control', icon: LockIcon },
        { id: 'encryption', label: 'Encryption Status', icon: ShieldIcon },
        { id: 'users', label: 'User Management', icon: UsersIcon },
        { id: 'profile', label: 'Profile', icon: ProfileIcon },
    ];

    // Mock data for documents section
    const documents = [
        { id: 1, name: 'Financial_Report_Q3.pdf', size: '2.4 MB', date: '2024-01-15', encrypted: true },
        { id: 2, name: 'Project_Proposal.docx', size: '1.8 MB', date: '2024-01-14', encrypted: true },
        { id: 3, name: 'Client_Contract.pdf', size: '3.1 MB', date: '2024-01-13', encrypted: true },
    ];

    const stats = [
        { label: 'Total Documents', value: '47', color: 'text-white' },
        { label: 'Encrypted', value: '42', color: 'text-green-400' },
        { label: 'Shared', value: '18', color: 'text-blue-400' },
        { label: 'Active Keys', value: '3', color: 'text-purple-400' },
    ];

    return (
        <div className="flex h-screen bg-gray-900 text-white">
            {/* Sidebar */}
            <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-gray-800 transition-all duration-300 flex flex-col`}>
                <div className="p-4 border-b border-gray-700 flex items-center justify-between">
                    {sidebarOpen && <h1 className="text-xl font-bold text-blue-400">SecureDMS</h1>}
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="p-2 rounded hover:bg-gray-700 transition-colors"
                    >
                        {sidebarOpen ? '«' : '»'}
                    </button>
                </div>

                <nav className="flex-1 overflow-y-auto p-4">
                    <ul className="space-y-1">
                        {navItems.map((item) => (
                            <li key={item.id}>
                                <button
                                    onClick={() => handleNavigation(item.id)}
                                    className={`w-full flex items-center p-3 rounded transition-colors ${activeSection === item.id ? 'bg-blue-600 text-white' : 'hover:bg-gray-700'
                                        }`}
                                >
                                    <item.icon className="w-5 h-5" />
                                    {sidebarOpen && <span className="ml-3">{item.label}</span>}
                                </button>
                            </li>
                        ))}
                    </ul>
                </nav>

                {/* User info at bottom */}
                <div className="p-4 border-t border-gray-700">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-sm font-semibold text-white">A</span>
                        </div>
                        {sidebarOpen && (
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-white truncate">Arslan Rathore</p>
                                <p className="text-xs text-gray-400">Admin</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <header className="bg-gray-800 border-b border-gray-700 p-4 flex justify-between items-center">
                    <h2 className="text-xl font-semibold uppercase tracking-wide">
                        {navItems.find(item => item.id === activeSection)?.label || 'Dashboard'}
                    </h2>
                    <div className="flex items-center space-x-4">
                        <div className="relative">
                            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search..."
                                className="pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <button className="p-2 text-gray-400 hover:text-white transition-colors">
                            <LogoutIcon className="w-5 h-5" />
                        </button>
                    </div>
                </header>

                {/* Content Area - THIS IS WHERE THE COMPONENTS GET DISPLAYED */}
                <main className="flex-1 overflow-auto p-6 bg-gray-900">

                    {activeSection === 'documents' && (
                        <DocumentList />
                    )}

                    {/* Upload Section - THIS IS WHERE DocumentUpload COMPONENT IS INTEGRATED */}
                    {activeSection === 'upload' && (
                        <DocumentUpload />
                    )}
                    {activeSection === 'shared' && (
                        <SharedDocuments />
                    )}

                    {activeSection === 'keys' && (
                        <KeyManagement />
                    )}
                    {activeSection === 'access' && (
                        <AccessControl />
                    )}
                    {activeSection === 'encryption' && (
                        <EncryptionStatus />
                    )}
                    {activeSection === 'users' && (
                        <UserManagement />
                    )}

                    {activeSection === 'profile' && (
                        <Profile />
                    )}

                </main>
            </div>
        </div>
    );
};

export default Dashboard;