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

const DATA_URL_REGEX = /^data:(image\/[a-zA-Z0-9.+-]+);base64,([\s\S]+)$/;

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
): Promise<string | null> {
  // If not a string or empty, return as is (if valid) or null
  if (!dataUrl || typeof dataUrl !== 'string') return dataUrl || null;

  // Check if it's already a http URL (optimization)
  if (dataUrl.startsWith('http')) return dataUrl;

  const parsed = parseImageDataUrl(dataUrl);
  if (!parsed) {
    // If we can't parse it, and it's huge, we can't save it.
    if (dataUrl.length > 1024 * 1024) return null;
    return dataUrl;
  }

  try {
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
  } catch (error) {
    console.error('Failed to upload image to storage:', error);

    // Safety check: Firestore document limit is 1MB.
    // If the image is larger than ~1MB (base64 is ~33% larger than binary, so 1MB base64 is ~750KB image),
    // we CANNOT fall back to saving it in Firestore. It will crash the request.
    if (dataUrl.length > 1000000) {
      console.warn('Image data URL too large for Firestore fallback (>1MB). Dropping image to save project.');
      return null;
    }

    // Fallback: return the original data URL only if small enough
    return dataUrl;
  }
}

/** Attached file in a user message */
export interface AttachedFile {
  url: string;
  name?: string;
  type?: string;
}

/** Chat message for full conversation history (Gemini/ChatGPT style) */
export interface ChatMessage {
  id?: string;
  role: 'user' | 'model';
  content: string;
  timestamp?: unknown;
  mediaUrl?: string | null;
  attachedFiles?: AttachedFile[] | null;
  modelId?: string | null;
  inputType?: string | null;
  isError?: boolean | null;
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
  /** Full chat history for this project */
  messages?: ChatMessage[];
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
  /** If provided, update this project (append/set messages). Otherwise create new. */
  projectId?: string;
  title: string;
  type: 'blog' | 'caption' | 'email' | 'product' | 'image';
  content: {
    text?: string;
    imageUrl?: string;
    images?: string[];
  };
  /** Full conversation messages to store/append */
  messages?: ChatMessage[];
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

export interface GetProjectResponse {
  success: boolean;
  project: (Project & { id: string }) | null;
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

    const { projectId: existingProjectId, title, type, content, metadata, messages: messagesInput } = data;

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

    const normalizeMessages = (): ChatMessage[] | undefined => {
      if (!Array.isArray(messagesInput) || messagesInput.length === 0) return undefined;
      return messagesInput
        .filter((m) => m && (m.role === 'user' || m.role === 'model') && typeof m.content === 'string')
        .map((m) => {
          const msg = m as ChatMessage & { attachedFiles?: unknown };
          const attachedFiles = Array.isArray(msg.attachedFiles)
            ? msg.attachedFiles.map((f: { url?: unknown; name?: unknown; type?: unknown }) => ({
              url: typeof f?.url === 'string' ? f.url : '',
              name: typeof f?.name === 'string' ? f.name : undefined,
              type: typeof f?.type === 'string' ? f.type : undefined,
            })).filter((f) => f.url)
            : null;
          return {
            id: typeof msg.id === 'string' ? msg.id : undefined,
            role: msg.role,
            content: msg.content,
            timestamp: msg.timestamp,
            mediaUrl: typeof msg.mediaUrl === 'string' ? msg.mediaUrl : null,
            attachedFiles: attachedFiles && attachedFiles.length > 0 ? attachedFiles : null,
            modelId: typeof msg.modelId === 'string' ? msg.modelId : null,
            inputType: typeof msg.inputType === 'string' ? msg.inputType : null,
            isError: !!msg.isError,
          };
        });
    };

    const normalizedMessages = normalizeMessages();

    try {
      // Update existing project
      if (existingProjectId && typeof existingProjectId === 'string') {
        const projectRef = projectsRef.doc(existingProjectId);
        const existingDoc = await projectRef.get();
        if (!existingDoc.exists) {
          throw new functions.https.HttpsError('not-found', 'Project not found');
        }
        const existingData = existingDoc.data() as Project;
        if (existingData.userId !== userId) {
          throw new functions.https.HttpsError('permission-denied', 'Not your project');
        }

        const updateData: Record<string, unknown> = {
          title,
          type,
          updatedAt: FieldValue.serverTimestamp(),
        };
        const normalizedContent = normalizeContent();
        if (normalizedContent) {
          updateData.content = normalizedContent;
          if (type === 'image' && normalizedContent.imageUrl) {
            const pathPrefix = `projects/${userId}/${existingProjectId}`;
            const uploaded = await uploadImageDataUrl(normalizedContent.imageUrl, pathPrefix);
            if (uploaded) {
              (updateData.content as SaveProjectRequest['content']).imageUrl = uploaded;
            }
          }
        }
        if (normalizedMessages && normalizedMessages.length > 0) {
          updateData.messages = await Promise.all(normalizedMessages.map(async (msg) => {
            if (msg.mediaUrl) {
              const uploaded = await uploadImageDataUrl(msg.mediaUrl, `projects/${userId}/${existingProjectId}`);
              return { ...msg, mediaUrl: uploaded || msg.mediaUrl };
            }
            return msg;
          }));
        }
        const normalizedMetadata = normalizeMetadata();
        if (normalizedMetadata) {
          updateData.metadata = normalizedMetadata;
        }

        await projectRef.update(updateData);
        const updatedSnap = await projectRef.get();
        const project = updatedSnap.data() as Project;
        return {
          success: true,
          projectId: existingProjectId,
          project: {
            ...project,
            createdAt: project.createdAt || admin.firestore.Timestamp.now(),
            updatedAt: project.updatedAt || admin.firestore.Timestamp.now(),
          },
        };
      }

      // Create new project document
      const docRef = projectsRef.doc(); // Fixed docRef initialization order

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
      if (normalizedMessages && normalizedMessages.length > 0) {
        projectData.messages = await Promise.all(normalizedMessages.map(async (msg) => {
          if (msg.mediaUrl) {
            try {
              const uploaded = await uploadImageDataUrl(msg.mediaUrl, `projects/${userId}/${docRef.id}`);
              return { ...msg, mediaUrl: uploaded || null };
            } catch (error) {
              console.error('Backend image upload failed, falling back to original Data URL:', error);
              // Return original message with Data URL if upload fails (and fits)
              return msg;
            }
          }
          return msg;
        }));
      }

      const normalizedMetadata = normalizeMetadata();
      if (normalizedMetadata) {
        projectData.metadata = normalizedMetadata;
      }

      if (projectData.type === 'image' && projectData.content && Object.keys(projectData.content).length > 0) {
        const contentToUpdate: SaveProjectRequest['content'] = { ...projectData.content };
        const pathPrefix = `projects/${userId}/${docRef.id}`;

        if (contentToUpdate.imageUrl) {
          try {
            const uploaded = await uploadImageDataUrl(
              contentToUpdate.imageUrl,
              pathPrefix
            );
            contentToUpdate.imageUrl = uploaded || undefined;
          } catch (e) {
            console.error('Backend main image upload failed, falling back:', e);
            // Allow Data URL to persist if upload fails
          }
        }

        if (contentToUpdate.images && contentToUpdate.images.length > 0) {
          const uploadedImages = await Promise.all(
            contentToUpdate.images.map((imageUrl) =>
              uploadImageDataUrl(imageUrl, pathPrefix)
            )
          );
          contentToUpdate.images = uploadedImages.filter((u): u is string => u !== null);
          if (!contentToUpdate.imageUrl && contentToUpdate.images[0]) {
            contentToUpdate.imageUrl = contentToUpdate.images[0];
          }
        }

        projectData.content = contentToUpdate;
      }

      await docRef.set(projectData);

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
      if (error instanceof functions.https.HttpsError) throw error;
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
 * Get a single project by ID (for opening full chat history)
 */
export const getProject = functions.https.onCall(
  async (data: { projectId: string }, context: functions.https.CallableContext): Promise<GetProjectResponse> => {
    const userId = validateAuth(context);
    if (!data.projectId) {
      throw new functions.https.HttpsError('invalid-argument', 'projectId is required');
    }

    const db = getDb();
    const projectRef = db.collection('projects').doc(data.projectId);

    try {
      const docSnap = await projectRef.get();
      if (!docSnap.exists) {
        return { success: true, project: null };
      }
      const projectData = docSnap.data() as Project;
      if (projectData.userId !== userId) {
        throw new functions.https.HttpsError('permission-denied', 'Not your project');
      }
      const project = {
        ...projectData,
        id: docSnap.id,
        createdAt: projectData.createdAt || admin.firestore.Timestamp.now(),
        updatedAt: projectData.updatedAt || admin.firestore.Timestamp.now(),
      };
      return { success: true, project };
    } catch (error: any) {
      if (error instanceof functions.https.HttpsError) throw error;
      console.error('Error getting project:', error);
      throw new functions.https.HttpsError('internal', 'Failed to get project', (error as Error).message);
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

