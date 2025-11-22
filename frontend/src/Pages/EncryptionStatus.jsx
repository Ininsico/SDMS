import React, { useState, useEffect } from 'react';
import { 
  ShieldIcon, 
  LockIcon, 
  CheckIcon, 
  WarningIcon, 
  DocumentIcon,
  UsersIcon,
  KeyIcon,
  RefreshIcon,
  TrendingUpIcon
} from './Svg';

const EncryptionStatus = () => {
  const [securityStats, setSecurityStats] = useState({});
  const [recentActivity, setRecentActivity] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mock data - replace with actual API calls
  useEffect(() => {
    const fetchSecurityData = async () => {
      try {
        // Simulate API calls
        setTimeout(() => {
          setSecurityStats({
            totalDocuments: 47,
            encryptedDocuments: 42,
            integrityVerified: 45,
            pendingEncryption: 2,
            failedEncryption: 1,
            activeKeys: 3,
            expiredKeys: 1,
            sharedDocuments: 18,
            securityScore: 92
          });

          setRecentActivity([
            {
              id: 1,
              type: 'encryption',
              document: 'Financial_Report_Q4.pdf',
              status: 'success',
              timestamp: '2024-01-16 14:30',
              details: 'AES-256-GCM encryption completed'
            },
            {
              id: 2,
              type: 'integrity',
              document: 'Project_Plan.docx',
              status: 'warning',
              timestamp: '2024-01-16 13:15',
              details: 'SHA-256 hash mismatch detected'
            },
            {
              id: 3,
              type: 'sharing',
              document: 'Client_Contract.pdf',
              status: 'success',
              timestamp: '2024-01-16 11:45',
              details: 'Document shared with 3 users'
            },
            {
              id: 4,
              type: 'key_rotation',
              document: 'System',
              status: 'success',
              timestamp: '2024-01-16 10:20',
              details: 'RSA key pair regenerated'
            },
            {
              id: 5,
              type: 'access',
              document: 'Research_Data.xlsx',
              status: 'info',
              timestamp: '2024-01-16 09:30',
              details: 'Access revoked for user mike@company.com'
            }
          ]);

          setAlerts([
            {
              id: 1,
              severity: 'high',
              title: 'Expired Encryption Key',
              description: 'RSA-2048 key expired on 2024-01-01',
              timestamp: '2024-01-16 08:15',
              resolved: false
            },
            {
              id: 2,
              severity: 'medium',
              title: 'Integrity Check Failed',
              description: 'SHA-256 verification failed for Project_Plan.docx',
              timestamp: '2024-01-16 13:15',
              resolved: false
            },
            {
              id: 3,
              severity: 'low',
              title: 'Pending Encryption',
              description: '2 documents awaiting encryption',
              timestamp: '2024-01-15 16:45',
              resolved: false
            }
          ]);

          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching security data:', error);
        setLoading(false);
      }
    };

    fetchSecurityData();
  }, []);

  const getSecurityScoreColor = (score) => {
    if (score >= 90) return 'text-green-400';
    if (score >= 70) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getStatusIcon = (status) => {
    const icons = {
      success: <CheckIcon className="w-4 h-4 text-green-400" />,
      warning: <WarningIcon className="w-4 h-4 text-yellow-400" />,
      error: <WarningIcon className="w-4 h-4 text-red-400" />,
      info: <CheckIcon className="w-4 h-4 text-blue-400" />
    };
    return icons[status] || icons.info;
  };

  const getAlertSeverityColor = (severity) => {
    const colors = {
      high: 'bg-red-500',
      medium: 'bg-yellow-500',
      low: 'bg-blue-500'
    };
    return colors[severity] || colors.low;
  };

  const handleResolveAlert = (alertId) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
  };

  const runSecurityScan = async () => {
    // API call to run security scan
    alert('Security scan initiated...');
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
          <h1 className="text-2xl font-bold text-white">Encryption Status</h1>
          <p className="text-gray-400">Monitor your document security and encryption health</p>
        </div>
        
        <button
          onClick={runSecurityScan}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium transition-colors"
        >
          <RefreshIcon className="w-5 h-5" />
          <span>Run Security Scan</span>
        </button>
      </div>

      {/* Security Score */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6">
        <div className="flex flex-col sm:flex-row justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Security Health</h2>
            <p className="text-blue-100">Overall system security assessment</p>
          </div>
          <div className="text-center mt-4 sm:mt-0">
            <div className={`text-5xl font-bold ${getSecurityScoreColor(securityStats.securityScore)}`}>
              {securityStats.securityScore}
            </div>
            <div className="text-blue-200 text-sm">Security Score</div>
          </div>
        </div>
      </div>

      {/* Security Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Encryption Status */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <LockIcon className="w-8 h-8 text-blue-400" />
            <span className="text-sm text-gray-400">Encryption</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {securityStats.encryptedDocuments}/{securityStats.totalDocuments}
          </div>
          <div className="text-sm text-gray-400">Documents Encrypted</div>
          <div className="mt-2">
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full"
                style={{ 
                  width: `${(securityStats.encryptedDocuments / securityStats.totalDocuments) * 100}%` 
                }}
              ></div>
            </div>
          </div>
        </div>

        {/* Integrity Status */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <ShieldIcon className="w-8 h-8 text-green-400" />
            <span className="text-sm text-gray-400">Integrity</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {securityStats.integrityVerified}/{securityStats.totalDocuments}
          </div>
          <div className="text-sm text-gray-400">Verified Documents</div>
          <div className="mt-2">
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full"
                style={{ 
                  width: `${(securityStats.integrityVerified / securityStats.totalDocuments) * 100}%` 
                }}
              ></div>
            </div>
          </div>
        </div>

        {/* Key Management */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <KeyIcon className="w-8 h-8 text-yellow-400" />
            <span className="text-sm text-gray-400">Keys</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {securityStats.activeKeys}
          </div>
          <div className="text-sm text-gray-400">Active Key Pairs</div>
          <div className="text-xs text-red-400 mt-1">
            {securityStats.expiredKeys} expired
          </div>
        </div>

        {/* Sharing Status */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <UsersIcon className="w-8 h-8 text-purple-400" />
            <span className="text-sm text-gray-400">Sharing</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {securityStats.sharedDocuments}
          </div>
          <div className="text-sm text-gray-400">Shared Documents</div>
          <div className="text-xs text-blue-400 mt-1">
            Secure sharing enabled
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Security Alerts */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Security Alerts</h3>
            <span className="px-2 py-1 bg-red-500 text-white rounded-full text-xs">
              {alerts.length} Active
            </span>
          </div>

          <div className="space-y-4">
            {alerts.map((alert) => (
              <div key={alert.id} className="flex items-start space-x-3 p-3 bg-gray-700 rounded-lg">
                <div className={`w-3 h-3 rounded-full ${getAlertSeverityColor(alert.severity)} mt-1`}></div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-white">{alert.title}</h4>
                    <button
                      onClick={() => handleResolveAlert(alert.id)}
                      className="text-xs text-blue-400 hover:text-blue-300"
                    >
                      Resolve
                    </button>
                  </div>
                  <p className="text-sm text-gray-400 mt-1">{alert.description}</p>
                  <p className="text-xs text-gray-500 mt-2">{alert.timestamp}</p>
                </div>
              </div>
            ))}

            {alerts.length === 0 && (
              <div className="text-center py-8">
                <CheckIcon className="w-12 h-12 text-green-400 mx-auto mb-3" />
                <p className="text-gray-400">No active security alerts</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>

          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3">
                {getStatusIcon(activity.status)}
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-white">{activity.document}</p>
                    <span className="text-xs text-gray-500">{activity.timestamp}</span>
                  </div>
                  <p className="text-sm text-gray-400">{activity.details}</p>
                  <span className="inline-block px-2 py-1 bg-gray-700 text-gray-300 rounded text-xs mt-1">
                    {activity.type.replace('_', ' ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Encryption Algorithms */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Encryption Standards</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <LockIcon className="w-5 h-5 text-green-400" />
              <h4 className="font-medium text-white">AES-256-GCM</h4>
            </div>
            <p className="text-sm text-gray-400">
              Military-grade symmetric encryption for document confidentiality
            </p>
          </div>

          <div className="bg-gray-700 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <KeyIcon className="w-5 h-5 text-blue-400" />
              <h4 className="font-medium text-white">RSA-2048/4096</h4>
            </div>
            <p className="text-sm text-gray-400">
              Asymmetric encryption for secure key exchange and digital signatures
            </p>
          </div>

          <div className="bg-gray-700 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <ShieldIcon className="w-5 h-5 text-purple-400" />
              <h4 className="font-medium text-white">SHA-256</h4>
            </div>
            <p className="text-sm text-gray-400">
              Cryptographic hashing for document integrity verification
            </p>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-yellow-900 bg-opacity-20 border border-yellow-800 rounded-lg p-6">
        <div className="flex items-start space-x-3">
          <WarningIcon className="w-6 h-6 text-yellow-400 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="text-lg font-semibold text-yellow-400 mb-2">Security Recommendations</h4>
            <ul className="text-yellow-200 space-y-1 text-sm">
              {securityStats.expiredKeys > 0 && (
                <li>• Rotate expired encryption keys to maintain security</li>
              )}
              {securityStats.pendingEncryption > 0 && (
                <li>• Encrypt pending documents to protect sensitive data</li>
              )}
              <li>• Regularly update your RSA key pairs (recommended every 12 months)</li>
              <li>• Review shared document access permissions monthly</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};



export default EncryptionStatus;