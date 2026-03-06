const admin = require('firebase-admin');

// Initialize Firebase Admin for Emulator or Production
process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8081'; // From firebase.json

admin.initializeApp({
    projectId: 'creator--ai'
});

const db = admin.firestore();

async function listLikers() {
    console.log('--- 🔍 Investigating Likes for "girl" ---');

    const postsSnap = await db.collection('posts').where('title', '==', 'girl').get();

    if (postsSnap.empty) {
        console.log('❌ No post found with title "girl"');
        // Also check for case-insensitive or partial match
        const allPosts = await db.collection('posts').limit(10).get();
        console.log('Last 10 posts in DB:');
        allPosts.forEach(doc => console.log(`- ${doc.id}: "${doc.data().title}"`));
        return;
    }

    for (const postDoc of postsSnap.docs) {
        const postId = postDoc.id;
        const data = postDoc.data();
        console.log(`Post ID: ${postId} | Title: ${data.title} | Current Likes (field): ${data.likes}`);

        const likesSnap = await db.collection('postLikes').where('postId', '==', postId).get();
        console.log(`Total Likes Documents: ${likesSnap.size}`);

        likesSnap.forEach(doc => {
            const likeData = doc.data();
            console.log(`- Liker UID: ${likeData.userId} | Doc ID: ${doc.id}`);
        });
    }
}

listLikers().catch(console.error);
