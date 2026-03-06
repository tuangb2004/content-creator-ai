const admin = require('firebase-admin');

if (!admin.apps.length) {
    try {
        const serviceAccount = require("./serviceAccountKey.json");
        admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
    } catch (e) {
        // Fallback to demo-project or creator--ai based on what works
        admin.initializeApp({ projectId: 'content-creator-ai-01' });
        // if the project is content-creator-ai-01 or creator--ai, it might work without auth locally if emulators are used
    }
}

async function run() {
    const db = admin.firestore();
    try {
        const vq = await db.collection('video_queue').orderBy('createdAt', 'desc').limit(5).get();
        console.log("=== VIDEO QUEUE ===");
        vq.forEach((doc, idx) => {
            const d = doc.data();
            console.log(`[Item ${idx + 1}]`);
            console.log(`id: ${doc.id}`);
            console.log(`status: ${d.status}`);
            console.log(`veoOperationName: ${d.veoOperationName ? 'có' : 'không'}`);
            console.log(`videoUrl: ${d.result?.videoUrl ? 'có' : 'không'}`);
            console.log(`createdAt: ${d.createdAt ? d.createdAt.toDate() : 'N/A'}`);
            console.log(`userID: ${d.userId}`);
            console.log(`---`);
        });

        console.log("=== PROJECTS ===");
        const p = await db.collection('projects').orderBy('createdAt', 'desc').limit(2).get();
        p.forEach((doc, idx) => {
            const d = doc.data();
            console.log(`[Proj ${idx + 1}]`);
            console.log(`id: ${doc.id}`);
            console.log(`status: ${d.status}`);
            console.log(`videoUrl: ${d.content?.videoUrl ? 'có' : 'không'}`);
            console.log(`---`);
        });
    } catch (e) {
        console.error("Query Error: ", e);
    }
}
run().then(() => process.exit(0)).catch(e => { console.error("Error", e); process.exit(1) });
