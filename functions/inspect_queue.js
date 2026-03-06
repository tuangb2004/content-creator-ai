
const admin = require('firebase-admin');

if (!admin.apps.length) {
    admin.initializeApp();
}

const db = admin.firestore();

async function inspectQueue() {
    console.log('Inspecting recent video queue items...');
    const now = new Date();
    const thirtyMinsAgo = new Date(now.getTime() - 30 * 60 * 1000);

    const snapshot = await db.collection('video_queue')
        .where('createdAt', '>', thirtyMinsAgo)
        .orderBy('createdAt', 'desc')
        .get();

    if (snapshot.empty) {
        console.log('No jobs found in the last 30 minutes.');
        return;
    }

    console.log(`Found ${snapshot.size} recent jobs:`);
    snapshot.forEach(doc => {
        const data = doc.data();
        const createdAt = data.createdAt?.toDate?.() || new Date(data.createdAt?._seconds * 1000);
        console.log(`--- Job ID: ${doc.id} ---`);
        console.log(`Status: ${data.status}`);
        console.log(`Created: ${createdAt.toISOString()}`);
        console.log(`Started: ${data.startedAt ? (data.startedAt.toDate?.() || new Date(data.startedAt._seconds * 1000)).toISOString() : 'N/A'}`);
        console.log(`Processed: ${data.processedAt ? (data.processedAt.toDate?.() || new Date(data.processedAt._seconds * 1000)).toISOString() : 'N/A'}`);
        console.log(`Retry Count: ${data.retryCount || 0}`);
        console.log(`Error: ${data.error || 'None'}`);
        console.log(`Model: ${data.request?.model}`);
        console.log('-------------------------');
    });
}

inspectQueue().catch(console.error);
