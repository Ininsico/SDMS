// import React, { useState, useEffect } from 'react';

// const DocumentList = () => {
//   const [documents, setDocuments] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [uploading, setUploading] = useState(false);
//   const [error, setError] = useState('');

//   const API_BASE_URL = 'http://localhost:5000';

//   const getToken = () => {
//     return localStorage.getItem('token');
//   };

//   // Fetch documents
//   useEffect(() => {
//     fetchDocuments();
//   }, []);

//   const fetchDocuments = async () => {
//     try {
//       setLoading(true);
//       const token = getToken();
      
//       const response = await fetch(`${API_BASE_URL}/api/documents`, {
//         headers: {
//           'Authorization': `Bearer ${token}`
//         }
//       });

//       const result = await response.json();
      
//       if (result.success) {
//         setDocuments(result.data.documents);
//       } else {
//         setError(result.message);
//       }
//     } catch (error) {
//       setError('Failed to load documents');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleUpload = async (event) => {
//     const file = event.target.files[0];
//     if (!file) return;

//     try {
//       setUploading(true);
//       const formData = new FormData();
//       formData.append('document', file);

//       const token = getToken();
//       const response = await fetch(`${API_BASE_URL}/api/documents/upload`, {
//         method: 'POST',
//         headers: {
//           'Authorization': `Bearer ${token}`
//         },
//         body: formData
//       });

//       const result = await response.json();
      
//       if (result.success) {
//         setDocuments([result.data.document, ...documents]);
//         alert('Document uploaded!');
//         event.target.value = '';
//       } else {
//         alert('Upload failed: ' + result.message);
//       }
//     } catch (error) {
//       alert('Upload error');
//     } finally {
//       setUploading(false);
//     }
//   };

//   const handleDownload = async (documentId, originalName) => {
//     try {
//       const token = getToken();
//       const response = await fetch(`${API_BASE_URL}/api/documents/download/${documentId}`, {
//         headers: {
//           'Authorization': `Bearer ${token}`
//         }
//       });

//       if (response.ok) {
//         const blob = await response.blob();
//         const url = window.URL.createObjectURL(blob);
//         const a = document.createElement('a');
//         a.href = url;
//         a.download = originalName;
//         a.click();
//         window.URL.revokeObjectURL(url);
//       } else {
//         alert('Download failed');
//       }
//     } catch (error) {
//       alert('Download error');
//     }
//   };

//   const handleDelete = async (documentId) => {
//     if (!window.confirm('Delete this document?')) return;

//     try {
//       const token = getToken();
//       const response = await fetch(`${API_BASE_URL}/api/documents/${documentId}`, {
//         method: 'DELETE',
//         headers: {
//           'Authorization': `Bearer ${token}`
//         }
//       });

//       const result = await response.json();
      
//       if (result.success) {
//         setDocuments(documents.filter(doc => doc._id !== documentId));
//         alert('Document deleted');
//       } else {
//         alert('Delete failed');
//       }
//     } catch (error) {
//       alert('Delete error');
//     }
//   };

//   if (loading) {
//     return <div className="text-white">Loading documents...</div>;
//   }

//   return (
//     <div>
//       <div className="flex justify-between items-center mb-6">
//         <h1 className="text-2xl font-bold text-white">My Documents</h1>
//         <label className="bg-blue-600 text-white px-4 py-2 rounded cursor-pointer">
//           {uploading ? 'Uploading...' : 'Upload Document'}
//           <input
//             type="file"
//             className="hidden"
//             onChange={handleUpload}
//             disabled={uploading}
//           />
//         </label>
//       </div>

//       {error && <div className="text-red-500 mb-4">{error}</div>}

//       <div className="grid gap-4">
//         {documents.map((doc) => (
//           <div key={doc._id} className="bg-gray-800 p-4 rounded flex justify-between items-center">
//             <div>
//               <div className="text-white font-medium">{doc.name}</div>
//               <div className="text-gray-400 text-sm">
//                 {doc.size} bytes • {new Date(doc.uploadDate).toLocaleDateString()}
//               </div>
//             </div>
//             <div className="flex gap-2">
//               <button
//                 onClick={() => handleDownload(doc._id, doc.originalName)}
//                 className="bg-green-600 text-white px-3 py-1 rounded text-sm"
//               >
//                 Download
//               </button>
//               <button
//                 onClick={() => handleDelete(doc._id)}
//                 className="bg-red-600 text-white px-3 py-1 rounded text-sm"
//               >
//                 Delete
//               </button>
//             </div>
//           </div>
//         ))}
//       </div>

//       {documents.length === 0 && !loading && (
//         <div className="text-center text-gray-400 py-8">
//           No documents yet. Upload your first document.
//         </div>
//       )}
//     </div>
//   );
// };

// export default DocumentList;
import React from 'react'

const DocumentList = () => {
  return (
    <div>DocumentList</div>
  )
}

export default DocumentList