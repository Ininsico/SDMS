const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// ==================== SCHEMAS ====================

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
        type: String,
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
    encryptedAESKey: {
        type: String,
        required: true
    },
    iv: {
        type: String,
        required: true
    },
    authTag: {
        type: String,
        required: true
    },
    fileHash: {
        type: String,
        required: true
    },
    accessPassword: {
        type: String,
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

const SharedDocumentSchema = new mongoose.Schema({
    sharedLinkId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SharedLink',
        required: true
    },
    recipientEmail: {
        type: String,
        required: false
    },
    accessDate: {
        type: Date,
        default: Date.now
    },
    decryptedSuccessfully: {
        type: Boolean,
        default: false
    },
    ipAddress: {
        type: String,
        required: false
    },
    userAgent: {
        type: String,
        required: false
    }
});

// ==================== MODELS ====================

const EncryptionKey = mongoose.model('EncryptionKey', EncryptionKeySchema);
const SharedLink = mongoose.model('SharedLink', SharedLinkSchema);
const SharedDocument = mongoose.model('SharedDocument', SharedDocumentSchema);

// ==================== ROUTES ====================

const encryptionRoutes = (auth, CryptoUtils) => {
    const express = require('express');
    const router = express.Router();

    // Generate RSA key pair for user
    router.post('/keys/generate', auth, async (req, res) => {
        try {
            const existingKeys = await EncryptionKey.findOne({ userId: req.user._id });
            if (existingKeys) {
                return res.status(400).json({
                    success: false,
                    message: 'Encryption keys already exist for this user'
                });
            }

            const { publicKey, privateKey } = await CryptoUtils.generateKeyPair();

            const encryptionKey = new EncryptionKey({
                userId: req.user._id,
                publicKey,
                privateKey
            });

            await encryptionKey.save();

            res.json({
                success: true,
                message: 'Encryption keys generated successfully',
                data: {
                    publicKey,
                    privateKey
                }
            });
        } catch (error) {
            console.error('Key generation error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to generate encryption keys'
            });
        }
    });

    // Get user's public key
    router.get('/keys/public', auth, async (req, res) => {
        try {
            const keys = await EncryptionKey.findOne({ userId: req.user._id });
            if (!keys) {
                return res.status(404).json({
                    success: false,
                    message: 'No encryption keys found'
                });
            }

            res.json({
                success: true,
                data: { publicKey: keys.publicKey }
            });
        } catch (error) {
            console.error('Get public key error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get public key'
            });
        }
    });

    // Get user's private key (should be protected!)
    router.get('/keys/private', auth, async (req, res) => {
        try {
            const keys = await EncryptionKey.findOne({ userId: req.user._id });
            if (!keys) {
                return res.status(404).json({
                    success: false,
                    message: 'No encryption keys found'
                });
            }

            res.json({
                success: true,
                data: { privateKey: keys.privateKey }
            });
        } catch (error) {
            console.error('Get private key error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get private key'
            });
        }
    });

    // Encrypt existing document - FIXED VERSION
    router.post('/documents/:id/encrypt', auth, async (req, res) => {
        try {
            const Document = mongoose.model('Document');
            const document = await Document.findOne({
                _id: req.params.id,
                userId: req.user._id
            });

            if (!document) {
                return res.status(404).json({
                    success: false,
                    message: 'Document not found'
                });
            }

            if (document.encrypted) {
                return res.status(400).json({
                    success: false,
                    message: 'Document is already encrypted'
                });
            }

            const userKeys = await EncryptionKey.findOne({ userId: req.user._id });
            if (!userKeys) {
                return res.status(400).json({
                    success: false,
                    message: 'Please generate encryption keys first'
                });
            }

            const fs = require('fs');
            const path = require('path');

            // DEBUG: Check if original file exists
            console.log('ENCRYPTION - Original file path:', document.filepath);
            console.log('ENCRYPTION - Original file exists:', fs.existsSync(document.filepath));

            if (!fs.existsSync(document.filepath)) {
                return res.status(404).json({
                    success: false,
                    message: 'Original file not found on server'
                });
            }

            const fileBuffer = fs.readFileSync(document.filepath);

            const encryptionResult = await CryptoUtils.completeEncryptionWorkflow(
                fileBuffer,
                userKeys.publicKey
            );

            // Create encrypted file path in the same directory
            const encryptedFilePath = document.filepath + '.encrypted';
            console.log('ENCRYPTION - Encrypted file path:', encryptedFilePath);

            fs.writeFileSync(encryptedFilePath, encryptionResult.encryptedData);

            // Update document with ALL encryption data - STANDARDIZED FIELD NAMES
            document.encrypted = true;
            document.encryptionKey = encryptionResult.encryptedAESKey; // Use camelCase consistently
            document.iv = encryptionResult.iv;
            document.authTag = encryptionResult.authTag; // Use camelCase consistently
            document.hash = encryptionResult.fileHash;
            document.filepath = encryptedFilePath; // UPDATE THE PATH TO ENCRYPTED FILE
            document.encryptedAt = new Date();

            await document.save();

            // Delete original file ONLY after successful save
            const originalFilePath = document.filepath.replace('.encrypted', '');
            if (fs.existsSync(originalFilePath) && originalFilePath !== encryptedFilePath) {
                fs.unlinkSync(originalFilePath);
                console.log('ENCRYPTION - Original file deleted:', originalFilePath);
            }

            res.json({
                success: true,
                message: 'Document encrypted successfully',
                data: {
                    document: {
                        _id: document._id,
                        name: document.name,
                        encrypted: document.encrypted,
                        filepath: document.filepath
                    }
                }
            });
        } catch (error) {
            console.error('Document encryption error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to encrypt document: ' + error.message
            });
        }
    });

    return router;
};

const shareRoutes = (auth, CryptoUtils) => {
    const express = require('express');
    const router = express.Router();

    // Create shareable link for document - FIXED VERSION
    router.post('/documents/:id/share', auth, async (req, res) => {
        try {
            const Document = mongoose.model('Document');
            const { password, expiryDays, maxDownloads } = req.body;

            const document = await Document.findOne({
                _id: req.params.id,
                userId: req.user._id
            });

            if (!document) {
                return res.status(404).json({
                    success: false,
                    message: 'Document not found'
                });
            }

            if (!document.encrypted) {
                return res.status(400).json({
                    success: false,
                    message: 'Document must be encrypted before sharing'
                });
            }

            // DEBUG: Check document encryption data
            console.log('SHARE - Document encryption data:', {
                encryptionKey: document.encryptionKey,
                iv: document.iv,
                authTag: document.authTag,
                hash: document.hash,
                filepath: document.filepath
            });

            // Validate required encryption data exists
            if (!document.encryptionKey || !document.iv || !document.authTag || !document.hash) {
                return res.status(400).json({
                    success: false,
                    message: 'Document missing encryption data. Please re-encrypt the document.'
                });
            }

            const linkId = require('crypto').randomBytes(16).toString('hex');

            const sharedLink = new SharedLink({
                linkId,
                documentId: document._id,
                ownerId: req.user._id,
                encryptedAESKey: document.encryptionKey, // Use standardized field name
                iv: document.iv,
                authTag: document.authTag, // Use standardized field name
                fileHash: document.hash,
                accessPassword: password ? await bcrypt.hash(password, 12) : null,
                expiryDate: expiryDays ? new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000) : null,
                maxDownloads: maxDownloads || null
            });

            await sharedLink.save();

            res.json({
                success: true,
                message: 'Shareable link created successfully',
                data: {
                    shareLink: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/shared/${linkId}`,
                    linkId,
                    expiryDate: sharedLink.expiryDate,
                    maxDownloads: sharedLink.maxDownloads
                }
            });
        } catch (error) {
            console.error('Share creation error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to create shareable link: ' + error.message
            });
        }
    });

    // Direct encrypted file download (no decryption) - FIXED VERSION
    router.post('/documents/:id/direct-download', auth, async (req, res) => {
        try {
            const Document = mongoose.model('Document');
            const { expiryDays, maxDownloads } = req.body;

            const document = await Document.findOne({
                _id: req.params.id,
                userId: req.user._id
            });

            if (!document) {
                return res.status(404).json({
                    success: false,
                    message: 'Document not found'
                });
            }

            if (!document.encrypted) {
                return res.status(400).json({
                    success: false,
                    message: 'Document must be encrypted'
                });
            }

            // Validate encryption data exists
            if (!document.encryptionKey || !document.iv || !document.authTag || !document.hash) {
                return res.status(400).json({
                    success: false,
                    message: 'Document missing encryption data'
                });
            }

            const fs = require('fs');
            
            // Check if encrypted file actually exists
            if (!fs.existsSync(document.filepath)) {
                return res.status(404).json({
                    success: false,
                    message: 'Encrypted file not found on server'
                });
            }

            const linkId = require('crypto').randomBytes(16).toString('hex');

            const sharedLink = new SharedLink({
                linkId,
                documentId: document._id,
                ownerId: req.user._id,
                encryptedAESKey: document.encryptionKey,
                iv: document.iv,
                authTag: document.authTag,
                fileHash: document.hash,
                expiryDate: expiryDays ? new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000) : null,
                maxDownloads: maxDownloads || null,
                isActive: true
            });

            await sharedLink.save();

            res.json({
                success: true,
                message: 'Direct download link created successfully',
                data: {
                    directDownloadLink: `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/share/shared/${linkId}/download-encrypted`,
                    linkId,
                    expiryDate: sharedLink.expiryDate,
                    maxDownloads: sharedLink.maxDownloads
                }
            });
        } catch (error) {
            console.error('Direct download link creation error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to create direct download link: ' + error.message
            });
        }
    });

    // Direct encrypted file download endpoint - FIXED VERSION
    router.get('/shared/:linkId/download-encrypted', async (req, res) => {
        try {
            const sharedLink = await SharedLink.findOne({
                linkId: req.params.linkId,
                isActive: true
            }).populate('documentId');

            if (!sharedLink) {
                return res.status(404).json({
                    success: false,
                    message: 'Download link not found or expired'
                });
            }

            if (sharedLink.expiryDate && new Date() > sharedLink.expiryDate) {
                return res.status(410).json({
                    success: false,
                    message: 'This download link has expired'
                });
            }

            if (sharedLink.maxDownloads && sharedLink.downloadCount >= sharedLink.maxDownloads) {
                return res.status(410).json({
                    success: false,
                    message: 'Download limit reached'
                });
            }

            const fs = require('fs');

            // Check if the encrypted file exists
            if (!sharedLink.documentId || !fs.existsSync(sharedLink.documentId.filepath)) {
                return res.status(404).json({
                    success: false,
                    message: 'Encrypted file not found on server'
                });
            }

            // Update download count
            sharedLink.downloadCount += 1;
            sharedLink.lastAccessed = new Date();
            await sharedLink.save();

            // Send the encrypted file directly
            res.setHeader('Content-Type', 'application/octet-stream');
            res.setHeader('Content-Disposition', `attachment; filename="${sharedLink.documentId.name}_encrypted"`);

            const fileStream = fs.createReadStream(sharedLink.documentId.filepath);
            fileStream.pipe(res);

        } catch (error) {
            console.error('Encrypted file download error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to download encrypted file: ' + error.message
            });
        }
    });

    // Get shared file info (public route) - FIXED VERSION
    router.get('/shared/:linkId', async (req, res) => {
        try {
            const sharedLink = await SharedLink.findOne({
                linkId: req.params.linkId,
                isActive: true
            }).populate('documentId ownerId');

            if (!sharedLink) {
                return res.status(404).json({
                    success: false,
                    message: 'Shared link not found or expired'
                });
            }

            if (sharedLink.expiryDate && new Date() > sharedLink.expiryDate) {
                return res.status(410).json({
                    success: false,
                    message: 'This share link has expired'
                });
            }

            if (sharedLink.maxDownloads && sharedLink.downloadCount >= sharedLink.maxDownloads) {
                return res.status(410).json({
                    success: false,
                    message: 'Download limit reached for this share link'
                });
            }

            const ownerKeys = await EncryptionKey.findOne({ userId: sharedLink.ownerId });

            res.json({
                success: true,
                data: {
                    document: {
                        name: sharedLink.documentId.name,
                        size: sharedLink.documentId.size,
                        uploadDate: sharedLink.documentId.uploadDate
                    },
                    owner: {
                        name: sharedLink.ownerId.name,
                        email: sharedLink.ownerId.email,
                        publicKey: ownerKeys ? ownerKeys.publicKey : null
                    },
                    requiresPassword: !!sharedLink.accessPassword,
                    expiryDate: sharedLink.expiryDate,
                    downloadsRemaining: sharedLink.maxDownloads ?
                        sharedLink.maxDownloads - sharedLink.downloadCount : null
                }
            });
        } catch (error) {
            console.error('Get shared info error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get shared file information: ' + error.message
            });
        }
    });

    // Decrypt and download shared file - FIXED VERSION
    router.post('/shared/:linkId/decrypt', async (req, res) => {
        try {
            const { privateKey, password } = req.body;

            const sharedLink = await SharedLink.findOne({
                linkId: req.params.linkId,
                isActive: true
            }).populate('documentId');

            if (!sharedLink) {
                return res.status(404).json({
                    success: false,
                    message: 'Shared link not found'
                });
            }

            if (sharedLink.accessPassword) {
                if (!password || !(await bcrypt.compare(password, sharedLink.accessPassword))) {
                    return res.status(401).json({
                        success: false,
                        message: 'Invalid access password'
                    });
                }
            }

            const fs = require('fs');
            
            // Check if encrypted file exists
            if (!fs.existsSync(sharedLink.documentId.filepath)) {
                return res.status(404).json({
                    success: false,
                    message: 'Encrypted file not found on server'
                });
            }

            const encryptedFileBuffer = fs.readFileSync(sharedLink.documentId.filepath);

            const decryptedFile = await CryptoUtils.completeDecryptionWorkflow(
                encryptedFileBuffer,
                sharedLink.encryptedAESKey,
                sharedLink.iv,
                sharedLink.authTag,
                sharedLink.fileHash,
                privateKey
            );

            sharedLink.downloadCount += 1;
            sharedLink.lastAccessed = new Date();
            await sharedLink.save();

            const sharedDocument = new SharedDocument({
                sharedLinkId: sharedLink._id,
                decryptedSuccessfully: true,
                ipAddress: req.ip,
                userAgent: req.get('User-Agent')
            });
            await sharedDocument.save();

            res.setHeader('Content-Type', sharedLink.documentId.filetype);
            res.setHeader('Content-Disposition', `attachment; filename="${sharedLink.documentId.originalName || sharedLink.documentId.name}"`);
            res.send(decryptedFile);

        } catch (error) {
            console.error('Shared file decryption error:', error);

            const sharedLink = await SharedLink.findOne({ linkId: req.params.linkId });
            if (sharedLink) {
                const sharedDocument = new SharedDocument({
                    sharedLinkId: sharedLink._id,
                    decryptedSuccessfully: false,
                    ipAddress: req.ip,
                    userAgent: req.get('User-Agent')
                });
                await sharedDocument.save();
            }

            res.status(400).json({
                success: false,
                message: 'Decryption failed. Please check your private key and try again: ' + error.message
            });
        }
    });

    return router;
};

// ==================== EXPORTS ====================

module.exports = {
    EncryptionKey,
    SharedLink,
    SharedDocument,
    encryptionRoutes,
    shareRoutes
};