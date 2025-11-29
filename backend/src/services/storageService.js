import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import crypto from 'crypto';

// Initialize R2 client (S3-compatible)
// Initialize R2 client (S3-compatible)
console.log('R2 Config:', {
    accountId: process.env.R2_ACCOUNT_ID ? 'Set' : 'Missing',
    accessKeyId: process.env.R2_ACCESS_KEY_ID ? 'Set' : 'Missing',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY ? 'Set' : 'Missing',
    bucket: process.env.R2_BUCKET_NAME ? 'Set' : 'Missing',
    publicUrl: process.env.R2_PUBLIC_URL ? 'Set' : 'Missing'
});

const r2Client = new S3Client({
    region: 'auto',
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY
    }
});

/**
 * Upload file to Cloudflare R2
 * @param {Buffer} fileBuffer - File buffer
 * @param {string} fileName - Original file name
 * @param {string} mimeType - File MIME type
 * @param {string} folder - Folder path (optional)
 * @returns {Promise<string>} - Public URL of uploaded file
 */
export const uploadFile = async (fileBuffer, fileName, mimeType, folder = 'uploads') => {
    try {
        // Generate unique filename
        const fileExt = fileName.split('.').pop();
        const uniqueFileName = `${folder}/${crypto.randomBytes(16).toString('hex')}.${fileExt}`;

        const command = new PutObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME,
            Key: uniqueFileName,
            Body: fileBuffer,
            ContentType: mimeType
        });

        await r2Client.send(command);

        // Return public URL
        let baseUrl = process.env.R2_PUBLIC_URL;
        if (!baseUrl.startsWith('http')) {
            baseUrl = `https://${baseUrl}`;
        }
        if (baseUrl.endsWith('/')) {
            baseUrl = baseUrl.slice(0, -1);
        }

        const publicUrl = `${baseUrl}/${uniqueFileName}`;
        console.log('✅ File uploaded successfully:', publicUrl);

        return publicUrl;
    } catch (error) {
        console.error('❌ Error uploading file:', error);
        throw error;
    }
};

/**
 * Delete file from Cloudflare R2
 * @param {string} fileKey - File key/path in R2
 */
export const deleteFile = async (fileKey) => {
    try {
        const command = new DeleteObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME,
            Key: fileKey
        });

        await r2Client.send(command);
        console.log('✅ File deleted successfully:', fileKey);
    } catch (error) {
        console.error('❌ Error deleting file:', error);
        throw error;
    }
};

/**
 * Get signed URL for private file access
 * @param {string} fileKey - File key/path in R2
 * @param {number} expiresIn - URL expiration in seconds (default: 3600)
 * @returns {Promise<string>} - Signed URL
 */
export const getSignedFileUrl = async (fileKey, expiresIn = 3600) => {
    try {
        const command = new GetObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME,
            Key: fileKey
        });

        const signedUrl = await getSignedUrl(r2Client, command, { expiresIn });
        return signedUrl;
    } catch (error) {
        console.error('❌ Error generating signed URL:', error);
        throw error;
    }
};
