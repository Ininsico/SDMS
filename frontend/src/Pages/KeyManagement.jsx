import React, { useState, useEffect } from 'react';
import { 
  KeyIcon, 
  ShieldIcon, 
  DownloadIcon, 
  RefreshIcon, 
  EyeIcon,
  EyeOffIcon,
  CopyIcon,
  CheckIcon
} from './Svg';

const KeyManagement = () => {
  const [keys, setKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [copiedKey, setCopiedKey] = useState('');
  const [generating, setGenerating] = useState(false);

  // Mock data - replace with actual API call
  useEffect(() => {
    const fetchKeys = async () => {
      try {
        // Simulate API call
        setTimeout(() => {
          setKeys([
            {
              id: 1,
              type: 'RSA-2048',
              status: 'active',
              createdAt: '2024-01-10',
              expiresAt: '2025-01-10',
              publicKey: '-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAu1SU1LfVLPHCozMxH2Mo\n4lgOEePzNm0tRgeLezV6ffAt0gunVTLw7onLRnrq0/IzW7yWR7QkrmBL7jTKEn5u\n+qKhbwKfBstIs+bMY2Zkp18gnTxKLxoS2tFczGkPLPgizskuemMghRniWaoLw+Tl\n4tVbVc6yC7uZ1J7R7pZ0+fm+8K9ECx3X6d9jJ7Q9J8Z8J8J8J8J8J8J8J8J8J8J8\nJ8J8J8J8J8J8J8J8J8J8J8J8J8J8J8J8J8J8J8J8J8J8J8J8J8J8J8J8J8J8J8J8\nJ8J8J8J8J8J8J8J8J8J8J8J8J8J8J8J8J8J8J8J8J8J8J8J8J8J8J8J8J8J8J8J8\nJwIDAQAB\n-----END PUBLIC KEY-----',
              privateKey: '-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC7VJTUt9Us8cKj\nMzEfYyjiWA4R4/M2bS1GB4t7NXp98C3SC6dVMvDuictGeurT8jNbvJZHtCSuYEvu\nNMoSfm76oqFvAp8Gy0iz5sxjZmSnXyCdPEovGhLa0VzMaQ8s+CLOyS56YyCFGeJZ\nqgvD5OXi1VtVzrILu5nUntHulnT5+b7wr0QLHdfp32MntD0nxnwnwnwnwnwnwnwn\nwnwnwnwnwnwnwnwnwnwnwnwnwnwnwnwnwnwnwnwnwnwnwnwnwnwnwnwnwnwnwnwn\nwnwnwnwnwnwnwnwnwnwnwnwnwnwnwnwnwnwnwnwnwnwnwnwnwnwnwnwnwnwnwnwn\nwnwnwnwnwnwnwnwnwnwnwnwnwnwnwnwnwnwnwnwnwnwnwnwnwnwnwnwnwnwnwnwn\nJwIDAQABAoIBAQC7VJTUt9Us8cKjMzEfYyjiWA4R4/M2bS1GB4t7NXp98C3SC6dV\nMvDuictGeurT8jNbvJZHtCSuYEvuNMoSfm76oqFvAp8Gy0iz5sxjZmSnXyCdPEov\nGhLa0VzMaQ8s+CLOyS56YyCFGeJZqgvD5OXi1VtVzrILu5nUntHulnT5+b7wr0QL\nHdfp32MntD0nxnwnwnwnwnwnwnwnwnwnwnwnwnwnwnwnwnwnwnwnwnwnwnwnwnwn\nwnwnwnwnwnwnwnwnwnwnwnwnwnwnwnwnwnwnwnwnwnwnwnwnwnwnwnwnwnwnwnwn\nwnwnwnwnwnwnwnwnwnwnwnwnwnwnwnwnwnwnwnwnwnwnwnwnwnwnwnwnwnwnwnwn\nwnwnwnwnwnwnwnwnwnwnwnwnwnwnwnwnwnwnwnwnwnwnwnwnwnwnwnwnwnwnwnwn\n-----END PRIVATE KEY-----',
              documentsEncrypted: 24
            },
            {
              id: 2,
              type: 'RSA-4096',
              status: 'expired',
              createdAt: '2023-06-15',
              expiresAt: '2024-01-01',
              publicKey: '-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAwY4J6+7X6K9V6K9V6K9V\n6K9V6K9V6K9V6K9V6K9V6K9V6K9V6K9V6K9V6K9V6K9V6K9V6K9V6K9V6K9V6K9V\n6K9V6K9V6K9V6K9V6K9V6K9V6K9V6K9V6K9V6K9V6K9V6K9V6K9V6K9V6K9V6K9V\n6K9V6K9V6K9V6K9V6K9V6K9V6K9V6K9V6K9V6K9V6K9V6K9V6K9V6K9V6K9V6K9V\n6K9V6K9V6K9V6K9V6K9V6K9V6K9V6K9V6K9V6K9V6K9V6K9V6K9V6K9V6K9V6K9V\n6K9V6K9V6K9V6K9V6K9V6K9V6K9V6K9V6K9V6K9V6K9V6K9V6K9V6K9V6K9V6K9V\nJwIDAQAB\n-----END PUBLIC KEY-----',
              privateKey: '-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDBjgnr7tfor1Xo\nr1Xor1Xor1Xor1Xor1Xor1Xor1Xor1Xor1Xor1Xor1Xor1Xor1Xor1Xor1Xor1Xo\nr1Xor1Xor1Xor1Xor1Xor1Xor1Xor1Xor1Xor1Xor1Xor1Xor1Xor1Xor1Xor1Xo\nr1Xor1Xor1Xor1Xor1Xor1Xor1Xor1Xor1Xor1Xor1Xor1Xor1Xor1Xor1Xor1Xo\nr1Xor1Xor1Xor1Xor1Xor1Xor1Xor1Xor1Xor1Xor1Xor1Xor1Xor1Xor1Xor1Xo\nr1Xor1Xor1Xor1Xor1Xor1Xor1Xor1Xor1Xor1Xor1Xor1Xor1Xor1Xor1Xor1Xo\nr1Xor1Xor1Xor1Xor1Xor1Xor1Xor1Xor1Xor1Xor1Xor1Xor1Xor1Xor1Xor1Xo\nJwIDAQABAoIBAQDBjgnr7tfor1Xor1Xor1Xor1Xor1Xor1Xor1Xor1Xor1Xor1Xo\nr1Xor1Xor1Xor1Xor1Xor1Xor1Xor1Xor1Xor1Xor1Xor1Xor1Xor1Xor1Xor1Xo\nr1Xor1Xor1Xor1Xor1Xor1Xor1Xor1Xor1Xor1Xor1Xor1Xor1Xor1Xor1Xor1Xo\nr1Xor1Xor1Xor1Xor1Xor1Xor1Xor1Xor1Xor1Xor1Xor1Xor1Xor1Xor1Xor1Xo\nr1Xor1Xor1Xor1Xor1Xor1Xor1Xor1Xor1Xor1Xor1Xor1Xor1Xor1Xor1Xor1Xo\nr1Xor1Xor1Xor1Xor1Xor1Xor1Xor1Xor1Xor1Xor1Xor1Xor1Xor1Xor1Xor1Xo\nr1Xor1Xor1Xor1Xor1Xor1Xor1Xor1Xor1Xor1Xor1Xor1Xor1Xor1Xor1Xor1Xo\n-----END PRIVATE KEY-----',
              documentsEncrypted: 15
            }
          ]);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching keys:', error);
        setLoading(false);
      }
    };

    fetchKeys();
  }, []);

  const generateNewKeyPair = async () => {
    setGenerating(true);
    try {
      // API call to generate new RSA key pair
      setTimeout(() => {
        const newKey = {
          id: Date.now(),
          type: 'RSA-2048',
          status: 'active',
          createdAt: new Date().toISOString().split('T')[0],
          expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          publicKey: '-----BEGIN NEW PUBLIC KEY-----\n...\n-----END NEW PUBLIC KEY-----',
          privateKey: '-----BEGIN NEW PRIVATE KEY-----\n...\n-----END NEW PRIVATE KEY-----',
          documentsEncrypted: 0
        };
        setKeys(prev => [newKey, ...prev]);
        setGenerating(false);
        alert('New RSA key pair generated successfully!');
      }, 2000);
    } catch (error) {
      alert('Error generating key pair');
      setGenerating(false);
    }
  };

  const copyToClipboard = async (text, keyType) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(keyType);
      setTimeout(() => setCopiedKey(''), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const exportKey = (key, type) => {
    const blob = new Blob([key], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${type}_key_${new Date().getTime()}.pem`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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

  const isKeyExpired = (expiresAt) => {
    return new Date(expiresAt) < new Date();
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
          <h1 className="text-2xl font-bold text-white">Key Management</h1>
          <p className="text-gray-400">Manage your RSA encryption key pairs</p>
        </div>
        
        <button
          onClick={generateNewKeyPair}
          disabled={generating}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshIcon className="w-5 h-5" />
          <span>{generating ? 'Generating...' : 'Generate New Key Pair'}</span>
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="text-2xl font-bold text-white">{keys.length}</div>
          <div className="text-sm text-gray-400">Total Key Pairs</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="text-2xl font-bold text-green-400">
            {keys.filter(k => k.status === 'active').length}
          </div>
          <div className="text-sm text-gray-400">Active Keys</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="text-2xl font-bold text-red-400">
            {keys.filter(k => k.status === 'expired').length}
          </div>
          <div className="text-sm text-gray-400">Expired Keys</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="text-2xl font-bold text-blue-400">
            {keys.reduce((acc, key) => acc + key.documentsEncrypted, 0)}
          </div>
          <div className="text-sm text-gray-400">Documents Encrypted</div>
        </div>
      </div>

      {/* Keys List */}
      <div className="space-y-4">
        {keys.map((key) => (
          <div key={key.id} className="bg-gray-800 rounded-lg border border-gray-700 p-6">
            {/* Key Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
              <div className="flex items-center space-x-3">
                <KeyIcon className="w-8 h-8 text-yellow-400" />
                <div>
                  <h3 className="text-lg font-semibold text-white">{key.type} Key Pair</h3>
                  <div className="flex items-center space-x-4 text-sm text-gray-400">
                    <span>Created: {key.createdAt}</span>
                    <span>Expires: {key.expiresAt}</span>
                    <span>{key.documentsEncrypted} documents</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2 mt-2 sm:mt-0">
                {getStatusBadge(key.status)}
                {isKeyExpired(key.expiresAt) && (
                  <span className="text-xs text-red-400">(Expired)</span>
                )}
              </div>
            </div>

            {/* Keys Display */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Public Key */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-300">Public Key</label>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => copyToClipboard(key.publicKey, 'public')}
                      className="p-1 text-gray-400 hover:text-blue-400 transition-colors"
                      title="Copy Public Key"
                    >
                      {copiedKey === 'public' ? <CheckIcon className="w-4 h-4" /> : <CopyIcon className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => exportKey(key.publicKey, 'public')}
                      className="p-1 text-gray-400 hover:text-green-400 transition-colors"
                      title="Export Public Key"
                    >
                      <DownloadIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="bg-gray-900 rounded p-3">
                  <pre className="text-xs text-gray-300 whitespace-pre-wrap break-words">
                    {key.publicKey}
                  </pre>
                </div>
              </div>

              {/* Private Key */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-300">Private Key</label>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => setShowPrivateKey(!showPrivateKey)}
                      className="p-1 text-gray-400 hover:text-yellow-400 transition-colors"
                      title={showPrivateKey ? 'Hide Private Key' : 'Show Private Key'}
                    >
                      {showPrivateKey ? <EyeOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => copyToClipboard(key.privateKey, 'private')}
                      className="p-1 text-gray-400 hover:text-blue-400 transition-colors"
                      title="Copy Private Key"
                    >
                      {copiedKey === 'private' ? <CheckIcon className="w-4 h-4" /> : <CopyIcon className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => exportKey(key.privateKey, 'private')}
                      className="p-1 text-gray-400 hover:text-green-400 transition-colors"
                      title="Export Private Key"
                    >
                      <DownloadIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="bg-gray-900 rounded p-3">
                  <pre className="text-xs text-gray-300 whitespace-pre-wrap break-words">
                    {showPrivateKey ? key.privateKey : '••••••••••••••••••••••••••••••••'}
                  </pre>
                </div>
              </div>
            </div>

            {/* Security Warning */}
            {showPrivateKey && (
              <div className="mt-4 p-3 bg-red-900 bg-opacity-20 border border-red-800 rounded-lg">
                <div className="flex items-start space-x-2">
                  <ShieldIcon className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-red-300 font-medium">Security Warning</p>
                    <p className="text-xs text-red-200 mt-1">
                      Your private key is sensitive information. Never share it with anyone and store it securely.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Empty State */}
      {keys.length === 0 && (
        <div className="text-center py-12">
          <KeyIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No encryption keys</h3>
          <p className="text-gray-400 mb-4">
            Generate your first RSA key pair to start encrypting documents
          </p>
          <button
            onClick={generateNewKeyPair}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium transition-colors"
          >
            Generate Key Pair
          </button>
        </div>
      )}
    </div>
  );
};

// Add missing icons to SVG.jsx
const EyeOffIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
  </svg>
);

const CopyIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
  </svg>
);

export default KeyManagement;