
const admin = require('firebase-admin');
const fs = require('fs');

if (!admin.apps.length) {
    admin.initializeApp({
        projectId: 'creator--ai'
    });
}

const db = admin.firestore();

async function inspectQueue() {
    const now = new Date();
    const thirtyMinsAgo = new Date(now.getTime() - 30 * 60 * 1000);

    const snapshot = await db.collection('video_queue')
        .where('createdAt', '>', thirtyMinsAgo)
        .orderBy('createdAt', 'desc')
        .get();

    const results = [];
    snapshot.forEach(doc => {
        const data = doc.data();
        const createdAt = data.createdAt?.toDate?.() || new Date(data.createdAt?._seconds * 1000);
        results.push({
            id: doc.id,
            status: data.status,
            created: createdAt.toISOString(),
            started: data.startedAt ? (data.startedAt.toDate?.() || new Date(data.startedAt._seconds * 1000)).toISOString() : null,
            retryCount: data.retryCount || 0,
            error: data.error || null,
            model: data.request?.model,
            prompt: data.request?.prompt
        });
    });

    fs.writeFileSync('/tmp/queue_inspection.json', JSON.stringify(results, null, 2));
    console.log(`Saved ${results.length} results to /tmp/queue_inspection.json`);
}

inspectQueue().catch(e => {
    fs.writeFileSync('/tmp/queue_inspection_error.txt', e.stack);
    console.error(e);
});
