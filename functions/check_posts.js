const admin = require("firebase-admin");

// Initialize without credentials will use default application credentials 
// or emulator if FIRESTORE_EMULATOR_HOST is set
const db = admin.initializeApp({
    projectId: "demo-project" // Will be overridden if connecting to prod, or use emulator
}).firestore();

async function getPosts() {
    try {
        const snapshot = await db.collection("posts").orderBy("createdAt", "desc").limit(5).get();
        snapshot.forEach(doc => {
            const data = doc.data();
            console.log("Post ID:", doc.id);
            console.log("Title:", data.title);
            console.log("Type:", data.type);
            console.log("mediaUrl:", data.mediaUrl);
            console.log("thumbnailUrl:", data.thumbnailUrl);
            console.log("---");
        });
    } catch (e) {
        console.error("Error:", e);
    }
}

getPosts();
