import React, { useState, useEffect } from 'react';
import {
    DocumentIcon,
    LockIcon,
    ShareIcon,
    DownloadIcon,
    KeyIcon,
    ShieldIcon,
    CheckIcon,
    CopyIcon,
    EyeIcon,
    EyeSlashIcon,
    CloseIcon
} from './Svg';

const API_BASE = 'http://localhost:5000';

const EncryptionLab = () => {
    const [documents, setDocuments] = useState([]);
    const [selectedDocument, setSelectedDocument] = useState(null);
    const [userKeys, setUserKeys] = useState(null);
    const [loading, setLoading] = useState(false);
    const [shareSettings, setShareSettings] = useState({
        password: '',
        expiryDays: 7,
        maxDownloads: 5
    });
    const [generatedLink, setGeneratedLink] = useState('');
    const [privateKey, setPrivateKey] = useState('');
    const [showPrivateKey, setShowPrivateKey] = useState(false);
    const [showPublicKey, setShowPublicKey] = useState(false);
    const [showSharePopup, setShowSharePopup] = useState(false);
    const [downloadLoading, setDownloadLoading] = useState(false);
    const [activeDownloadType, setActiveDownloadType] = useState(''); // 'encrypted' or 'decrypted'

    const fetchDocuments = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE}/api/documents`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (data.success) {
                setDocuments(data.data.documents);
            }
        } catch (error) {
            console.error('Error fetching documents:', error);
        }
    };

    const fetchUserKeys = async () => {
        try {
            const token = localStorage.getItem('token');
            
            // Fetch public key
            const publicResponse = await fetch(`${API_BASE}/api/encryption/keys/public`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const publicData = await publicResponse.json();
            
            if (publicData.success) {
                // Try to get private key from localStorage first
                const storedPrivateKey = localStorage.getItem('userPrivateKey');
                if (storedPrivateKey) {
                    setUserKeys({
                        publicKey: publicData.data.publicKey,
                        privateKey: storedPrivateKey
                    });
                    setPrivateKey(storedPrivateKey);
                } else {
                    // If no stored private key, try to fetch it
                    const privateResponse = await fetch(`${API_BASE}/api/encryption/keys/private`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    const privateData = await privateResponse.json();
                    
                    if (privateData.success) {
                        setUserKeys({
                            publicKey: publicData.data.publicKey,
                            privateKey: privateData.data.privateKey
                        });
                        setPrivateKey(privateData.data.privateKey);
                        localStorage.setItem('userPrivateKey', privateData.data.privateKey);
                    } else {
                        // Only public key available
                        setUserKeys({
                            publicKey: publicData.data.publicKey,
                            privateKey: null
                        });
                    }
                }
            }
        } catch (error) {
            console.error('Error fetching keys:', error);
        }
    };

    const generateKeys = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE}/api/encryption/keys/generate`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            const data = await response.json();
            if (data.success) {
                // Store both keys
                const keys = {
                    publicKey: data.data.publicKey,
                    privateKey: data.data.privateKey
                };
                setUserKeys(keys);
                setPrivateKey(data.data.privateKey);
                localStorage.setItem('userPrivateKey', data.data.privateKey);
                localStorage.setItem('userPublicKey', data.data.publicKey);
                alert('Encryption keys generated successfully!');
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.error('Error generating keys:', error);
            alert('Failed to generate encryption keys');
        }
        setLoading(false);
    };

    const encryptDocument = async (documentId) => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE}/api/encryption/documents/${documentId}/encrypt`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (data.success) {
                await fetchDocuments();
                // Update selected document if it's the one we encrypted
                if (selectedDocument && selectedDocument._id === documentId) {
                    const updatedDoc = documents.find(doc => doc._id === documentId);
                    if (updatedDoc) {
                        setSelectedDocument(updatedDoc);
                    }
                }
                alert('Document encrypted successfully!');
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.error('Error encrypting document:', error);
            alert('Failed to encrypt document');
        }
        setLoading(false);
    };

    const createDirectDownloadLink = async (documentId) => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            
            const response = await fetch(`${API_BASE}/api/share/documents/${documentId}/direct-download`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    expiryDays: shareSettings.expiryDays,
                    maxDownloads: shareSettings.maxDownloads
                })
            });
            
            const data = await response.json();
            if (data.success) {
                setGeneratedLink(data.data.directDownloadLink);
                setShowSharePopup(true);
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.error('Error creating direct download link:', error);
            alert('Failed to create download link');
        }
        setLoading(false);
    };

    // DOWNLOAD ENCRYPTED FILE (AS IS - NO DECRYPTION)
    const downloadEncryptedFile = async (documentId) => {
        setDownloadLoading(true);
        setActiveDownloadType('encrypted');
        try {
            console.log('DOWNLOADING ENCRYPTED DOCUMENT:', documentId);
            const token = localStorage.getItem('token');
            
            const response = await fetch(`${API_BASE}/api/documents/download/${documentId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            console.log('DOWNLOAD RESPONSE STATUS:', response.status);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('DOWNLOAD ERROR:', errorText);
                throw new Error(`Download failed: ${response.status}`);
            }

            const blob = await response.blob();
            console.log('ENCRYPTED BLOB SIZE:', blob.size);
            
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;

            // Get filename from content disposition or use document name
            const contentDisposition = response.headers.get('Content-Disposition');
            let filename = selectedDocument?.name || 'document';
            if (contentDisposition) {
                const filenameMatch = contentDisposition.match(/filename="(.+)"/);
                if (filenameMatch) filename = filenameMatch[1];
            }
            
            // Add encrypted extension if not already present
            if (!filename.includes('encrypted')) {
                const fileExt = filename.split('.').pop();
                filename = filename.replace(`.${fileExt}`, `_encrypted.${fileExt}`);
            }

            a.download = filename;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            
            console.log('ENCRYPTED FILE DOWNLOADED SUCCESSFULLY');
            
        } catch (error) {
            console.error('Error downloading encrypted document:', error);
            alert('Failed to download encrypted file: ' + error.message);
        }
        setDownloadLoading(false);
        setActiveDownloadType('');
    };

    // DECRYPT AND DOWNLOAD ORIGINAL FILE
    const decryptAndDownload = async (documentId) => {
        setDownloadLoading(true);
        setActiveDownloadType('decrypted');
        try {
            if (!privateKey) {
                alert('Private key is required to decrypt files! Copy your private key first.');
                return;
            }

            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE}/api/documents/decrypt/${documentId}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    privateKey: privateKey
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Decryption failed');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            
            // Get filename from content disposition or use document name
            const contentDisposition = response.headers.get('Content-Disposition');
            let filename = selectedDocument?.originalName || selectedDocument?.name || 'decrypted_document';
            if (contentDisposition) {
                const filenameMatch = contentDisposition.match(/filename="(.+)"/);
                if (filenameMatch) filename = filenameMatch[1];
            }
            
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            
            console.log('FILE DECRYPTED AND DOWNLOADED SUCCESSFULLY');
            
        } catch (error) {
            console.error('Error decrypting document:', error);
            alert('Failed to decrypt document: ' + error.message);
        }
        setDownloadLoading(false);
        setActiveDownloadType('');
    };

    // DOWNLOAD ORIGINAL FILE (FOR UNENCRYPTED DOCUMENTS)
    const downloadOriginalFile = async (documentId) => {
        setDownloadLoading(true);
        setActiveDownloadType('original');
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE}/api/documents/download/${documentId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error(`Download failed: ${response.status}`);
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            
            const contentDisposition = response.headers.get('Content-Disposition');
            let filename = selectedDocument?.originalName || selectedDocument?.name || 'document';
            if (contentDisposition) {
                const filenameMatch = contentDisposition.match(/filename="(.+)"/);
                if (filenameMatch) filename = filenameMatch[1];
            }
            
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            
        } catch (error) {
            console.error('Error downloading document:', error);
            alert('Failed to download document: ' + error.message);
        }
        setDownloadLoading(false);
        setActiveDownloadType('');
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        alert('Copied to clipboard!');
    };

    const copyPublicKey = () => {
        if (userKeys?.publicKey) {
            copyToClipboard(userKeys.publicKey);
        } else {
            alert('No public key found. Generate keys first.');
        }
    };

    const copyPrivateKey = () => {
        if (privateKey) {
            copyToClipboard(privateKey);
        } else {
            alert('No private key found. Generate keys first.');
        }
    };

    const closeSharePopup = () => {
        setShowSharePopup(false);
        setGeneratedLink('');
    };

    useEffect(() => {
        fetchDocuments();
        fetchUserKeys();
    }, []);

    return (
        <div className="min-h-screen bg-gray-900 text-white p-6">
            {/* Share Link Popup */}
            {showSharePopup && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 max-w-md w-full">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-semibold text-green-400">Encrypted File Download Link</h3>
                            <button
                                onClick={closeSharePopup}
                                className="text-gray-400 hover:text-white"
                            >
                                <CloseIcon className="w-6 h-6" />
                            </button>
                        </div>
                        
                        <p className="text-gray-300 mb-4">
                            Share this link to allow others to download the encrypted file
                        </p>
                        
                        <div className="bg-gray-700 rounded-lg p-3 mb-4">
                            <p className="text-sm text-gray-400 break-all">{generatedLink}</p>
                        </div>
                        
                        <div className="flex space-x-2">
                            <button
                                onClick={() => copyToClipboard(generatedLink)}
                                className="flex-1 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors"
                            >
                                <CopyIcon className="w-4 h-4" />
                                <span>Copy Link</span>
                            </button>
                            <button
                                onClick={closeSharePopup}
                                className="flex-1 bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded-lg transition-colors"
                            >
                                Close
                            </button>
                        </div>
                        
                        <div className="mt-4 p-3 bg-yellow-900 bg-opacity-30 rounded-lg">
                            <p className="text-sm text-yellow-300">
                                <strong>Note:</strong> This downloads the encrypted file. Recipients need your public key and their own private key to decrypt it.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold">Encryption Laboratory</h1>
                    <p className="text-gray-400">Manage, encrypt, and share your documents securely</p>
                </div>

                {/* Keys Section */}
                <div className="bg-gray-800 rounded-lg p-6 mb-6 border border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                            <KeyIcon className="w-8 h-8 text-blue-400" />
                            <div>
                                <h3 className="text-lg font-semibold">Encryption Keys</h3>
                                <p className="text-gray-400 text-sm">
                                    {userKeys ? 'RSA-2048 keys generated' : 'No encryption keys found'}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={generateKeys}
                            disabled={loading}
                            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-medium disabled:opacity-50"
                        >
                            {loading ? 'Generating...' : 'Generate Keys'}
                        </button>
                    </div>

                    {/* Keys Display */}
                    {userKeys && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            {/* Public Key */}
                            <div className="bg-gray-750 rounded-lg p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <h4 className="font-semibold text-green-400">Public Key</h4>
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => setShowPublicKey(!showPublicKey)}
                                            className="text-gray-400 hover:text-white"
                                        >
                                            {showPublicKey ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                                        </button>
                                        <button
                                            onClick={copyPublicKey}
                                            className="text-gray-400 hover:text-white"
                                        >
                                            <CopyIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                                {showPublicKey ? (
                                    <textarea
                                        value={userKeys.publicKey}
                                        readOnly
                                        className="w-full h-24 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-xs font-mono"
                                    />
                                ) : (
                                    <p className="text-gray-400 text-sm">Click eye icon to reveal public key</p>
                                )}
                                <p className="text-green-300 text-xs mt-1">Share this with others</p>
                            </div>

                            {/* Private Key */}
                            <div className="bg-gray-750 rounded-lg p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <h4 className="font-semibold text-red-400">Private Key</h4>
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => setShowPrivateKey(!showPrivateKey)}
                                            className="text-gray-400 hover:text-white"
                                        >
                                            {showPrivateKey ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                                        </button>
                                        <button
                                            onClick={copyPrivateKey}
                                            className="text-gray-400 hover:text-white"
                                        >
                                            <CopyIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                                {showPrivateKey && privateKey ? (
                                    <textarea
                                        value={privateKey}
                                        readOnly
                                        className="w-full h-24 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-xs font-mono"
                                    />
                                ) : (
                                    <div>
                                        <p className="text-gray-400 text-sm">Click eye icon to reveal private key</p>
                                        {!privateKey && (
                                            <p className="text-red-300 text-xs mt-1">No private key found. Generate keys first.</p>
                                        )}
                                    </div>
                                )}
                                <p className="text-red-300 text-xs mt-1">⚠️ NEVER SHARE THIS!</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Documents List */}
                    <div className="lg:col-span-1 bg-gray-800 rounded-lg border border-gray-700">
                        <div className="p-4 border-b border-gray-700">
                            <h3 className="font-semibold">Your Documents ({documents.length})</h3>
                        </div>
                        <div className="max-h-96 overflow-y-auto">
                            {documents.map((doc) => (
                                <div
                                    key={doc._id}
                                    className={`p-4 border-b border-gray-700 cursor-pointer hover:bg-gray-750 transition-colors ${selectedDocument?._id === doc._id ? 'bg-gray-750' : ''
                                        }`}
                                    onClick={() => setSelectedDocument(doc)}
                                >
                                    <div className="flex items-center space-x-3">
                                        <DocumentIcon className="w-5 h-5 text-blue-400 flex-shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium truncate">{doc.name}</p>
                                            <div className="flex items-center space-x-2 text-xs text-gray-400">
                                                <span>{(doc.size / 1024).toFixed(1)} KB</span>
                                                {doc.encrypted && (
                                                    <span className="flex items-center space-x-1 text-green-400">
                                                        <ShieldIcon className="w-3 h-3" />
                                                        <span>Encrypted</span>
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {documents.length === 0 && (
                                <div className="p-4 text-center text-gray-400">
                                    No documents found
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Document Details & Actions */}
                    <div className="lg:col-span-3 space-y-6">
                        {selectedDocument ? (
                            <>
                                {/* Document Info */}
                                <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center space-x-3">
                                            <DocumentIcon className="w-6 h-6 text-blue-400" />
                                            <h3 className="text-xl font-semibold">{selectedDocument.name}</h3>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${selectedDocument.encrypted
                                                    ? 'bg-green-900 text-green-300'
                                                    : 'bg-yellow-900 text-yellow-300'
                                                }`}>
                                                {selectedDocument.encrypted ? 'ENCRYPTED' : 'UNENCRYPTED'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                        <div>
                                            <p className="text-gray-400">Size</p>
                                            <p className="font-medium">{(selectedDocument.size / 1024).toFixed(1)} KB</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-400">Type</p>
                                            <p className="font-medium">{selectedDocument.filetype}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-400">Uploaded</p>
                                            <p className="font-medium">
                                                {new Date(selectedDocument.uploadDate).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-gray-400">Status</p>
                                            <p className="font-medium">
                                                {selectedDocument.encrypted ? 'Secure' : 'Unprotected'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {!selectedDocument.encrypted && (
                                        <button
                                            onClick={() => encryptDocument(selectedDocument._id)}
                                            disabled={loading || !userKeys}
                                            className="bg-yellow-600 hover:bg-yellow-700 p-4 rounded-lg flex items-center justify-center space-x-2 disabled:opacity-50 transition-colors"
                                        >
                                            <LockIcon className="w-5 h-5" />
                                            <span>{loading ? 'Encrypting...' : 'Encrypt Document'}</span>
                                        </button>
                                    )}

                                    {/* Download Buttons */}
                                    {selectedDocument.encrypted ? (
                                        <>
                                            {/* Download Encrypted File */}
                                            <button
                                                onClick={() => downloadEncryptedFile(selectedDocument._id)}
                                                disabled={downloadLoading && activeDownloadType === 'encrypted'}
                                                className="bg-green-600 hover:bg-green-700 p-4 rounded-lg flex items-center justify-center space-x-2 disabled:opacity-50 transition-colors"
                                            >
                                                <DownloadIcon className="w-5 h-5" />
                                                <span>
                                                    {downloadLoading && activeDownloadType === 'encrypted' 
                                                        ? 'Downloading...' 
                                                        : 'Download Encrypted'
                                                    }
                                                </span>
                                            </button>

                                            {/* Decrypt & Download */}
                                            <button
                                                onClick={() => decryptAndDownload(selectedDocument._id)}
                                                disabled={(downloadLoading && activeDownloadType === 'decrypted') || !privateKey}
                                                className="bg-blue-600 hover:bg-blue-700 p-4 rounded-lg flex items-center justify-center space-x-2 disabled:opacity-50 transition-colors"
                                            >
                                                <KeyIcon className="w-5 h-5" />
                                                <span>
                                                    {downloadLoading && activeDownloadType === 'decrypted' 
                                                        ? 'Decrypting...' 
                                                        : 'Decrypt & Download'
                                                    }
                                                </span>
                                            </button>
                                        </>
                                    ) : (
                                        /* Download Original (Unencrypted) */
                                        <button
                                            onClick={() => downloadOriginalFile(selectedDocument._id)}
                                            disabled={downloadLoading && activeDownloadType === 'original'}
                                            className="bg-green-600 hover:bg-green-700 p-4 rounded-lg flex items-center justify-center space-x-2 disabled:opacity-50 transition-colors"
                                        >
                                            <DownloadIcon className="w-5 h-5" />
                                            <span>
                                                {downloadLoading && activeDownloadType === 'original' 
                                                    ? 'Downloading...' 
                                                    : 'Download Original'
                                                }
                                            </span>
                                        </button>
                                    )}

                                    {/* Share Button */}
                                    {selectedDocument.encrypted && (
                                        <button
                                            onClick={() => createDirectDownloadLink(selectedDocument._id)}
                                            disabled={loading}
                                            className="bg-purple-600 hover:bg-purple-700 p-4 rounded-lg flex items-center justify-center space-x-2 disabled:opacity-50 transition-colors"
                                        >
                                            <ShareIcon className="w-5 h-5" />
                                            <span>{loading ? 'Creating...' : 'Create Share Link'}</span>
                                        </button>
                                    )}
                                </div>

                                {/* Instructions */}
                                {selectedDocument.encrypted && (
                                    <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
                                        <h4 className="font-semibold mb-4 text-yellow-400">How to Use Encrypted Files:</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                            <div className="bg-gray-750 p-4 rounded-lg">
                                                <h5 className="font-semibold text-green-400 mb-2">Download Encrypted</h5>
                                                <p className="text-gray-300">Gets the encrypted file as-is. Use this if you want to store or transfer the encrypted file.</p>
                                            </div>
                                            <div className="bg-gray-750 p-4 rounded-lg">
                                                <h5 className="font-semibold text-blue-400 mb-2">Decrypt & Download</h5>
                                                <p className="text-gray-300">Uses your private key to decrypt and download the original file. Requires your private key.</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Share Settings */}
                                {selectedDocument.encrypted && (
                                    <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
                                        <h4 className="font-semibold mb-4 flex items-center space-x-2">
                                            <ShareIcon className="w-5 h-5 text-purple-400" />
                                            <span>Share Link Settings</span>
                                        </h4>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm text-gray-400 mb-2">Expiry Days</label>
                                                <select
                                                    value={shareSettings.expiryDays}
                                                    onChange={(e) => setShareSettings(prev => ({
                                                        ...prev,
                                                        expiryDays: parseInt(e.target.value)
                                                    }))}
                                                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-purple-500 focus:outline-none"
                                                >
                                                    <option value={1}>1 Day</option>
                                                    <option value={7}>7 Days</option>
                                                    <option value={30}>30 Days</option>
                                                    <option value={90}>90 Days</option>
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-sm text-gray-400 mb-2">Max Downloads</label>
                                                <select
                                                    value={shareSettings.maxDownloads}
                                                    onChange={(e) => setShareSettings(prev => ({
                                                        ...prev,
                                                        maxDownloads: parseInt(e.target.value)
                                                    }))}
                                                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-purple-500 focus:outline-none"
                                                >
                                                    <option value={1}>1 Download</option>
                                                    <option value={5}>5 Downloads</option>
                                                    <option value={10}>10 Downloads</option>
                                                    <option value={25}>25 Downloads</option>
                                                    <option value={0}>Unlimited</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="bg-gray-800 rounded-lg border border-gray-700 p-12 text-center">
                                <DocumentIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                                <h3 className="text-xl font-semibold text-gray-400 mb-2">
                                    Select a Document
                                </h3>
                                <p className="text-gray-500">
                                    Choose a document from the list to view encryption options
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EncryptionLab;