import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { getUserInteractions, likePost, savePostToFavorites, followUserById } from '../services/firebaseFunctions';
import { useCallback, useRef } from 'react';
import toast from '../utils/toast';

/**
 * Hook to manage user interactions (likes, saves, follows)
 * Provides a single source of truth for interaction state across the app.
 */
export const useInteractions = () => {
    const { user } = useAuth();
    const queryClient = useQueryClient();

    // 1. Fetch all user interactions
    const { data: interactions, isLoading, error: interactionsError } = useQuery({
        queryKey: ['userInteractions', user?.uid],
        queryFn: async () => {
            console.log('[useInteractions] Fetching interactions for user:', user?.uid);
            try {
                const result = await getUserInteractions();
                console.log('[useInteractions] Fetch success:', {
                    liked: result.likedPostIds?.length || 0,
                    saved: result.savedPostIds?.length || 0,
                    following: result.followingUserIds?.length || 0,
                });
                return result;
            } catch (err) {
                console.error('[useInteractions] Fetch failed:', err);
                throw err;
            }
        },
        enabled: !!user,
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: 3,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    });

    // Helpers to check status
    const isLiked = useCallback((postId) => {
        return interactions?.likedPostIds?.includes(postId) || false;
    }, [interactions]);

    const isSaved = useCallback((postId) => {
        return interactions?.savedPostIds?.includes(postId) || false;
    }, [interactions]);

    const isFollowing = useCallback((userId) => {
        return interactions?.followingUserIds?.includes(userId) || false;
    }, [interactions]);

    // 2. Mutations with Optimistic UI updates

    // 3. State Synchronization Trackers
    const processingPosts = useRef(new Set()); // Posts currently being synced to server
    const desiredStates = useRef({}); // Latest intended state for each post

    // Mutation for Likes (Idempotent)
    const likeMutation = useMutation({
        mutationFn: (variables) => {
            // variables = { postId, action: 'like' | 'unlike' }
            return likePost(variables);
        },
        onSuccess: (data, variables) => {
            const { postId } = variables;
            // Update counts with absolute server truth if provided
            if (data.newCount !== undefined) {
                queryClient.setQueriesData({ queryKey: ['posts'] }, (oldData) => {
                    if (!oldData || !oldData.pages) return oldData;
                    return {
                        ...oldData,
                        pages: oldData.pages.map(page => ({
                            ...page,
                            posts: page.posts.map(post =>
                                post.id === postId ? { ...post, likes: data.newCount } : post
                            )
                        }))
                    };
                });
                queryClient.setQueryData(['post', postId], (oldPost) => {
                    if (!oldPost) return oldPost;
                    return { ...oldPost, likes: data.newCount };
                });
            }
        },
        onError: (err, variables) => {
            console.error('[useInteractions] Server Sync Error:', err);
            // We don't rollback immediately because the sync loop will try to fix it 
            // or the user might have clicked again.
        }
    });

    /**
     * Internal function to sync local state to server sequentially
     */
    const syncLikeToServer = useCallback(async (postId) => {
        if (processingPosts.current.has(postId)) return;

        processingPosts.current.add(postId);

        try {
            // Continue syncing as long as latest desired state doesn't match last sent state
            let lastSentState = null;

            while (true) {
                const currentDesired = desiredStates.current[postId];
                if (currentDesired === undefined || currentDesired === lastSentState) break;

                const action = currentDesired ? 'like' : 'unlike';
                const result = await likeMutation.mutateAsync({ postId, action });

                // Track what we last successfully told the server
                lastSentState = result.liked;

                // Small yield to let UI thread breathe if user is going crazy
                await new Promise(resolve => setTimeout(resolve, 50));
            }
        } catch (err) {
            // If it fails, let the loop end. The next click will restart it.
        } finally {
            processingPosts.current.delete(postId);
        }
    }, [likeMutation]);

    const toggleLike = useCallback((postId) => {
        if (!user) {
            toast.error('Vui lòng đăng nhập để thích bài viết');
            return;
        }

        // 1. INSTANT UI UPDATE (Optimistic)
        const currentInteractions = queryClient.getQueryData(['userInteractions', user?.uid]);
        const wasLiked = currentInteractions?.likedPostIds?.includes(postId) || false;
        const targetLiked = !wasLiked;

        // Record the new desired state for the sync loop
        desiredStates.current[postId] = targetLiked;

        // Update Interactions Cache
        queryClient.setQueryData(['userInteractions', user?.uid], (old) => {
            const current = old || { likedPostIds: [], savedPostIds: [], followingUserIds: [] };
            const likedPostIds = [...(current.likedPostIds || [])];
            const index = likedPostIds.indexOf(postId);

            if (targetLiked && index === -1) likedPostIds.push(postId);
            else if (!targetLiked && index > -1) likedPostIds.splice(index, 1);

            return { ...current, likedPostIds };
        });

        // Update counts in feeds instantly
        queryClient.setQueriesData({ queryKey: ['posts'] }, (oldData) => {
            if (!oldData || !oldData.pages) return oldData;
            return {
                ...oldData,
                pages: oldData.pages.map(page => ({
                    ...page,
                    posts: page.posts.map(p =>
                        p.id === postId ? { ...p, likes: Math.max(0, (p.likes || 0) + (targetLiked ? 1 : -1)) } : p
                    )
                }))
            };
        });

        // Update individual post cache instantly
        queryClient.setQueryData(['post', postId], (oldPost) => {
            if (!oldPost) return oldPost;
            return { ...oldPost, likes: Math.max(0, (oldPost.likes || 0) + (targetLiked ? 1 : -1)) };
        });

        // 2. TRIGGER SEQUENTIAL SYNC (Real-time Background)
        syncLikeToServer(postId);

    }, [queryClient, user, syncLikeToServer]);

    // Save Mutation (Keeping standard optimistic for now as saves are usually less spammy)
    const saveMutation = useMutation({
        mutationFn: savePostToFavorites,
        onMutate: async (postId) => {
            const previousInteractions = queryClient.getQueryData(['userInteractions', user?.uid]);
            const wasSaved = previousInteractions?.savedPostIds?.includes(postId);

            // 1. Update UI caches instantly
            queryClient.setQueryData(['userInteractions', user?.uid], (old) => {
                const current = old || { likedPostIds: [], savedPostIds: [], followingUserIds: [] };
                const savedPostIds = [...(current.savedPostIds || [])];
                const index = savedPostIds.indexOf(postId);
                if (index > -1) savedPostIds.splice(index, 1);
                else savedPostIds.push(postId);
                return { ...current, savedPostIds };
            });

            queryClient.setQueriesData({ queryKey: ['posts'] }, (oldData) => {
                if (!oldData || !oldData.pages) return oldData;
                return {
                    ...oldData,
                    pages: oldData.pages.map(page => ({
                        ...page,
                        posts: page.posts.map(p =>
                            p.id === postId ? { ...p, saves: Math.max(0, (p.saves || 0) + (wasSaved ? -1 : 1)) } : p
                        )
                    }))
                };
            });

            queryClient.setQueryData(['post', postId], (oldPost) => {
                if (!oldPost) return oldPost;
                return { ...oldPost, saves: Math.max(0, (oldPost.saves || 0) + (wasSaved ? -1 : 1)) };
            });

            // 2. Cancel queries in background/await
            await Promise.all([
                queryClient.cancelQueries({ queryKey: ['userInteractions', user?.uid] }),
                queryClient.cancelQueries({ queryKey: ['posts'] }),
                queryClient.cancelQueries({ queryKey: ['post', postId] })
            ]);

            return { previousInteractions };
        },
        onError: (err, postId, context) => {
            if (context?.previousInteractions) {
                queryClient.setQueryData(['userInteractions', user?.uid], context.previousInteractions);
            }
            queryClient.invalidateQueries({ queryKey: ['posts'] });
            queryClient.invalidateQueries({ queryKey: ['post', postId] });
            toast.error('Không thể thực hiện thao tác. Vui lòng thử lại.');
        },
        onSuccess: (data, postId) => {
            // Sync exact saved state from server
            queryClient.setQueryData(['userInteractions', user?.uid], (old) => {
                if (!old) return old;
                const savedPostIds = [...(old.savedPostIds || [])];
                const index = savedPostIds.indexOf(postId);
                if (data.saved && index === -1) {
                    savedPostIds.push(postId);
                } else if (!data.saved && index > -1) {
                    savedPostIds.splice(index, 1);
                }
                return { ...old, savedPostIds };
            });

            if (data.newCount !== undefined) {
                queryClient.setQueriesData({ queryKey: ['posts'] }, (oldData) => {
                    if (!oldData || !oldData.pages) return oldData;
                    return {
                        ...oldData,
                        pages: oldData.pages.map(page => ({
                            ...page,
                            posts: page.posts.map(post =>
                                post.id === postId ? { ...post, saves: data.newCount } : post
                            )
                        }))
                    };
                });
                queryClient.setQueryData(['post', postId], (oldPost) => {
                    if (!oldPost) return oldPost;
                    return { ...oldPost, saves: data.newCount };
                });
            }
        }
    });

    // Follow Mutation
    const followMutation = useMutation({
        mutationFn: followUserById,
        onMutate: async (targetUserId) => {
            await queryClient.cancelQueries({ queryKey: ['userInteractions', user?.uid] });
            const previousInteractions = queryClient.getQueryData(['userInteractions', user?.uid]);

            queryClient.setQueryData(['userInteractions', user?.uid], (old) => {
                if (!old) return old;
                const followingUserIds = [...(old.followingUserIds || [])];
                const index = followingUserIds.indexOf(targetUserId);

                if (index > -1) {
                    followingUserIds.splice(index, 1);
                } else {
                    followingUserIds.push(targetUserId);
                }

                return { ...old, followingUserIds };
            });

            return { previousInteractions };
        },
        onError: (err, targetUserId, context) => {
            if (context?.previousInteractions) {
                queryClient.setQueryData(['userInteractions', user?.uid], context.previousInteractions);
            }
            toast.error('Không thể thực hiện yêu cầu theo dõi. Vui lòng thử lại.');
        }
    });

    return {
        interactions,
        isLoading,
        isLiked,
        isSaved,
        isFollowing,
        toggleLike,
        toggleSave: (postId) => saveMutation.mutate(postId),
        toggleFollow: (userId) => followMutation.mutate(userId),
        // Status indicators for loading UI if needed
        isLiking: likeMutation.isPending,
        isSaving: saveMutation.isPending,
        isFollowingUser: followMutation.isPending,
    };
};
