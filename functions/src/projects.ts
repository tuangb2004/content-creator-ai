import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { randomUUID } from 'crypto';
import { FieldValue } from 'firebase-admin/firestore';
import { validateAuth } from './utils/validation';

// Lazy load firestore
function getDb() {
  return admin.firestore();
}

function getBucket() {
  return admin.storage().bucket();
}

const DATA_URL_REGEX = /^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/;

function parseImageDataUrl(value: string): { buffer: Buffer; contentType: string } | null {
  const match = value.match(DATA_URL_REGEX);
  if (!match) return null;
  const [, contentType, base64Data] = match;
  try {
    return {
      buffer: Buffer.from(base64Data, 'base64'),
      contentType
    };
  } catch {
    return null;
  }
}

async function uploadImageDataUrl(
  dataUrl: string,
  pathPrefix: string
): Promise<string> {
  const parsed = parseImageDataUrl(dataUrl);
  if (!parsed) {
    return dataUrl;
  }

  const token = randomUUID();
  const extension = parsed.contentType.split('/')[1] || 'png';
  const filePath = `${pathPrefix}/${token}.${extension}`;
  const bucket = getBucket();
  const file = bucket.file(filePath);

  await file.save(parsed.buffer, {
    contentType: parsed.contentType,
    resumable: false,
    metadata: {
      metadata: {
        firebaseStorageDownloadTokens: token
      }
    }
  });

  return `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(filePath)}?alt=media&token=${token}`;
}

export interface Project {
  userId: string;
  title: string;
  type: 'blog' | 'caption' | 'email' | 'product' | 'image';
  content: {
    text?: string;
    imageUrl?: string;
    images?: string[];
  };
  metadata?: {
    prompt?: string;
    template?: string;
    tone?: string;
    length?: string;
    style?: string;
  };
  createdAt: FirebaseFirestore.Timestamp;
  updatedAt: FirebaseFirestore.Timestamp;
}

export interface SaveProjectRequest {
  title: string;
  type: 'blog' | 'caption' | 'email' | 'product' | 'image';
  content: {
    text?: string;
    imageUrl?: string;
    images?: string[];
  };
  metadata?: {
    prompt?: string;
    template?: string;
    tone?: string;
    length?: string;
    style?: string;
  };
}

export interface SaveProjectResponse {
  success: boolean;
  projectId: string;
  project: Project;
}

export interface GetProjectsResponse {
  success: boolean;
  projects: (Project & { id: string })[];
  count: number;
}

export interface DeleteProjectResponse {
  success: boolean;
  message: string;
}

/**
 * Save a project to Firestore
 */
export const saveProject = functions.https.onCall(
  async (data: SaveProjectRequest, context: functions.https.CallableContext): Promise<SaveProjectResponse> => {
    // Validate authentication
    const userId = validateAuth(context);

    // Validate request data
    if (!data.title || !data.type) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Title and type are required'
      );
    }

    const { title, type, content, metadata } = data;

    const normalizeString = (value?: string): string | undefined => {
      if (typeof value !== 'string') return undefined;
      const trimmed = value.trim();
      return trimmed.length > 0 ? trimmed : undefined;
    };

    const normalizeImageString = (value: unknown): string | undefined => {
      if (typeof value === 'string') return normalizeString(value);
      if (value && typeof value === 'object') {
        const candidate = value as { url?: unknown; imageUrl?: unknown; dataUrl?: unknown };
        return (
          normalizeString(typeof candidate.url === 'string' ? candidate.url : undefined) ||
          normalizeString(typeof candidate.imageUrl === 'string' ? candidate.imageUrl : undefined) ||
          normalizeString(typeof candidate.dataUrl === 'string' ? candidate.dataUrl : undefined)
        );
      }
      return undefined;
    };

    const normalizeStringArray = (value: unknown): string[] | undefined => {
      if (!Array.isArray(value)) return undefined;
      const flattened = value.reduce<unknown[]>((acc, item) => {
        if (Array.isArray(item)) {
          acc.push(...item);
        } else {
          acc.push(item);
        }
        return acc;
      }, []);
      const normalized = flattened
        .map((item) => normalizeImageString(item) || normalizeString(typeof item === 'string' ? item : undefined))
        .filter((item): item is string => typeof item === 'string' && item.length > 0);
      return normalized.length > 0 ? normalized : undefined;
    };

    const normalizeContent = () => {
      if (!content) return undefined;

      if (typeof content === 'string') {
        const text = normalizeString(content);
        return text ? { text } : undefined;
      }

      const rawContent = content as Record<string, unknown>;
      const text = normalizeString(typeof rawContent.text === 'string' ? rawContent.text : undefined);
      const imageUrl = normalizeImageString(rawContent.imageUrl);
      const images = normalizeStringArray(rawContent.images);

      const normalized: SaveProjectRequest['content'] = {};
      if (text) normalized.text = text;
      if (imageUrl) normalized.imageUrl = imageUrl;
      if (images && images.length > 0) normalized.images = images;

      return Object.keys(normalized).length > 0 ? normalized : undefined;
    };

    const normalizeMetadata = () => {
      if (!metadata) return undefined;
      const normalized: SaveProjectRequest['metadata'] = {};
      const prompt = normalizeString(metadata.prompt);
      const template = normalizeString(metadata.template);
      const tone = normalizeString(metadata.tone);
      const length = normalizeString(metadata.length);
      const style = normalizeString(metadata.style);
      if (prompt) normalized.prompt = prompt;
      if (template) normalized.template = template;
      if (tone) normalized.tone = tone;
      if (length) normalized.length = length;
      if (style) normalized.style = style;
      return Object.keys(normalized).length > 0 ? normalized : undefined;
    };

    const db = getDb();
    const projectsRef = db.collection('projects');

    // Create project document
    const projectData: Omit<Project, 'createdAt' | 'updatedAt'> & {
      createdAt: FieldValue;
      updatedAt: FieldValue;
    } = {
      userId,
      title,
      type,
      content: {},
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    const normalizedContent = normalizeContent();
    if (normalizedContent) {
      projectData.content = normalizedContent;
    }

    const normalizedMetadata = normalizeMetadata();
    if (normalizedMetadata) {
      projectData.metadata = normalizedMetadata;
    }

    try {
      const docRef = projectsRef.doc();

      if (projectData.type === 'image' && projectData.content) {
        const contentToUpdate: SaveProjectRequest['content'] = { ...projectData.content };
        const pathPrefix = `projects/${userId}/${docRef.id}`;

        if (contentToUpdate.imageUrl) {
          contentToUpdate.imageUrl = await uploadImageDataUrl(
            contentToUpdate.imageUrl,
            pathPrefix
          );
        }

        if (contentToUpdate.images && contentToUpdate.images.length > 0) {
          const uploadedImages = await Promise.all(
            contentToUpdate.images.map((imageUrl) =>
              uploadImageDataUrl(imageUrl, pathPrefix)
            )
          );
          contentToUpdate.images = uploadedImages;
          if (!contentToUpdate.imageUrl && uploadedImages[0]) {
            contentToUpdate.imageUrl = uploadedImages[0];
          }
        }

        projectData.content = contentToUpdate;
      }

      await docRef.set(projectData);
      
      // Get the created document
      const docSnap = await docRef.get();
      const project = docSnap.data() as Project;

      return {
        success: true,
        projectId: docRef.id,
        project: {
          ...project,
          createdAt: project.createdAt || admin.firestore.Timestamp.now(),
          updatedAt: project.updatedAt || admin.firestore.Timestamp.now(),
        },
      };
    } catch (error: any) {
      console.error('Error saving project:', error);
      throw new functions.https.HttpsError(
        'internal',
        'Failed to save project',
        error.message
      );
    }
  }
);

/**
 * Get all projects for the authenticated user
 */
export const getProjects = functions.https.onCall(
  async (data: any, context: functions.https.CallableContext): Promise<GetProjectsResponse> => {
    // Validate authentication
    const userId = validateAuth(context);

    const db = getDb();
    const projectsRef = db.collection('projects');

    try {
      // Query projects for this user, ordered by createdAt descending
      const querySnapshot = await projectsRef
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc')
        .get();

      const projects: (Project & { id: string })[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data() as Project;
        projects.push({
          ...data,
          id: doc.id, // Include document ID
          createdAt: data.createdAt || admin.firestore.Timestamp.now(),
          updatedAt: data.updatedAt || admin.firestore.Timestamp.now(),
        });
      });

      return {
        success: true,
        projects,
        count: projects.length,
      };
    } catch (error: any) {
      console.error('Error getting projects:', error);
      throw new functions.https.HttpsError(
        'internal',
        'Failed to get projects',
        error.message
      );
    }
  }
);

/**
 * Delete a project
 */
export const deleteProject = functions.https.onCall(
  async (data: { projectId: string }, context: functions.https.CallableContext): Promise<DeleteProjectResponse> => {
    // Validate authentication
    const userId = validateAuth(context);

    if (!data.projectId) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Project ID is required'
      );
    }

    const db = getDb();
    const projectRef = db.collection('projects').doc(data.projectId);

    try {
      // Check if project exists and belongs to user
      const projectDoc = await projectRef.get();
      
      if (!projectDoc.exists) {
        throw new functions.https.HttpsError(
          'not-found',
          'Project not found'
        );
      }

      const projectData = projectDoc.data() as Project;
      if (projectData.userId !== userId) {
        throw new functions.https.HttpsError(
          'permission-denied',
          'You do not have permission to delete this project'
        );
      }

      // Delete the project
      await projectRef.delete();

      return {
        success: true,
        message: 'Project deleted successfully',
      };
    } catch (error: any) {
      if (error instanceof functions.https.HttpsError) {
        throw error;
      }
      console.error('Error deleting project:', error);
      throw new functions.https.HttpsError(
        'internal',
        'Failed to delete project',
        error.message
      );
    }
  }
);

