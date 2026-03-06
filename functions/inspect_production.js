
const admin = require('firebase-admin');

if (!admin.apps.length) {
    admin.initializeApp({
        projectId: 'creator--ai'
    });
}

const db = admin.firestore();

async function inspectProductionQueue() {
    console.log('--- PRODUCTION QUEUE INSPECTION ---');
    const snapshot = await db.collection('video_queue')
        .where('status', 'in', ['pending', 'processing'])
        .orderBy('createdAt', 'asc')
        .get();

    if (snapshot.empty) {
        console.log('No pending or processing jobs found.');
        return;
    }

    console.log(`Found ${snapshot.size} active jobs:`);
    snapshot.forEach(doc => {
        const data = doc.data();
        const created = data.createdAt?.toDate?.() || (data.createdAt?._seconds ? new Date(data.createdAt._seconds * 1000) : 'Unknown');
        console.log(`[${doc.id}] Status: ${data.status}, Created: ${created instanceof Date ? created.toISOString() : created}, User: ${data.userId}`);
        if (data.error) console.log(`  !! Error: ${data.error}`);
        if (data.retryCount) console.log(`  Retry Count: ${data.retryCount}`);
    });
    console.log('-----------------------------------');
}

inspectProductionQueue().catch(console.error);
