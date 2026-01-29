import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { validateAuth } from './utils/validation';

function getDb() {
  return admin.firestore();
}

function getBucket() {
  return admin.storage().bucket();
}

export interface UploadFileRequest {
  fileName: string;
  fileType: string;
  fileSize: number;
  fileData: string; // Base64 encoded
  metadata?: {
    description?: string;
    tags?: string[];
  };
}

export interface UploadFileResponse {
  success: boolean;
  fileId: string;
  fileUrl: string;
  fileName: string;
  fileType: string;
  fileSize: number;
}

export interface GetUploadsResponse {
  success: boolean;
  uploads: Array<{
    id: string;
    fileName: string;
    fileType: string;
    fileSize: number;
    fileUrl: string;
    createdAt: any;
    metadata?: any;
  }>;
  count: number;
}

/**
 * Upload a file to Firebase Storage and save metadata to Firestore
 */
export const uploadFile = functions.https.onCall(
  async (data: UploadFileRequest, context: functions.https.CallableContext): Promise<UploadFileResponse> => {
    const userId = validateAuth(context);

    if (!data.fileName || !data.fileType || !data.fileData) {
      throw new functions.https.HttpsError('invalid-argument', 'fileName, fileType, and fileData are required');
    }

    // Validate file size (max 20MB)
    const maxSize = 20 * 1024 * 1024; // 20MB
    if (data.fileSize > maxSize) {
      throw new functions.https.HttpsError('invalid-argument', 'File size exceeds 20MB limit');
    }

    try {
      const bucket = getBucket();
      const db = getDb();
      
      // Generate unique file path
      const timestamp = Date.now();
      const sanitizedFileName = data.fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
      const filePath = `uploads/${userId}/${timestamp}_${sanitizedFileName}`;

      // Decode base64 and upload to Storage
      const fileBuffer = Buffer.from(data.fileData, 'base64');
      const file = bucket.file(filePath);

      await file.save(fileBuffer, {
        contentType: data.fileType,
        metadata: {
          metadata: {
            uploadedBy: userId,
            originalFileName: data.fileName,
            uploadedAt: new Date().toISOString()
          }
        }
      });

      // Make file publicly readable (or use signed URL for private)
      await file.makePublic();

      // Get public URL
      const fileUrl = `https://storage.googleapis.com/${bucket.name}/${filePath}`;

      // Save metadata to Firestore
      const uploadsRef = db.collection('uploads');
      const uploadData = {
        userId,
        fileName: data.fileName,
        fileType: data.fileType,
        fileSize: data.fileSize,
        fileUrl,
        storagePath: filePath,
        metadata: data.metadata || {},
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };

      const docRef = await uploadsRef.add(uploadData);

      return {
        success: true,
        fileId: docRef.id,
        fileUrl,
        fileName: data.fileName,
        fileType: data.fileType,
        fileSize: data.fileSize
      };
    } catch (error: any) {
      console.error('Error uploading file:', error);
      throw new functions.https.HttpsError('internal', 'Failed to upload file', error.message);
    }
  }
);

/**
 * Get all uploads for the authenticated user
 */
export const getUploads = functions.https.onCall(
  async (data: any, context: functions.https.CallableContext): Promise<GetUploadsResponse> => {
    const userId = validateAuth(context);

    const db = getDb();
    const uploadsRef = db.collection('uploads');

    try {
      const querySnapshot = await uploadsRef
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc')
        .get();

      const uploads = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          fileName: data.fileName,
          fileType: data.fileType,
          fileSize: data.fileSize,
          fileUrl: data.fileUrl,
          createdAt: data.createdAt,
          metadata: data.metadata
        };
      });

      return {
        success: true,
        uploads,
        count: uploads.length
      };
    } catch (error: any) {
      console.error('Error getting uploads:', error);
      throw new functions.https.HttpsError('internal', 'Failed to get uploads', error.message);
    }
  }
);

/**
 * Delete an upload
 */
export const deleteUpload = functions.https.onCall(
  async (data: { uploadId: string }, context: functions.https.CallableContext): Promise<{ success: boolean; message: string }> => {
    const userId = validateAuth(context);

    if (!data.uploadId) {
      throw new functions.https.HttpsError('invalid-argument', 'uploadId is required');
    }

    const db = getDb();
    const bucket = getBucket();
    const uploadRef = db.collection('uploads').doc(data.uploadId);

    try {
      const uploadDoc = await uploadRef.get();
      if (!uploadDoc.exists) {
        throw new functions.https.HttpsError('not-found', 'Upload not found');
      }

      const uploadData = uploadDoc.data()!;
      if (uploadData.userId !== userId) {
        throw new functions.https.HttpsError('permission-denied', 'Not your upload');
      }

      // Delete from Storage
      if (uploadData.storagePath) {
        try {
          await bucket.file(uploadData.storagePath).delete();
        } catch (storageError) {
          console.warn('Failed to delete file from Storage:', storageError);
        }
      }

      // Delete from Firestore
      await uploadRef.delete();

      return {
        success: true,
        message: 'Upload deleted successfully'
      };
    } catch (error: any) {
      if (error instanceof functions.https.HttpsError) throw error;
      console.error('Error deleting upload:', error);
      throw new functions.https.HttpsError('internal', 'Failed to delete upload', error.message);
    }
  }
);
