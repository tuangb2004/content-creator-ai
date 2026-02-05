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
export const getTemplates = async ({ userId, isPublic, category, limit } = {}) => {
  try {
    const { collection, query, where, orderBy, getDocs, limit: firestoreLimit } = await import('firebase/firestore');
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
    // We already deployed indexes for this.
    try {
      constraints.push(orderBy('createdAt', 'desc'));
    } catch (e) {
      // Fallback if no index
    }

    if (limit) {
      constraints.push(firestoreLimit(Math.min(limit, 50)));
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

// ============================================================================
// COMMUNITY POSTS
// ============================================================================

/**
 * Create a new post in the community
 * @param {Object} data - Post data
 * @param {string} data.type - 'image' | 'video' | 'text'
 * @param {string} data.mediaUrl - URL of the media
 * @param {string} data.prompt - The prompt used to generate
 * @param {string} data.title - Post title
 * @param {string} [data.description] - Optional description
 * @param {string} [data.model] - Model used
 * @param {string} [data.category] - Category
 * @param {Array<string>} [data.tags] - Tags
 * @returns {Promise<{success: boolean, postId: string}>}
 */
export const createPost = async (data) => {
  try {
    const createPostFunction = httpsCallable(functions, 'createPost');
    const result = await createPostFunction(data);
    return {
      success: result.data.success,
      postId: result.data.postId,
      message: result.data.message,
    };
  } catch (error) {
    throw formatFunctionError(error);
  }
};

/**
 * Get posts from community feed
 * @param {Object} [options] - Filter options
 * @param {string} [options.type] - 'image' | 'video' | 'text'
 * @param {string} [options.category] - Category filter
 * @param {string} [options.authorId] - Get posts by specific user
 * @param {boolean} [options.savedByMe] - Get user's saved posts
 * @param {boolean} [options.likedByMe] - Get user's liked posts
 * @param {number} [options.limit] - Max posts to return
 * @param {string} [options.startAfter] - Post ID for pagination
 * @returns {Promise<{success: boolean, posts: Array, count: number, hasMore: boolean}>}
 */
export const getPosts = async (options = {}) => {
  try {
    const getPostsFunction = httpsCallable(functions, 'getPosts');
    const result = await getPostsFunction(options);
    return {
      success: result.data.success,
      posts: result.data.posts || [],
      count: result.data.count || 0,
      hasMore: result.data.hasMore || false,
    };
  } catch (error) {
    throw formatFunctionError(error);
  }
};

/**
 * Get a single post by ID
 * @param {string} postId - Post ID
 * @returns {Promise<{success: boolean, post: Object}>}
 */
export const getPost = async (postId) => {
  try {
    const getPostFunction = httpsCallable(functions, 'getPost');
    const result = await getPostFunction({ postId });
    return {
      success: result.data.success,
      post: result.data.post,
    };
  } catch (error) {
    throw formatFunctionError(error);
  }
};

/**
 * Like or unlike a post (toggle)
 * @param {string} postId - Post ID
 * @returns {Promise<{success: boolean, liked: boolean}>}
 */
export const likePost = async (postId) => {
  try {
    const likePostFunction = httpsCallable(functions, 'likePost');
    const result = await likePostFunction({ postId });
    return {
      success: result.data.success,
      liked: result.data.liked,
      message: result.data.message,
    };
  } catch (error) {
    throw formatFunctionError(error);
  }
};

/**
 * Save or unsave a post to favorites (toggle)
 * @param {string} postId - Post ID
 * @returns {Promise<{success: boolean, saved: boolean}>}
 */
export const savePostToFavorites = async (postId) => {
  try {
    const savePostFunction = httpsCallable(functions, 'savePost');
    const result = await savePostFunction({ postId });
    return {
      success: result.data.success,
      saved: result.data.saved,
      message: result.data.message,
    };
  } catch (error) {
    throw formatFunctionError(error);
  }
};

/**
 * Delete a post (owner only)
 * @param {string} postId - Post ID
 * @returns {Promise<{success: boolean, message: string}>}
 */
export const deletePostById = async (postId) => {
  try {
    const deletePostFunction = httpsCallable(functions, 'deletePost');
    const result = await deletePostFunction({ postId });
    return {
      success: result.data.success,
      message: result.data.message,
    };
  } catch (error) {
    throw formatFunctionError(error);
  }
};

/**
 * Increment post usage count (when prompt is copied)
 * @param {string} postId - Post ID
 * @returns {Promise<{success: boolean}>}
 */
export const incrementPostUsage = async (postId) => {
  try {
    const incrementFunction = httpsCallable(functions, 'incrementPostUsage');
    const result = await incrementFunction({ postId });
    return { success: result.data.success };
  } catch (error) {
    throw formatFunctionError(error);
  }
};

/**
 * Get top creators for the week
 * @param {number} [limit] - Max creators to return
 * @returns {Promise<{success: boolean, creators: Array}>}
 */
export const getTopCreators = async (limit = 10) => {
  try {
    const getTopCreatorsFunction = httpsCallable(functions, 'getTopCreators');
    const result = await getTopCreatorsFunction({ limit });
    return {
      success: result.data.success,
      creators: result.data.creators || [],
    };
  } catch (error) {
    throw formatFunctionError(error);
  }
};

// ============================================================================
// COMMENTS
// ============================================================================

/**
 * Add a comment to a post
 * @param {string} postId - Post ID
 * @param {string} content - Comment content
 * @param {string} [parentId] - Parent comment ID for replies
 * @returns {Promise<{success: boolean, commentId: string, comment: Object}>}
 */
export const addComment = async (postId, content, parentId) => {
  try {
    const addCommentFunction = httpsCallable(functions, 'addComment');
    const result = await addCommentFunction({ postId, content, parentId });
    return {
      success: result.data.success,
      commentId: result.data.commentId,
      comment: result.data.comment,
    };
  } catch (error) {
    throw formatFunctionError(error);
  }
};

/**
 * Get comments for a post
 * @param {string} postId - Post ID
 * @param {number} [limit] - Max comments to return
 * @returns {Promise<{success: boolean, comments: Array, count: number}>}
 */
export const getComments = async (postId, limit = 50) => {
  try {
    const getCommentsFunction = httpsCallable(functions, 'getComments');
    const result = await getCommentsFunction({ postId, limit });
    return {
      success: result.data.success,
      comments: result.data.comments || [],
      count: result.data.count || 0,
    };
  } catch (error) {
    throw formatFunctionError(error);
  }
};

/**
 * Like or unlike a comment (toggle)
 * @param {string} commentId - Comment ID
 * @param {string} postId - Post ID
 * @returns {Promise<{success: boolean, liked: boolean}>}
 */
export const likeCommentById = async (commentId, postId) => {
  try {
    const likeCommentFunction = httpsCallable(functions, 'likeComment');
    const result = await likeCommentFunction({ commentId, postId });
    return {
      success: result.data.success,
      liked: result.data.liked,
    };
  } catch (error) {
    throw formatFunctionError(error);
  }
};

/**
 * Delete a comment (owner only)
 * @param {string} commentId - Comment ID
 * @param {string} postId - Post ID
 * @returns {Promise<{success: boolean, message: string}>}
 */
export const deleteCommentById = async (commentId, postId) => {
  try {
    const deleteCommentFunction = httpsCallable(functions, 'deleteComment');
    const result = await deleteCommentFunction({ commentId, postId });
    return {
      success: result.data.success,
      message: result.data.message,
    };
  } catch (error) {
    throw formatFunctionError(error);
  }
};

// ============================================================================
// USER PROFILES
// ============================================================================

/**
 * Get user profile
 * @param {string} userId - User ID
 * @returns {Promise<{success: boolean, profile: Object}>}
 */
export const getUserProfile = async (userId) => {
  try {
    const getUserProfileFunction = httpsCallable(functions, 'getUserProfile');
    const result = await getUserProfileFunction({ userId });
    return {
      success: result.data.success,
      profile: result.data.profile,
    };
  } catch (error) {
    throw formatFunctionError(error);
  }
};

/**
 * Update user profile
 * @param {Object} data - Profile data (bio, website, socialLinks)
 * @returns {Promise<{success: boolean, message: string}>}
 */
export const updateUserProfile = async (data) => {
  try {
    const updateUserProfileFunction = httpsCallable(functions, 'updateUserProfile');
    const result = await updateUserProfileFunction(data);
    return {
      success: result.data.success,
      message: result.data.message,
    };
  } catch (error) {
    throw formatFunctionError(error);
  }
};

/**
 * Get posts by user
 * @param {string} userId - User ID
 * @param {number} [limit] - Max posts to return
 * @param {string} [lastPostId] - For pagination
 * @returns {Promise<{success: boolean, posts: Array, hasMore: boolean}>}
 */
export const getUserPosts = async (userId, limit = 20, lastPostId) => {
  try {
    const getUserPostsFunction = httpsCallable(functions, 'getUserPosts');
    const result = await getUserPostsFunction({ userId, limit, lastPostId });
    return {
      success: result.data.success,
      posts: result.data.posts || [],
      hasMore: result.data.hasMore,
      lastPostId: result.data.lastPostId,
    };
  } catch (error) {
    throw formatFunctionError(error);
  }
};

/**
 * Follow or unfollow a user (toggle)
 * @param {string} userId - User ID to follow/unfollow
 * @returns {Promise<{success: boolean, following: boolean}>}
 */
export const followUserById = async (userId) => {
  try {
    const followUserFunction = httpsCallable(functions, 'followUser');
    const result = await followUserFunction({ userId });
    return {
      success: result.data.success,
      following: result.data.following,
    };
  } catch (error) {
    throw formatFunctionError(error);
  }
};

/**
 * Get followers of a user
 * @param {string} userId - User ID
 * @param {number} [limit] - Max followers to return
 * @returns {Promise<{success: boolean, followers: Array, count: number}>}
 */
export const getFollowers = async (userId, limit = 50) => {
  try {
    const getFollowersFunction = httpsCallable(functions, 'getFollowers');
    const result = await getFollowersFunction({ userId, limit });
    return {
      success: result.data.success,
      followers: result.data.followers || [],
      count: result.data.count,
    };
  } catch (error) {
    throw formatFunctionError(error);
  }
};

/**
 * Get users that a user is following
 * @param {string} userId - User ID
 * @param {number} [limit] - Max users to return
 * @returns {Promise<{success: boolean, following: Array, count: number}>}
 */
export const getFollowingList = async (userId, limit = 50) => {
  try {
    const getFollowingFunction = httpsCallable(functions, 'getFollowing');
    const result = await getFollowingFunction({ userId, limit });
    return {
      success: result.data.success,
      following: result.data.following || [],
      count: result.data.count,
    };
  } catch (error) {
    throw formatFunctionError(error);
  }
};

// ============================================================================
// NOTIFICATIONS
// ============================================================================

/**
 * Get user notifications
 * @param {number} [limit] - Max notifications to return
 * @param {boolean} [unreadOnly] - Only return unread notifications
 * @returns {Promise<{success: boolean, notifications: Array, unreadCount: number}>}
 */
export const getNotifications = async (limit = 50, unreadOnly = false) => {
  try {
    const getNotificationsFunction = httpsCallable(functions, 'getNotifications');
    const result = await getNotificationsFunction({ limit, unreadOnly });
    return {
      success: result.data.success,
      notifications: result.data.notifications || [],
      unreadCount: result.data.unreadCount || 0,
    };
  } catch (error) {
    throw formatFunctionError(error);
  }
};

/**
 * Mark a notification as read
 * @param {string} notificationId - Notification ID
 * @returns {Promise<{success: boolean}>}
 */
export const markNotificationAsRead = async (notificationId) => {
  try {
    const markAsReadFunction = httpsCallable(functions, 'markNotificationAsRead');
    const result = await markAsReadFunction({ notificationId });
    return { success: result.data.success };
  } catch (error) {
    throw formatFunctionError(error);
  }
};

/**
 * Mark all notifications as read
 * @returns {Promise<{success: boolean, count: number}>}
 */
export const markAllNotificationsAsRead = async () => {
  try {
    const markAllAsReadFunction = httpsCallable(functions, 'markAllNotificationsAsRead');
    const result = await markAllAsReadFunction({});
    return {
      success: result.data.success,
      count: result.data.count,
    };
  } catch (error) {
    throw formatFunctionError(error);
  }
};

/**
 * Create a notification (used internally from client when needed)
 * @param {Object} data - Notification data
 * @returns {Promise<{success: boolean, notificationId: string}>}
 */
export const createNotification = async (data) => {
  try {
    const createNotificationFunction = httpsCallable(functions, 'createNotification');
    const result = await createNotificationFunction(data);
    return {
      success: result.data.success,
      notificationId: result.data.notificationId,
    };
  } catch (error) {
    throw formatFunctionError(error);
  }
};
