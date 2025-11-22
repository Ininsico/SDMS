const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken'); // Fixed: changed from 'jwt' to 'jsonwebtoken'
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const CryptoUtils = require('./cryptoUitils');
require('dotenv').config()

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sdms'; // Fixed port: 27107 to 27017

const app = express(); // Moved app declaration before use statements

app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173' || '*',
    credentials: true
}));
app.use(express.json());
app.use('/uploads', express.static('uploads'));

mongoose.connect(MONGODB_URI)
    .then(() => console.log('Database is connected')) // Fixed spelling: connceted to connected
    .catch(error => {
        console.log("Mongo Db connection failed", error.message);
    });

const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true }); // Fixed: added Sync
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
    if (file.mimetype.startsWith('image/')) { // Fixed: startswith to startsWith
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024
    }
});

const documentstorage = multer.diskStorage({
    destination: function (req, file, cb) {
        const userDir = path.join(__dirname, 'uploads', 'documents', req.user._id.toString()); // Fixed: tostring to toString
        if (!fs.existsSync(userDir)) {
            fs.mkdirSync(userDir, { recursive: true });
        }
        cb(null, userDir); // Added missing callback
    },
    filename: function (req, file, cb) {
        const uniquesuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
        const fileExtension = path.extname(file.originalname);
        cb(null, 'doc-' + uniquesuffix + fileExtension);
    }
});

const documentfilefilter = (req, file, cb) => {
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
        cb(new Error('Invalid file type. Only documents and images allowed')); // Fixed spelling
    }
};

const documentupload = multer({
    storage: documentstorage,
    fileFilter: documentfilefilter,
    limits: {
        fileSize: 50 * 1024 * 1024
    }
});

///Schemas///
////User Schema////
const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true
    },
    email: {
        type: String, // Fixed: changed from 'name: String' to 'type: String'
        required: true,
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true, // Fixed: require to required
    },
    role: {
        type: String,
        default: 'user'
    },
    isverified: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    profilePicture: {
        type: String,
        default: '/uploads/profilepics/pfp.png' // Fixed spelling: uplaods to uploads
    },
    lastlogin: {
        type: Date
    }
});

UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

UserSchema.methods.correctPassword = async function (candidatePassword) { // Fixed: removed () and = 
    return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', UserSchema);

/////Document Schema//////
const DocumentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    size: {
        type: Number,
        required: true
    },
    filetype: {
        type: String,
        required: true
    },
    filepath: {
        type: String,
        required: true
    },
    encrypted: {
        type: Boolean,
        default: false
    },
    encryptionkey: {
        type: String,
        required: false
    },
    iv: {
        type: String,
        required: false
    },
    authtag: {
        type: String,
        required: false
    },
    shared: {
        type: Boolean,
        default: false
    },
    sharedwith: [
        {
            userId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            sharedAt: {
                type: Date,
                default: Date.now
            },
            candownload: {
                type: Boolean,
                default: true
            }
        }
    ],
    hash: {
        type: String,
        required: false
    },
    orginalHash: {
        type: String,
        required: false
    },
    uploadDate: {
        type: Date,
        default: Date.now
    },
    lastAccessed: {
        type: Date,
        default: Date.now
    },
    encryptedAt: {
        type: Date,
        required: false
    }
});

const Document = mongoose.model('Document', DocumentSchema);

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'No token provided'
            });
        }

        const decoded = jwt.verify(token,  process.env.JWT_SECRET || 'your_secret_key');
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

app.post('/api/signup', async (req, res) => {
    try {
        const { name, email, password, confirmpassword } = req.body;
        if (!name || !email || !password || !confirmpassword) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required' // Added missing message
            });
        }
        if (password !== confirmpassword) {
            return res.status(400).json({
                success: false,
                message: 'Passwords do not match' // Added missing message
            })
        }
        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password cannot be less than 6 characters" // Fixed spelling
            })
        }

        // Fixed: Use 'user' for instance, 'User' for model
        const user = new User({
            name: name.trim(),
            email: email.toLowerCase(),
            password,
            role: 'user' // Fixed: 'User' to 'user'
        });

        await user.save(); // Fixed: User.save() to user.save()

        const token = jwt.sign(
            { userId: user._id, email: user.email, role: user.role },
            process.env.JWT_SECRET || 'your_secret_key',
            { expiresIn: '24h' }
        );

        res.status(201).json({
            success: true,
            message: 'User Created Successfully',
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
    } catch (error) { // Fixed: err to error
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

        // Fixed: findOne to User.findOne
        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user || !(await user.correctPassword(password))) {
            return res.status(400).json({
                success: false,
                message: 'Invalid Email or Password'
            });
        }

        user.lastlogin = new Date();
        await user.save(); // Fixed: User.save() to user.save()

        const token = jwt.sign(
            { userId: user._id, email: user.email, role: user.role },
            process.env.JWT_SECRET || 'Your_secret_key', // Fixed spelling
            { expiresIn: '24h' }
        );

        res.json({
            success: true,
            message: "Login successful", // Fixed spelling
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
    } catch (error) { // Fixed: err to error
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
app.get('/api/profile', auth, async (req, res) => {
    try {
        // Ensure we have the complete user data with all fields
        const user = await User.findById(req.user._id).select('-password');
        
        res.json({
            success: true,
            data: {
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    profilePicture: user.profilePicture,
                    createdAt: user.createdAt,
                    lastLogin: user.lastlogin, // Map to camelCase for frontend
                    isVerified: user.isverified
                }
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

        // Fixed: findOne to User.findOne
        const existingUser = await User.findOne({ // Fixed spelling: exsisting to existing
            email: email.toLowerCase(),
            _id: { $ne: req.user._id }
        });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: 'Email is already taken'
            });
        }

        const updatedUser = await User.findByIdAndUpdate( // Fixed: updateduser to updatedUser
            req.user._id,
            {
                name: name.trim(),
                email: email.toLowerCase() // Fixed: added ()
            },
            { new: true }
        ).select('-password');

        res.json({
            success: true,
            message: 'Profile updated successfully', // Fixed message
            data: {
                user: updatedUser
            }
        })
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
        const { currentpassword, newpassword } = req.body;
        if (!newpassword) {
            return res.status(400).json({
                success: false,
                message: 'New password is required'
            });
        }

        if (newpassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters'
            });
        }

        // Fixed: findById to User.findById
        const user = await User.findById(req.user._id);

        if (currentpassword) {
            const isCurrentPasswordValid = await user.correctPassword(currentpassword);
            if (!isCurrentPasswordValid) {
                return res.status(401).json({
                    success: false,
                    message: 'Current password is incorrect'
                });
            }
        }

        user.password = newpassword;
        await user.save();

        res.json({
            success: true,
            message: "Successfully Updated Password",
        })
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
                message: "No file uploaded"
            });
        }

        // Fixed: findOne to User.findById
        const user = await User.findById(req.user._id);

        if (user.profilePicture && user.profilePicture.startsWith('/uploads/')) { // Fixed: startswith to startsWith
            const oldFilePath = path.join(__dirname, '..', user.profilePicture); // Fixed variable name and added '..'
            if (fs.existsSync(oldFilePath)) {
                fs.unlinkSync(oldFilePath);
            }
        }

        const profilePicturePath = '/uploads/' + req.file.filename; // Fixed spelling: profie to profile

        // Fixed: user.findByIdAndUpdate to User.findByIdAndUpdate
        const updatedUser = await User.findByIdAndUpdate(
            req.user._id,
            { profilePicture: profilePicturePath },
            { new: true }
        ).select('-password');

        res.json({
            success: true,
            message: "Profile Picture Updated successfully",
            data: {
                user: updatedUser,
                profilePicturePath: `${req.protocol}://${req.get('host')}${profilePicturePath}` // Fixed spelling
            }
        })
    } catch (error) {
        console.error('Profile picture upload error:', error);

        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }

        res.status(500).json({
            success: false,
            message: 'Failed to upload profile picture'
        });
    }
});

app.delete('/api/profile/picture', auth, async (req, res) => { // Fixed route to be more specific
    try {
        const user = await User.findById(req.user._id);

        // Delete the current profile picture file if it's not the default one
        if (user.profilePicture &&
            user.profilePicture.startsWith('/uploads') &&
            user.profilePicture !== '/uploads/profilepics/pfp.png') { // Check if it's not already the default

            const filePath = path.join(__dirname, '..', user.profilePicture); // Added '..' to go up one level
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }

        // Revert to default profile picture
        const updatedUser = await User.findByIdAndUpdate(
            req.user._id,
            { profilePicture: '/uploads/profilepics/pfp.png' }, // Set to default instead of empty string
            { new: true }
        ).select('-password');

        res.json({
            success: true,
            message: 'Profile picture removed successfully',
            data: {
                user: updatedUser,
                profilePicturePath: `${req.protocol}://${req.get('host')}/uploads/profilepics/pfp.png`
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

app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString(), // Fixed spelling: timestap to timestamp
        database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
    });
});
const documentRoutes = require('./documentRoutes')(auth, Document, documentupload);
app.use('/api/documents', documentRoutes);
// Added missing server listen
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});