const crypto = require('crypto');

class CryptoUtils {
  // RSA Key Pair Generation
  static generateKeyPair() {
    return new Promise((resolve, reject) => {
      crypto.generateKeyPair('rsa', {
        modulusLength: 2048, // Fixed typo: was 'moduluslength'
        publicKeyEncoding: {
          type: 'spki', // Fixed typo: was 'PublicKeyEncoding'
          format: 'pem'
        },
        privateKeyEncoding: {
          type: 'pkcs8', // Fixed typo: was 'privatekeyencoding'
          format: 'pem'
        }
      }, (err, publicKey, privateKey) => { // Fixed variable names
        if (err) reject(err);
        resolve({ publicKey, privateKey });
      });
    });
  }

  // AES File Encryption
  static encryptFile(buffer) {
    try {
      const algorithm = 'aes-256-gcm';

      // Generate random AES key (256 bits = 32 bytes)
      const aesKey = crypto.randomBytes(32);

      // Generate random IV (16 bytes for AES-GCM)
      const iv = crypto.randomBytes(16);

      // Create cipher
      const cipher = crypto.createCipheriv(algorithm, aesKey, iv);

      // Encrypt the data
      const encrypted = Buffer.concat([
        cipher.update(buffer),
        cipher.final()
      ]);

      // Get authentication tag
      const authTag = cipher.getAuthTag();

      return {
        encryptedData: encrypted,
        aesKey: aesKey,
        iv: iv,
        authTag: authTag
      };
    } catch (error) {
      console.error('AES Encryption error:', error);
      throw error;
    }
  }

  // AES File Decryption
  static decryptFile(encryptedData, aesKey, iv, authTag) {
    try {
      const algorithm = 'aes-256-gcm';

      const decipher = crypto.createDecipheriv(algorithm, aesKey, iv);
      decipher.setAuthTag(authTag);

      const decrypted = Buffer.concat([
        decipher.update(encryptedData),
        decipher.final()
      ]);

      return decrypted;
    } catch (error) {
      console.error('AES Decryption error:', error);
      throw error;
    }
  }

  // SHA-256 Hashing
  static generateFileHash(buffer) {
    try {
      const hash = crypto.createHash('sha256');
      hash.update(buffer);
      return hash.digest('hex');
    } catch (error) {
      console.error('Hash generation error:', error);
      throw error;
    }
  }

  // Integrity Verification
  static verifyFileIntegrity(buffer, originalHash) {
    const currentHash = this.generateFileHash(buffer);
    return currentHash === originalHash;
  }

  // RSA Encrypt AES Key
  static encryptAESKey(aesKey, rsaPublicKey) {
    try {
      const encryptedKey = crypto.publicEncrypt(
        {
          key: rsaPublicKey,
          padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
          oaepHash: 'sha256'
        },
        aesKey
      );
      return encryptedKey;
    } catch (error) {
      console.error('RSA Encryption error:', error);
      throw error;
    }
  }

  // RSA Decrypt AES Key
  static decryptAESKey(encryptedAesKey, rsaPrivateKey) {
    try {
      const decryptedKey = crypto.privateDecrypt(
        {
          key: rsaPrivateKey,
          padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
          oaepHash: 'sha256'
        },
        encryptedAesKey
      );
      return decryptedKey;
    } catch (error) {
      console.error('RSA Decryption error:', error);
      throw error;
    }
  }

  // Complete Encryption Workflow
  static async completeEncryptionWorkflow(fileBuffer, recipientPublicKey) {
    try {
      // Step 1: Generate file hash for integrity
      const fileHash = this.generateFileHash(fileBuffer);
      console.log('✓ File hash generated');

      // Step 2: Encrypt file with AES
      const aesResult = this.encryptFile(fileBuffer);
      console.log('✓ File encrypted with AES-256-GCM');

      // Step 3: Encrypt AES key with RSA
      const encryptedAESKey = this.encryptAESKey(aesResult.aesKey, recipientPublicKey);
      console.log('✓ AES key encrypted with RSA');

      return {
        encryptedData: aesResult.encryptedData,
        encryptedAESKey: encryptedAESKey.toString('base64'),
        iv: aesResult.iv.toString('hex'),
        authTag: aesResult.authTag.toString('hex'),
        fileHash: fileHash
      };
    } catch (error) {
      console.error('Encryption workflow failed:', error);
      throw error;
    }
  }

  // Complete Decryption Workflow
  static async completeDecryptionWorkflow(encryptedData, encryptedAESKey, iv, authTag, fileHash, recipientPrivateKey) {
    try {
      // Step 1: Decrypt AES key with RSA
      const aesKey = this.decryptAESKey(
        Buffer.from(encryptedAESKey, 'base64'), 
        recipientPrivateKey
      );
      console.log('✓ AES key decrypted with RSA');

      // Step 2: Decrypt file with AES
      const decryptedFile = this.decryptFile(
        encryptedData,
        aesKey,
        Buffer.from(iv, 'hex'),
        Buffer.from(authTag, 'hex')
      );
      console.log('✓ File decrypted with AES');

      // Step 3: Verify integrity
      const integrityVerified = this.verifyFileIntegrity(decryptedFile, fileHash);
      console.log('✓ Integrity verification:', integrityVerified ? 'PASS' : 'FAIL');

      if (!integrityVerified) {
        throw new Error('File integrity check failed! File may have been tampered with.');
      }

      return decryptedFile;
    } catch (error) {
      console.error('Decryption workflow failed:', error);
      throw error;
    }
  }
}

module.exports = CryptoUtils;