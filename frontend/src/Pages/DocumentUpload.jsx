import React, { useState, useRef } from 'react';
import { UploadIcon, DocumentIcon, ShieldIcon, LockIcon, CloseIcon } from './Svg';

const DocumentUpload = () => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({});
  const [encryptionSettings, setEncryptionSettings] = useState({
    algorithm: 'AES-256-GCM',
    keySize: 256,
    enableSharing: false,
    shareWithUsers: [],
    accessExpiry: ''
  });
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    handleFiles(files);
  };

  const handleFiles = (files) => {
    const validFiles = files.filter(file => 
      file.type.startsWith('application/') || 
      file.type.startsWith('text/') || 
      file.type.startsWith('image/')
    );

    const newFiles = validFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      name: file.name,
      size: formatFileSize(file.size),
      type: file.type,
      status: 'pending', // pending, encrypting, uploading, completed, error
      encryptionStrength: 'AES-256'
    }));

    setSelectedFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (fileId) => {
    setSelectedFiles(prev => prev.filter(file => file.id !== fileId));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const simulateEncryptionProgress = (fileId) => {
    const steps = [0, 25, 50, 75, 100];
    let currentStep = 0;

    const interval = setInterval(() => {
      if (currentStep < steps.length) {
        setUploadProgress(prev => ({
          ...prev,
          [fileId]: steps[currentStep]
        }));
        currentStep++;
      } else {
        clearInterval(interval);
        // Update file status to completed
        setSelectedFiles(prev => 
          prev.map(file => 
            file.id === fileId 
              ? { ...file, status: 'completed' }
              : file
          )
        );
      }
    }, 300);
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      alert('Please select files to upload');
      return;
    }

    for (const file of selectedFiles) {
      if (file.status === 'pending') {
        // Update status to encrypting
        setSelectedFiles(prev => 
          prev.map(f => 
            f.id === file.id 
              ? { ...f, status: 'encrypting' }
              : f
          )
        );

        try {
          // Simulate encryption process
          simulateEncryptionProgress(file.id);

          // Here you would make API call to backend for actual encryption/upload
          const formData = new FormData();
          formData.append('file', file.file);
          formData.append('encryptionAlgorithm', encryptionSettings.algorithm);
          formData.append('enableSharing', encryptionSettings.enableSharing);

          // Mock API call
          await new Promise(resolve => setTimeout(resolve, 2000));

          console.log('File uploaded and encrypted:', file.name);

        } catch (error) {
          console.error('Upload error:', error);
          setSelectedFiles(prev => 
            prev.map(f => 
              f.id === file.id 
                ? { ...f, status: 'error' }
                : f
            )
          );
        }
      }
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'text-gray-400',
      encrypting: 'text-yellow-400',
      uploading: 'text-blue-400',
      completed: 'text-green-400',
      error: 'text-red-400'
    };
    return colors[status] || 'text-gray-400';
  };

  const getStatusText = (status) => {
    const texts = {
      pending: 'Ready to encrypt',
      encrypting: 'Encrypting...',
      uploading: 'Uploading...',
      completed: 'Encrypted & Secure',
      error: 'Encryption Failed'
    };
    return texts[status] || status;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Upload Documents</h1>
        <p className="text-gray-400">Securely encrypt and upload your documents</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - File Upload */}
        <div className="lg:col-span-2 space-y-6">
          {/* Drag & Drop Area */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
              dragActive 
                ? 'border-blue-500 bg-blue-500 bg-opacity-10' 
                : 'border-gray-600 hover:border-blue-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <UploadIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-lg font-medium text-white mb-2">
              Drag & Drop your files here
            </p>
            <p className="text-gray-400 mb-4">
              or click to browse your computer
            </p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium transition-colors"
            >
              Select Files
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />
            <p className="text-sm text-gray-500 mt-4">
              Supported: PDF, DOC, DOCX, XLS, XLSX, TXT, Images (Max 100MB each)
            </p>
          </div>

          {/* Selected Files List */}
          {selectedFiles.length > 0 && (
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                Selected Files ({selectedFiles.length})
              </h3>
              
              <div className="space-y-3">
                {selectedFiles.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-3 bg-gray-700 rounded-lg"
                  >
                    <div className="flex items-center space-x-3 flex-1">
                      <DocumentIcon className="w-8 h-8 text-blue-400" />
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium truncate">
                          {file.name}
                        </p>
                        <div className="flex items-center space-x-4 text-sm text-gray-400">
                          <span>{file.size}</span>
                          <span className="flex items-center space-x-1">
                            <ShieldIcon className="w-3 h-3" />
                            <span>{file.encryptionStrength}</span>
                          </span>
                        </div>
                        
                        {/* Progress Bar */}
                        {file.status === 'encrypting' && (
                          <div className="mt-2">
                            <div className="w-full bg-gray-600 rounded-full h-2">
                              <div 
                                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${uploadProgress[file.id] || 0}%` }}
                              ></div>
                            </div>
                            <p className="text-xs text-gray-400 mt-1">
                              Encrypting... {uploadProgress[file.id] || 0}%
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <span className={`text-sm font-medium ${getStatusColor(file.status)}`}>
                        {getStatusText(file.status)}
                      </span>
                      <button
                        onClick={() => removeFile(file.id)}
                        className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                      >
                        <CloseIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Upload Button */}
              <button
                onClick={handleUpload}
                disabled={selectedFiles.every(f => f.status === 'completed')}
                className={`w-full mt-6 py-3 px-4 rounded-lg font-semibold transition-all duration-200 ${
                  selectedFiles.every(f => f.status === 'completed')
                    ? 'bg-green-600 text-white'
                    : 'bg-blue-600 hover:bg-blue-700 text-white transform hover:scale-[1.02]'
                }`}
              >
                {selectedFiles.every(f => f.status === 'completed')
                  ? 'All Files Encrypted & Secure ✅'
                  : `Encrypt & Upload ${selectedFiles.length} File${selectedFiles.length > 1 ? 's' : ''}`
                }
              </button>
            </div>
          )}
        </div>

        {/* Right Column - Encryption Settings */}
        <div className="space-y-6">
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
            <div className="flex items-center space-x-2 mb-4">
              <LockIcon className="w-5 h-5 text-blue-400" />
              <h3 className="text-lg font-semibold text-white">Encryption Settings</h3>
            </div>

            <div className="space-y-4">
              {/* Encryption Algorithm */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Encryption Algorithm
                </label>
                <select
                  value={encryptionSettings.algorithm}
                  onChange={(e) => setEncryptionSettings(prev => ({
                    ...prev,
                    algorithm: e.target.value
                  }))}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="AES-256-GCM">AES-256-GCM (Recommended)</option>
                  <option value="AES-256-CBC">AES-256-CBC</option>
                  <option value="AES-128-GCM">AES-128-GCM</option>
                </select>
              </div>

              {/* Enable Sharing */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="enableSharing"
                  checked={encryptionSettings.enableSharing}
                  onChange={(e) => setEncryptionSettings(prev => ({
                    ...prev,
                    enableSharing: e.target.checked
                  }))}
                  className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                />
                <label htmlFor="enableSharing" className="ml-2 text-sm text-gray-300">
                  Enable document sharing
                </label>
              </div>

              {/* Access Expiry */}
              {encryptionSettings.enableSharing && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Access Expiry
                  </label>
                  <select
                    value={encryptionSettings.accessExpiry}
                    onChange={(e) => setEncryptionSettings(prev => ({
                      ...prev,
                      accessExpiry: e.target.value
                    }))}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">No expiry</option>
                    <option value="24h">24 Hours</option>
                    <option value="7d">7 Days</option>
                    <option value="30d">30 Days</option>
                    <option value="90d">90 Days</option>
                  </select>
                </div>
              )}

              {/* Security Info */}
              <div className="bg-blue-900 bg-opacity-20 border border-blue-800 rounded-lg p-3">
                <div className="flex items-start space-x-2">
                  <ShieldIcon className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-blue-300 font-medium">Military-Grade Encryption</p>
                    <p className="text-xs text-blue-200 mt-1">
                      Your files are encrypted with AES-256 before upload. 
                      Only you and authorized users can decrypt them.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
            <h4 className="text-sm font-semibold text-gray-300 mb-3">Encryption Stats</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Files to encrypt:</span>
                <span className="text-white">{selectedFiles.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Encryption:</span>
                <span className="text-green-400">AES-256</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Integrity:</span>
                <span className="text-green-400">SHA-256</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentUpload;