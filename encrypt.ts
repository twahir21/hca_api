// To run this file: bun run bun-encryption.ts

import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto';

// --- CONFIGURATION ---
const ALGORITHM = 'aes-256-gcm'; // Advanced Encryption Standard 256-bit with Galois/Counter Mode
const KEY_LENGTH = 32;          // Key length in bytes (256 bits)
const IV_LENGTH = 16;           // Initialization Vector length in bytes

// Helper type for the encrypted result object
interface EncryptedData {
    iv: string;         // Initialization Vector (hex)
    content: string;    // Encrypted data (hex)
    authTag: string;    // Authentication Tag (hex) - CRUCIAL for GCM mode
}

/**
 * Generates a 256-bit (32-byte) key from a password and salt using scrypt.
 * You would typically store the derived key (or the salt + password) securely.
 * @param password The secret string to derive the key from.
 * @param salt A random buffer used to make the key unique.
 * @returns A Buffer containing the 32-byte key.
 */
function deriveKeyFromPassword(password: string, salt: Buffer): Buffer {
    // We use scryptSync for key derivation for security
    return scryptSync(password, salt, KEY_LENGTH);
}

/**
 * Encrypts a plaintext string using AES-256-GCM.
 * @param text The data to encrypt.
 * @param key The 32-byte encryption key (Buffer).
 * @returns An EncryptedData object containing IV, ciphertext, and authentication tag.
 */
function encrypt(text: string, key: Buffer): EncryptedData {
    // 1. Generate a secure, random Initialization Vector (IV)
    const iv = randomBytes(IV_LENGTH);

    // 2. Create the cipher instance
    const cipher = createCipheriv(ALGORITHM, key, iv);

    // 3. Encrypt the data
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    // 4. Get the Authentication Tag (CRUCIAL for GCM)
    const authTag = cipher.getAuthTag();

    return {
        iv: iv.toString('hex'),
        content: encrypted,
        authTag: authTag.toString('hex'),
    };
}

/**
 * Decrypts data using AES-256-GCM, verifying the authentication tag.
 * If the data or tag is tampered with, decryption will fail (throw an error).
 * @param encryptedData The EncryptedData object.
 * @param key The 32-byte encryption key (Buffer).
 * @returns The original plaintext string.
 */
function decrypt(encryptedData: EncryptedData, key: Buffer): string {
    const iv = Buffer.from(encryptedData.iv, 'hex');
    const authTag = Buffer.from(encryptedData.authTag, 'hex');
    const content = encryptedData.content;

    // 1. Create the decipher instance
    const decipher = createDecipheriv(ALGORITHM, key, iv);

    // 2. Set the Authentication Tag (MUST be done before decryption starts)
    decipher.setAuthTag(authTag);

    // 3. Decrypt the data
    try {
        let decrypted = decipher.update(content, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    } catch (e) {
        // If the authentication tag is invalid or the data is corrupted,
        // the decipher.final() call will throw an error.
        throw new Error('Authentication failed (Decryption failed): Data may have been tampered with.');
    }
}


// =================================================================
// === EXECUTION EXAMPLE ===
// =================================================================

const SECRET_PASSWORD = process.env.ENCRYPTION_KEY;
const MESSAGE_TO_ENCRYPT = 'Hello Bun! This is sensitive data.';
const SALT = randomBytes(16); // A unique salt for key derivation (should be stored alongside the encrypted data)

console.log(`Original Message: "${MESSAGE_TO_ENCRYPT}"`);

if (!SECRET_PASSWORD) throw new Error("Missing security key!");

// 1. Derive the Key
const encryptionKey = deriveKeyFromPassword(SECRET_PASSWORD, SALT);
console.log(`\nDerived Key (32 Bytes): ${encryptionKey.toString('hex')}`);
console.log(`Salt (to be stored): ${SALT.toString('hex')}`);


// 2. Encrypt the Data
const encryptedResult = encrypt(MESSAGE_TO_ENCRYPT, encryptionKey);

console.log('\n--- ENCRYPTED DATA (FOR STORAGE/TRANSMISSION) ---');
console.log(`IV:      ${encryptedResult.iv}`);
console.log(`Content: ${encryptedResult.content}`);
console.log(`AuthTag: ${encryptedResult.authTag}`);
console.log('------------------------------------------------');


// 3. Decrypt the Data
try {
    const decryptedMessage = decrypt(encryptedResult, encryptionKey);
    console.log(`\nDecrypted Message: "${decryptedMessage}"`);

    if (decryptedMessage === MESSAGE_TO_ENCRYPT) {
        console.log('\n✅ Success: Encryption and Decryption match.');
    } else {
        console.log('\n❌ Error: Messages do not match.');
    }
} catch (error) {
    console.error(`\nDecryption failed: ${(error as Error).message}`);
}
