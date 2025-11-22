const express = require('express');
const fs = require('fs');
const path = require('path');

// ✅ ACCEPT DEPENDENCIES AS PARAMETERS
module.exports = (auth, Document, documentupload) => {
    const router = express.Router();

    // ✅ FIX TYPOS: 'documnet' → 'document', 'DocumentUpload' → 'documentupload'
    router.post('/upload', auth, documentupload.single('document'), async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: "No file uploaded" // Fixed: uplaoded → uploaded
                });
            }

            const document = new Document({
                userId: req.user._id,
                name: req.file.originalname,
                originalName: req.file.originalname,
                size: req.file.size,
                filetype: req.file.mimetype,
                filepath: req.file.path, // ✅ ADD THIS MISSING FIELD
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
            // ✅ FIX: 'document' → 'documents'
            const documents = await Document.find({ userId: req.user._id })
                .sort({ uploadDate: -1 })
                .select('_id name originalName size filetype uploadDate encrypted');

            res.json({
                success: true,
                data: {
                    documents // ✅ FIX: 'document' → 'documents'
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

    router.get('/download/:id', auth, async (req, res) => {
        try {
            const document = await Document.findOne({
                _id: req.params.id,
                userId: req.user._id
            });

            if (!document) {
                // ✅ FIX: res.status → return res.status
                return res.status(404).json({
                    success: false,
                    message: "No Document with this id",
                });
            }

            if (!fs.existsSync(document.filepath)) {
                return res.status(404).json({
                    success: false,
                    message: "No document saved for this id"
                });
            }

            // ✅ FIX: document.findByIdAndUpdate → Document.findByIdAndUpdate
            await Document.findByIdAndUpdate(document._id, {
                lastAccessed: new Date()
            });

            res.setHeader('Content-Type', document.filetype); // Fixed: Content-type → Content-Type
            res.setHeader('Content-Disposition', `attachment; filename="${document.originalName}"`);
            
            const fileStream = fs.createReadStream(document.filepath); // Fixed: filestream → fileStream
            fileStream.pipe(res);
        } catch (error) {
            console.error('Download error:', error);
            res.status(500).json({
                success: false,
                message: 'Download failed'
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