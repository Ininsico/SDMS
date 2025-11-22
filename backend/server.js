const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jwt');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const CryptoUtils = require('./cryptoUitils');
require('dotenv').config()
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27107/sdms';
app.use(cors({
    origin: process.env.FRONTEND_URL || 'https://localhost:5173' || '*',
    credentials: true
}));
app.use(express.json());
app.use('/uploads', express.static('uploads'));
const app = express();
mongoose.connect(MONGODB_URI)
    .then(() => console.log('Database is connceted'))
    .catch(error => {
        console.log("Mongo Db connection failed", error.message);
    });
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdir(uploadDir, { recursive: true });
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
    if (file.mimetype.startswith('image/')) {
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
        const userDir = path.join(__dirname, 'uploads', 'documents', req.user._id.tostring());
        if (!fs.existsSync(userDir)) {
            fs.mkdirSync(userDir, { recursive: true });
        }
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
        cb(new Error('Invalid file type.Only documents and images allowed'));
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
        name: String,
        required: true,
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        require: true,
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
        default: '/uplaods/profilepics/pfp.png'
    },
    lastlogin: {
        type: Date
    }
})
UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
    next();
});
UserSchema.methods.correctPassword() = async function (candidatePassword) {
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
    //encryption feild by default the file in not encrypted
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
    /////sharing components/////
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
    /////integrity and audit/////
    hash: {
        type: String,
        required: false
    },
    orginalHash: {
        type: String,
        required: false
    },
    ///Timestamps
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
app.post('/api/signup', async (req, res) => {
    try {
        const { name, email, password, confirmpassword } = req.body;
        if (!name || !email || !password || !confirmpassword) {
            return res.status(400).json({
                success: false
            });
        }
        if (password !== confirmpassword) {
            return res.status(400).json({
                success: false
            })
        }
        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password can not be less than 6 characters"
            })
        }
        const User = new User({
            name: name.trim(),
            email: email.toLowerCase();
            password,
            role: 'User'
        });
        await User.save();
        const token = jwt.sign(
            { userId: User._id, email: User.email, role: User.role },
            process.env.JWT_SECRET || 'your_secret_key',
            { expiresIn: '24h' }
        );
        res.status(201).json({
            success: true,
            message: 'User Created Successfully',
            data: {
                user: {
                    id: User._id,
                    name: User.name,
                    email: User.email,
                    role: User.role
                },
                token
            }
        });
    } catch (err) {
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
        const User = await findOne({ email: email.toLowerCase() });
        if (!User || !(await User.correctPassword(password))) {
            return res.status(400).json({
                success: false,
                message: 'Invalid Email or Password'
            });
        }
        User.lastlogin = new Date();
        await User.save()
        const token = jwt.sign(
            { userId: User._id, email: User.email, role: User.role },
            process.env.JWT_SECRET || 'Your_secrect_key',
            { expiresIn: '24h' }
        )
        res.json({
            success: true,
            message: "Login successfull",
            data: {
                user: {
                    id: User._id,
                    name: User.name,
                    email: User.email,
                    role: User.role
                },
                token
            }
        });
    } catch (err) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Server is running',
        timestap: new Date().toISOString(),
        database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
    });
});