const mongoose = require('mongoose');

const SharedLinkSchema = new mongoose.Schema({
    linkId: {
        type: String,
        unique: true,
        required: true
    },
    documentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Document',
        required: true
    },
    ownerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    
    // Encryption data for this specific share
    encryptedAESKey: {
        type: String, // RSA encrypted with recipient's public key
        required: true
    },
    iv: {
        type: String, // For AES encryption
        required: true
    },
    authTag: {
        type: String, // For AES-GCM
        required: true
    },
    fileHash: {
        type: String, // SHA-256 of original file
        required: true
    },
    
    // Access controls
    accessPassword: {
        type: String, // bcrypt hash of optional password
        required: false
    },
    expiryDate: {
        type: Date,
        required: false
    },
    maxDownloads: {
        type: Number,
        default: null
    },
    downloadCount: {
        type: Number,
        default: 0
    },
    
    // Tracking
    createdAt: {
        type: Date,
        default: Date.now
    },
    lastAccessed: {
        type: Date,
        required: false
    },
    isActive: {
        type: Boolean,
        default: true
    }
});

module.exports = mongoose.model('SharedLink', SharedLinkSchema);