const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
require('dotenv').config();
// Add near the top with other imports
const documentRoutes = require('./routes/documents');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/auth_demo';
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use('/uploads', express.static('uploads'));
// Add after your other app.use() calls
app.use('/api/documents', documentRoutes);
const app = express();


mongoose.connect(MONGODB_URI)
    .then(() => console.log('✅ MongoDB connected'))
    .catch(err => {
        console.log('❌ MongoDB connection error:', err.message);
    });

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const fileExtension = path.extname(file.originalname);
        cb(null, 'profile-' + uniqueSuffix + fileExtension);
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed!'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024
    }
});
// Add this after the existing multer configuration
const documentStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const userDir = path.join(__dirname, 'uploads', 'documents', req.user._id.toString());
    if (!fs.existsSync(userDir)) {
      fs.mkdirSync(userDir, { recursive: true });
    }
    cb(null, userDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const fileExtension = path.extname(file.originalname);
    cb(null, 'doc-' + uniqueSuffix + fileExtension);
  }
});

const documentFileFilter = (req, file, cb) => {
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'image/jpeg',
    'image/png',
    'image/gif',
    'text/plain'
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only documents and images are allowed!'), false);
  }
};

const documentUpload = multer({
  storage: documentStorage,
  fileFilter: documentFileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  }
});

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: 6
    },
    role: {
        type: String,
        default: 'user'
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    profilePicture: {
        type: String,
        default: ''
    },
    lastLogin: {
        type: Date
    }
});

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

userSchema.methods.correctPassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);
// Add this after SecuritySettings schema in server.js
const documentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Document name is required'],
    trim: true
  },
  originalName: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  fileType: {
    type: String,
    required: true
  },
  filePath: {
    type: String,
    required: true
  },
  encrypted: {
    type: Boolean,
    default: true
  },
  shared: {
    type: Boolean,
    default: false
  },
  integrity: {
    type: String,
    enum: ['verified', 'warning', 'pending'],
    default: 'pending'
  },
  uploadDate: {
    type: Date,
    default: Date.now
  },
  lastAccessed: {
    type: Date,
    default: Date.now
  },
  encryptionKey: {
    type: String,
    required: true
  },
  iv: {
    type: String,
    required: true
  },
  authTag: { // ADD THIS MISSING FIELD
    type: String,
    required: true
  },
  hash: {
    type: String,
    required: true
  }
});

const Document = mongoose.model('Document', documentSchema);
const securitySettingsSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    settings: {
        twoFactorAuth: {
            type: Boolean,
            default: false
        },
        autoLogout: {
            type: Number,
            default: 30,
            enum: [15, 30, 60, 120]
        },
        emailNotifications: {
            type: Boolean,
            default: true
        },
        securityAlerts: {
            type: Boolean,
            default: true
        }
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

const SecuritySettings = mongoose.model('SecuritySettings', securitySettingsSchema);
// Add this near the top with other imports

// Encryption utilities
const encryptFile = (buffer) => {
  try {
    const algorithm = 'aes-256-gcm';
    const password = process.env.ENCRYPTION_KEY || 'your-super-secret-encryption-key-32-chars-here!';
    
    // FIX: Use crypto.createHash instead of crypto.scrypto.createHash
    const key = crypto.createHash('sha256').update(password).digest();
    const iv = crypto.randomBytes(16);
    
    const cipher = crypto.createCipher(algorithm, key);
    cipher.setAAD(Buffer.from('additional-auth-data'));
    
    const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);
    const authTag = cipher.getAuthTag();
    
    return {
      encryptedData: encrypted,
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex')
    };
  } catch (error) {
    console.error('Encryption error:', error);
    throw error;
  }
};

const decryptFile = (encryptedData, iv, authTag) => {
  try {
    const algorithm = 'aes-256-gcm';
    const password = process.env.ENCRYPTION_KEY || 'your-super-secret-encryption-key-32-chars-here!';
    
    // FIX: Use crypto.createHash instead of crypto.scrypto.createHash
    const key = crypto.createHash('sha256').update(password).digest();
    
    const decipher = crypto.createDecipher(algorithm, key);
    decipher.setAAD(Buffer.from('additional-auth-data'));
    decipher.setAuthTag(Buffer.from(authTag, 'hex'));
    
    const decrypted = Buffer.concat([decipher.update(encryptedData), decipher.final()]);
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    throw error;
  }
};

const calculateFileHash = (buffer) => {
  return crypto.createHash('sha256').update(buffer).digest('hex');
};
const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'No token provided'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production');
        const user = await User.findById(decoded.userId).select('-password');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User not found'
            });
        }

        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({
            success: false,
            message: 'Invalid token'
        });
    }
};

app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString(),
        database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
    });
});

app.post('/api/signup', async (req, res) => {
    try {
        const { name, email, password, confirmPassword } = req.body;

        if (!name || !email || !password || !confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'Passwords do not match'
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters'
            });
        }

        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: 'User already exists with this email'
            });
        }

        const user = new User({
            name: name.trim(),
            email: email.toLowerCase(),
            password,
            role: 'user'
        });

        await user.save();

        const token = jwt.sign(
            { userId: user._id, email: user.email, role: user.role },
            process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
            { expiresIn: '24h' }
        );

        res.status(201).json({
            success: true,
            message: 'User created successfully',
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                },
                token
            }
        });

    } catch (error) {
        console.error('Signup error:', error);

        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: 'User already exists with this email'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }

        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user || !(await user.correctPassword(password))) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        user.lastLogin = new Date();
        await user.save();

        const token = jwt.sign(
            { userId: user._id, email: user.email, role: user.role },
            process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
            { expiresIn: '24h' }
        );

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    lastLogin: user.lastLogin
                },
                token
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

app.get('/api/profile', auth, async (req, res) => {
    try {
        res.json({
            success: true,
            data: {
                user: req.user
            }
        });
    } catch (error) {
        console.error('Profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

app.put('/api/profile/update', auth, async (req, res) => {
    try {
        const { name, email } = req.body;

        if (!name || !email) {
            return res.status(400).json({
                success: false,
                message: 'Name and email are required'
            });
        }

        const existingUser = await User.findOne({
            email: email.toLowerCase(),
            _id: { $ne: req.user._id }
        });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: 'Email is already taken'
            });
        }

        const updatedUser = await User.findByIdAndUpdate(
            req.user._id,
            {
                name: name.trim(),
                email: email.toLowerCase()
            },
            { new: true }
        ).select('-password');

        res.json({
            success: true,
            message: 'Profile updated successfully',
            data: {
                user: updatedUser
            }
        });

    } catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

app.put('/api/profile/password', auth, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!newPassword) {
            return res.status(400).json({
                success: false,
                message: 'New password is required'
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters'
            });
        }

        const user = await User.findById(req.user._id);

        if (currentPassword) {
            const isCurrentPasswordValid = await user.correctPassword(currentPassword);
            if (!isCurrentPasswordValid) {
                return res.status(401).json({
                    success: false,
                    message: 'Current password is incorrect'
                });
            }
        }

        user.password = newPassword;
        await user.save();

        res.json({
            success: true,
            message: 'Password updated successfully'
        });

    } catch (error) {
        console.error('Password update error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

app.post('/api/profile/picture', auth, upload.single('profilePicture'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }

        const user = await User.findById(req.user._id);
        if (user.profilePicture && user.profilePicture.startsWith('/uploads/')) {
            const oldFilePath = path.join(__dirname, user.profilePicture);
            if (fs.existsSync(oldFilePath)) {
                fs.unlinkSync(oldFilePath);
            }
        }

        const profilePicturePath = '/uploads/' + req.file.filename;
        const updatedUser = await User.findByIdAndUpdate(
            req.user._id,
            { profilePicture: profilePicturePath },
            { new: true }
        ).select('-password');

        res.json({
            success: true,
            message: 'Profile picture uploaded successfully',
            data: {
                user: updatedUser,
                profilePicture: `${req.protocol}://${req.get('host')}${profilePicturePath}`
            }
        });

    } catch (error) {
        console.error('Profile picture upload error:', error);

        if (req.file) {
            fs.unlinkSync(req.file.path);
        }

        res.status(500).json({
            success: false,
            message: 'Failed to upload profile picture'
        });
    }
});

app.delete('/api/profile/picture', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user.profilePicture && user.profilePicture.startsWith('/uploads/')) {
            const filePath = path.join(__dirname, user.profilePicture);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }

        const updatedUser = await User.findByIdAndUpdate(
            req.user._id,
            { profilePicture: '' },
            { new: true }
        ).select('-password');

        res.json({
            success: true,
            message: 'Profile picture removed successfully',
            data: {
                user: updatedUser
            }
        });

    } catch (error) {
        console.error('Profile picture delete error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to remove profile picture'
        });
    }
});

app.get('/api/security-settings', auth, async (req, res) => {
    try {
        let settings = await SecuritySettings.findOne({ userId: req.user._id });

        if (!settings) {
            settings = new SecuritySettings({
                userId: req.user._id,
                settings: {
                    twoFactorAuth: false,
                    autoLogout: 30,
                    emailNotifications: true,
                    securityAlerts: true
                }
            });
            await settings.save();
        }

        res.json({
            success: true,
            data: {
                settings: settings.settings
            }
        });
    } catch (error) {
        console.error('Security settings error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

app.put('/api/security-settings', auth, async (req, res) => {
    try {
        const { settings } = req.body;

        const updatedSettings = await SecuritySettings.findOneAndUpdate(
            { userId: req.user._id },
            {
                settings: settings,
                updatedAt: new Date()
            },
            { new: true, upsert: true }
        );

        res.json({
            success: true,
            message: 'Security settings updated successfully',
            data: {
                settings: updatedSettings.settings
            }
        });
    } catch (error) {
        console.error('Update security settings error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

app.get('/api/export-security-data', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        const securitySettings = await SecuritySettings.findOne({ userId: req.user._id });

        const exportData = {
            user: {
                name: user.name,
                email: user.email,
                role: user.role,
                joinedDate: user.createdAt,
                lastLogin: user.lastLogin
            },
            securitySettings: securitySettings ? securitySettings.settings : {},
            exportDate: new Date().toISOString()
        };

        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', 'attachment; filename=security-data.json');
        res.send(JSON.stringify(exportData, null, 2));
    } catch (error) {
        console.error('Export security data error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
// Get all documents for current user
app.get('/api/documents', auth, async (req, res) => {
  try {
    const documents = await Document.find({ userId: req.user._id })
      .sort({ uploadDate: -1 })
      .select('-encryptionKey -iv -hash');

    const formattedDocuments = documents.map(doc => ({
      id: doc._id,
      name: doc.name,
      originalName: doc.originalName,
      size: formatFileSize(doc.size),
      uploadDate: doc.uploadDate.toISOString().split('T')[0],
      encrypted: doc.encrypted,
      shared: doc.shared,
      integrity: doc.integrity,
      type: getFileType(doc.fileType),
      lastAccessed: doc.lastAccessed
    }));

    res.json({
      success: true,
      data: {
        documents: formattedDocuments
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

// Upload document
// Upload document - FIXED VERSION
app.post('/api/documents/upload', auth, documentUpload.single('document'), async (req, res) => {
  try {
    console.log('📁 Document upload started for user:', req.user._id);
    
    if (!req.file) {
      console.log('❌ No file uploaded');
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    console.log('📄 File received:', {
      originalname: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype,
      path: req.file.path
    });

    // Read file buffer
    const fileBuffer = fs.readFileSync(req.file.path);
    console.log('✅ File read successfully, size:', fileBuffer.length);
    
    // Calculate file hash for integrity
    const fileHash = calculateFileHash(fileBuffer);
    console.log('✅ File hash calculated:', fileHash.substring(0, 16) + '...');
    
    try {
      // Encrypt file
      console.log('🔐 Starting encryption...');
      const encryptedData = encryptFile(fileBuffer);
      console.log('✅ File encrypted successfully');
      
      // Save encrypted file
      const encryptedFilePath = req.file.path + '.enc';
      fs.writeFileSync(encryptedFilePath, encryptedData.encryptedData);
      console.log('✅ Encrypted file saved:', encryptedFilePath);
      
      // Remove original file
      fs.unlinkSync(req.file.path);
      console.log('✅ Original file removed');

      // Create document record
      const document = new Document({
        userId: req.user._id,
        name: req.body.name || req.file.originalname,
        originalName: req.file.originalname,
        size: req.file.size,
        fileType: req.file.mimetype,
        filePath: encryptedFilePath,
        encrypted: true,
        shared: false,
        integrity: 'verified',
        encryptionKey: encryptedData.iv, // Using IV as simple key for demo
        iv: encryptedData.iv,
        authTag: encryptedData.authTag, // ADD THIS MISSING FIELD
        hash: fileHash
      });

      await document.save();
      console.log('✅ Document saved to database:', document._id);

      res.json({
        success: true,
        message: 'Document uploaded and encrypted successfully',
        data: {
          document: {
            id: document._id,
            name: document.name,
            size: formatFileSize(document.size),
            uploadDate: document.uploadDate,
            encrypted: document.encrypted,
            integrity: document.integrity,
            type: getFileType(document.fileType)
          }
        }
      });

    } catch (encryptionError) {
      console.error('❌ Encryption failed:', encryptionError);
      
      // Clean up uploaded file if encryption fails
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      
      res.status(500).json({
        success: false,
        message: 'Encryption failed: ' + encryptionError.message
      });
    }

  } catch (error) {
    console.error('❌ Upload document error:', error);
    
    // Clean up uploaded file if exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to upload document: ' + error.message
    });
  }
});

// Download document
app.get('/api/documents/download/:id', auth, async (req, res) => {
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

    // Update last accessed
    document.lastAccessed = new Date();
    await document.save();

    // Read encrypted file
    const encryptedData = fs.readFileSync(document.filePath);
    
    // Decrypt file (in real app, use proper decryption)
    // const decryptedData = decryptFile(encryptedData, document.iv, document.authTag);
    
    // For now, we'll send the encrypted file with a prompt for decryption
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${document.originalName}"`);
    res.setHeader('Content-Length', encryptedData.length);
    
    res.send(encryptedData);

  } catch (error) {
    console.error('Download document error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to download document'
    });
  }
});

// Delete document
app.delete('/api/documents/:id', auth, async (req, res) => {
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

    // Delete file from filesystem
    if (fs.existsSync(document.filePath)) {
      fs.unlinkSync(document.filePath);
    }

    // Delete from database
    await Document.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Document deleted successfully'
    });

  } catch (error) {
    console.error('Delete document error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete document'
    });
  }
});

// Share document
app.put('/api/documents/:id/share', auth, async (req, res) => {
  try {
    const { shared } = req.body;
    
    const document = await Document.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { shared: shared },
      { new: true }
    ).select('-encryptionKey -iv -hash');

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    res.json({
      success: true,
      message: `Document ${shared ? 'shared' : 'unshared'} successfully`,
      data: {
        document: {
          id: document._id,
          shared: document.shared
        }
      }
    });

  } catch (error) {
    console.error('Share document error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update document sharing'
    });
  }
});

// Verify document integrity
app.get('/api/documents/:id/verify', auth, async (req, res) => {
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

    // Read current file and calculate hash
    const currentFileBuffer = fs.readFileSync(document.filePath);
    const currentHash = calculateFileHash(currentFileBuffer);

    // Compare with stored hash
    const integrity = currentHash === document.hash ? 'verified' : 'warning';

    // Update integrity status
    document.integrity = integrity;
    await document.save();

    res.json({
      success: true,
      data: {
        integrity: integrity,
        verified: integrity === 'verified'
      }
    });

  } catch (error) {
    console.error('Verify document error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify document integrity'
    });
  }
});

// Utility functions
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const getFileType = (mimeType) => {
  const typeMap = {
    'application/pdf': 'pdf',
    'application/msword': 'doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'doc',
    'application/vnd.ms-excel': 'xls',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xls',
    'image/jpeg': 'img',
    'image/png': 'img',
    'image/gif': 'img',
    'text/plain': 'txt'
  };
  return typeMap[mimeType] || 'default';
};
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
    console.log(`📊 Database status: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'}`);
});