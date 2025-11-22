const mongoose = require('mongoose');

const EncryptionKeySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    publicKey: {
        type: String,
        required: true
    },
    privateKey: {
        type: String, // Encrypted with user's password
        required: true
    },
    keyAlgorithm: {
        type: String,
        default: 'RSA-2048'
    },
    keyStatus: {
        type: String,
        enum: ['active', 'revoked', 'expired'],
        default: 'active'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    lastUsed: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('EncryptionKey', EncryptionKeySchema);