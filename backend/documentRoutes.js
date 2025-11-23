const express = require('express');
const fs = require('fs');
const path = require('path');

module.exports = (auth, Document, documentupload, CryptoUtils) => {
    const router = express.Router();

    router.post('/upload', auth, documentupload.single('document'), async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: "No file uploaded"
                });
            }

            const document = new Document({
                userId: req.user._id,
                name: req.file.originalname,
                originalName: req.file.originalname,
                size: req.file.size,
                filetype: req.file.mimetype,
                filepath: req.file.path,
                encrypted: false
            });

            await document.save();

            res.json({
                success: true,
                message: "Document uploaded successfully",
                data: {
                    document: {
                        _id: document._id,
                        name: document.name,
                        originalName: document.originalName,
                        size: document.size,
                        filetype: document.filetype,
                        uploadDate: document.uploadDate,
                        encrypted: document.encrypted
                    }
                }
            });
        } catch (error) {
            console.error('Document upload error:', error);

            if (req.file && fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }

            res.status(500).json({
                success: false,
                message: 'Failed to upload document'
            });
        }
    });

    router.get('/', auth, async (req, res) => {
        try {
            const documents = await Document.find({ userId: req.user._id })
                .sort({ uploadDate: -1 })
                .select('_id name originalName size filetype uploadDate encrypted');

            res.json({
                success: true,
                data: {
                    documents
                }
            });
        } catch (error) {
            console.error('Get documents error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch documents'
            });
        }
    });

    // FIXED DOWNLOAD ROUTE - HANDLES BOTH ENCRYPTED AND UNENCRYPTED FILES
    router.get('/download/:id', auth, async (req, res) => {
        try {
            const document = await Document.findOne({
                _id: req.params.id,
                userId: req.user._id
            });

            if (!document) {
                return res.status(404).json({
                    success: false,
                    message: "No Document with this id",
                });
            }

            console.log('DOWNLOAD - File path:', document.filepath);
            console.log('DOWNLOAD - Encrypted:', document.encrypted);
            console.log('DOWNLOAD - File exists:', fs.existsSync(document.filepath));

            if (!fs.existsSync(document.filepath)) {
                // If encrypted file doesn't exist, check for .encrypted version
                if (document.encrypted) {
                    const encryptedPath = document.filepath + '.encrypted';
                    console.log('DOWNLOAD - Checking encrypted path:', encryptedPath);
                    
                    if (fs.existsSync(encryptedPath)) {
                        console.log('DOWNLOAD - Found encrypted file, updating database...');
                        document.filepath = encryptedPath;
                        await document.save();
                    } else {
                        return res.status(404).json({
                            success: false,
                            message: "Encrypted file not found"
                        });
                    }
                } else {
                    return res.status(404).json({
                        success: false,
                        message: "File not found"
                    });
                }
            }

            await Document.findByIdAndUpdate(document._id, {
                lastAccessed: new Date()
            });

            // For encrypted files, download as is
            if (document.encrypted) {
                res.setHeader('Content-Type', 'application/octet-stream');
                res.setHeader('Content-Disposition', `attachment; filename="${document.name}_encrypted"`);
            } else {
                res.setHeader('Content-Type', document.filetype);
                res.setHeader('Content-Disposition', `attachment; filename="${document.originalName}"`);
            }

            const fileStream = fs.createReadStream(document.filepath);
            fileStream.pipe(res);

        } catch (error) {
            console.error('Download error:', error);
            res.status(500).json({
                success: false,
                message: 'Download failed: ' + error.message
            });
        }
    });

    // DECRYPT AND DOWNLOAD ROUTE - THIS IS WHAT YOU NEED TO DECRYPT FILES
    router.post('/decrypt/:id', auth, async (req, res) => {
        try {
            const { privateKey } = req.body;
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
                    message: 'Document is not encrypted'
                });
            }

            if (!privateKey) {
                return res.status(400).json({
                    success: false,
                    message: 'Private key is required for decryption'
                });
            }

            console.log('DECRYPT - File path:', document.filepath);
            console.log('DECRYPT - File exists:', fs.existsSync(document.filepath));

            if (!fs.existsSync(document.filepath)) {
                return res.status(404).json({
                    success: false,
                    message: 'Encrypted file not found on server'
                });
            }

            const encryptedFileBuffer = fs.readFileSync(document.filepath);

            // Use the CryptoUtils to decrypt
            const decryptedFile = await CryptoUtils.completeDecryptionWorkflow(
                encryptedFileBuffer,
                document.encryptionKey, // Use the standardized field name
                document.iv,
                document.authTag, // Use the standardized field name
                document.hash,
                privateKey
            );

            // Set appropriate headers
            res.setHeader('Content-Type', document.filetype);
            res.setHeader('Content-Disposition', `attachment; filename="${document.originalName}"`);
            res.send(decryptedFile);

        } catch (error) {
            console.error('Document decryption error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to decrypt document: ' + error.message
            });
        }
    });

    router.delete('/:id', auth, async (req, res) => {
        try {
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

            if (fs.existsSync(document.filepath)) {
                fs.unlinkSync(document.filepath);
            }

            await Document.findByIdAndDelete(req.params.id);

            res.json({
                success: true,
                message: 'Document deleted successfully'
            });
        } catch (error) {
            console.error('Delete error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to delete document'
            });
        }
    });

    return router;
};