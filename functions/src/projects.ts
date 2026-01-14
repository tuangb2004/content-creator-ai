import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { validateAuth } from './utils/validation';

// Lazy load firestore
function getDb() {
  return admin.firestore();
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
      content: content || {},
      metadata: metadata || {},
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    try {
      const docRef = await projectsRef.add(projectData);
      
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

