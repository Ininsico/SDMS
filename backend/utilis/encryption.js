const crypto = require('crypto');

const encryptFile = (buffer) => {
    const algorithm = 'aes-256-gcm';
    const password = process.env.ENCRYPTION_KEY || 'your-super-secret-encryption-key-32-chars';
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
};

const decryptFile = (encryptedData, iv, authTag) => {
    const algorithm = 'aes-256-gcm';
    const password = process.env.ENCRYPTION_KEY || 'your-super-secret-encryption-key-32-chars';
    const key = crypto.createHash('sha256').update(password).digest();
    
    const decipher = crypto.createDecipher(algorithm, key);
    decipher.setAAD(Buffer.from('additional-auth-data'));
    decipher.setAuthTag(Buffer.from(authTag, 'hex'));
    
    const decrypted = Buffer.concat([decipher.update(encryptedData), decipher.final()]);
    return decrypted;
};

const calculateFileHash = (buffer) => {
    return crypto.createHash('sha256').update(buffer).digest('hex');
};

module.exports = {
    encryptFile,
    decryptFile,
    calculateFileHash
};