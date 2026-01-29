import { httpsCallable } from 'firebase/functions';
import { functions } from '../config/firebase';

/**
 * Firebase Functions Service
 * Wrapper for calling Cloud Functions with error handling
 */

/**
 * Generate content using multiple providers (Groq, Gemini, Pollination)
 * @param {Object} data - Request data
 * @param {string} data.prompt - User prompt/topic
 * @param {string} [data.template='blog'] - Content template (blog, caption, email, product) - for text only
 * @param {string} [data.tone='professional'] - Tone (professional, casual, friendly, persuasive) - for text only
 * @param {string} [data.length='medium'] - Length (short, medium, long) - for text only
 * @param {string} [data.contentType='text'] - Content type: 'text' or 'image'
 * @param {string} [data.provider] - Provider: 'groq' | 'gemini' (text) or 'pollination' | 'gemini' (image)
 * @param {Array<string>} [data.fileUrls] - File URLs to analyze (images, PDFs, text files) - for Gemini File API
 * @returns {Promise<{content: string, contentType: string, provider: string, creditsUsed: number, creditsRemaining: number}>}
 */
export const generateContent = async (data) => {
  try {
    const generateContentFunction = httpsCallable(functions, 'generateContent');
    const result = await generateContentFunction(data);

    return {
      content: result.data.content,
      contentType: result.data.contentType || 'text',
      provider: result.data.provider || 'groq',
      creditsUsed: result.data.creditsUsed,
      creditsRemaining: result.data.creditsRemaining
    };
  } catch (error) {
    // Format Firebase Functions errors to user-friendly messages
    throw formatFunctionError(error);
  }
};

/**
 * Create PayOS payment link
 * @param {Object} data - Request data
 * @param {number} data.amount - Amount in VND
 * @param {string} data.planName - Plan name (e.g., 'pro_monthly', 'pro_yearly')
 * @param {string} data.successUrl - URL to redirect after successful payment
 * @param {string} data.cancelUrl - URL to redirect after cancelled payment
 * @returns {Promise<{paymentLinkId: string, checkoutUrl: string, qrCode: string, orderCode: number}>}
 */
export const createPaymentLink = async (data) => {
  try {
    const createPaymentLinkFunction = httpsCallable(functions, 'createPaymentLink');
    const result = await createPaymentLinkFunction(data);

    return {
      paymentLinkId: result.data.paymentLinkId,
      checkoutUrl: result.data.checkoutUrl,
      qrCode: result.data.qrCode,
      orderCode: result.data.orderCode,
    };
  } catch (error) {
    throw formatFunctionError(error);
  }
};

/**
 * Save a project to Firestore
 * @param {Object} data - Project data
 * @param {string} data.title - Project title
 * @param {string} data.type - Project type: 'blog' | 'caption' | 'email' | 'product' | 'image'
 * @param {Object} data.content - Project content
 * @param {string} [data.content.text] - Text content
 * @param {string} [data.content.imageUrl] - Image URL
 * @param {Array<string>} [data.content.images] - Array of image URLs
 * @param {Object} [data.metadata] - Project metadata
 * @returns {Promise<{success: boolean, projectId: string, project: Object}>}
 */
export const saveProject = async (data) => {
  try {
    const saveProjectFunction = httpsCallable(functions, 'saveProject');
    const result = await saveProjectFunction(data);

    return {
      success: result.data.success,
      projectId: result.data.projectId,
      project: result.data.project
    };
  } catch (error) {
    throw formatFunctionError(error);
  }
};

/**
 * Get all projects for the current user
 * @returns {Promise<{success: boolean, projects: Array, count: number}>}
 */
export const getProjects = async () => {
  try {
    const getProjectsFunction = httpsCallable(functions, 'getProjects');
    const result = await getProjectsFunction({});

    return {
      success: result.data.success,
      projects: result.data.projects || [],
      count: result.data.count || 0
    };
  } catch (error) {
    throw formatFunctionError(error);
  }
};

/**
 * Get a single project by ID (for opening full chat history)
 * @param {string} projectId
 * @returns {Promise<{success: boolean, project: Object|null}>}
 */
export const getProject = async (projectId) => {
  try {
    const getProjectFunction = httpsCallable(functions, 'getProject');
    const result = await getProjectFunction({ projectId });
    return {
      success: result.data.success,
      project: result.data.project ?? null
    };
  } catch (error) {
    throw formatFunctionError(error);
  }
};

/**
 * Delete a project
 * @param {string} projectId - Project ID to delete
 * @returns {Promise<{success: boolean, message: string}>}
 */
export const deleteProject = async (projectId) => {
  try {
    const deleteProjectFunction = httpsCallable(functions, 'deleteProject');
    const result = await deleteProjectFunction({ projectId });

    return {
      success: result.data.success,
      message: result.data.message
    };
  } catch (error) {
    throw formatFunctionError(error);
  }
};

/**
 * Format Firebase Functions errors to user-friendly messages
 */
const formatFunctionError = (error) => {
  // Firebase Functions errors have code in error.code
  const errorCode = error.code;
  const errorDetails = error.details;

  const errorMessages = {
    'unauthenticated': 'Bạn cần đăng nhập để sử dụng tính năng này.',
    'permission-denied': 'Bạn không có quyền thực hiện thao tác này.',
    'not-found': 'Không tìm thấy tài nguyên.',
    'already-exists': 'Tài nguyên đã tồn tại.',
    'failed-precondition': errorDetails || 'Điều kiện không đáp ứng. Vui lòng kiểm tra lại.',
    'aborted': 'Thao tác bị hủy.',
    'out-of-range': 'Giá trị nằm ngoài phạm vi cho phép.',
    'unimplemented': 'Tính năng chưa được triển khai.',
    'internal': errorDetails || 'Lỗi server. Vui lòng thử lại sau.',
    'unavailable': 'Dịch vụ tạm thời không khả dụng. Vui lòng thử lại sau.',
    'data-loss': 'Dữ liệu bị mất.',
    'deadline-exceeded': 'Yêu cầu hết hạn. Vui lòng thử lại.',
    'resource-exhausted': errorDetails || 'Đã đạt giới hạn. Vui lòng thử lại sau.',
    'invalid-argument': errorDetails || 'Dữ liệu đầu vào không hợp lệ.',
  };

  // Check for specific Firebase Functions error codes
  if (errorCode && errorMessages[errorCode]) {
    return {
      code: errorCode,
      message: errorMessages[errorCode],
      originalError: error
    };
  }

  // Check for specific error messages
  const errorMessage = error.message || '';

  if (errorMessage.includes('Insufficient credits')) {
    return {
      code: 'insufficient-credits',
      message: 'Số dư credits không đủ. Vui lòng nạp thêm hoặc nâng cấp gói.',
      originalError: error
    };
  }

  if (errorMessage.includes('Rate limit')) {
    return {
      code: 'rate-limit',
      message: 'Bạn đã gửi quá nhiều yêu cầu. Vui lòng đợi một chút rồi thử lại.',
      originalError: error
    };
  }

  // Default error
  return {
    code: errorCode || 'unknown',
    message: errorDetails || errorMessage || 'Có lỗi xảy ra. Vui lòng thử lại.',
    originalError: error
  };
};

/**
 * Check if error is a specific type
 */
export const isErrorType = (error, type) => {
  return error?.code === type || error?.code === `functions/${type}`;
};

/**
 * Common error types
 */
export const ErrorTypes = {
  UNAUTHENTICATED: 'unauthenticated',
  PERMISSION_DENIED: 'permission-denied',
  INSUFFICIENT_CREDITS: 'insufficient-credits',
  RATE_LIMIT: 'rate-limit',
  NOT_FOUND: 'not-found',
  INTERNAL: 'internal',
  FAILED_PRECONDITION: 'failed-precondition',
  INVALID_ARGUMENT: 'invalid-argument',
};

/**
 * Save a template to Firestore (Client-side)
 */
export const saveTemplate = async (data) => {
  try {
    const { collection, addDoc, serverTimestamp } = await import('firebase/firestore');
    const { db } = await import('../config/firebase');

    const templateData = {
      ...data,
      likes: 0,
      usageCount: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    const docRef = await addDoc(collection(db, 'templates'), templateData);
    return docRef.id;
  } catch (error) {
    console.error('Error saving template:', error);
    throw { code: 'internal', message: 'Không thể lưu mẫu. Vui lòng thử lại.' };
  }
};

/**
 * Upload a file to Firebase Storage
 * @param {Object} data - File data
 * @param {string} data.fileName - File name
 * @param {string} data.fileType - MIME type
 * @param {number} data.fileSize - File size in bytes
 * @param {string} data.fileData - Base64 encoded file data
 * @param {Object} [data.metadata] - Optional metadata
 * @returns {Promise<{success: boolean, fileId: string, fileUrl: string}>}
 */
export const uploadFile = async (data) => {
  try {
    const uploadFileFunction = httpsCallable(functions, 'uploadFile');
    const result = await uploadFileFunction(data);
    return {
      success: result.data.success,
      fileId: result.data.fileId,
      fileUrl: result.data.fileUrl,
      fileName: result.data.fileName,
      fileType: result.data.fileType,
      fileSize: result.data.fileSize
    };
  } catch (error) {
    throw formatFunctionError(error);
  }
};

/**
 * Get all uploads for the current user
 * @returns {Promise<{success: boolean, uploads: Array, count: number}>}
 */
export const getUploads = async () => {
  try {
    const getUploadsFunction = httpsCallable(functions, 'getUploads');
    const result = await getUploadsFunction({});
    return {
      success: result.data.success,
      uploads: result.data.uploads || [],
      count: result.data.count || 0
    };
  } catch (error) {
    throw formatFunctionError(error);
  }
};

/**
 * Delete an upload
 * @param {string} uploadId - Upload ID to delete
 * @returns {Promise<{success: boolean, message: string}>}
 */
export const deleteUpload = async (uploadId) => {
  try {
    const deleteUploadFunction = httpsCallable(functions, 'deleteUpload');
    const result = await deleteUploadFunction({ uploadId });
    return {
      success: result.data.success,
      message: result.data.message
    };
  } catch (error) {
    throw formatFunctionError(error);
  }
};

/**
 * Get templates (Client-side)
 */
export const getTemplates = async ({ userId, isPublic, category } = {}) => {
  try {
    const { collection, query, where, orderBy, getDocs } = await import('firebase/firestore');
    const { db } = await import('../config/firebase');

    let q = collection(db, 'templates');
    const constraints = [];

    if (userId) {
      constraints.push(where('authorId', '==', userId));
    } else if (isPublic) {
      constraints.push(where('isPublic', '==', true));
    }

    if (category && category !== 'all') {
      constraints.push(where('category', '==', category));
    }

    // Sort by newest
    // Note: Firestore requires composite index for query with equality filter + sort by different field
    // If index missing, it will throw error with link to create index.
    // For now, let's keep it simple or handle index error.
    try {
      constraints.push(orderBy('createdAt', 'desc'));
    } catch (e) {
      // Fallback if no index
    }

    const qFinal = query(q, ...constraints);
    const snapshot = await getDocs(qFinal);

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toMillis?.() || Date.now()
    }));
  } catch (error) {
    console.error('Error getting templates:', error);
    return [];
  }
};

