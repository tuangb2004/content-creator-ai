const admin = require('firebase-admin');

// Initialize with specific project ID
if (!admin.apps.length) {
    admin.initializeApp({
        projectId: 'creator--ai'
    });
}

const db = admin.firestore();

async function checkQueue() {
    try {
        console.log('--- Video Queue Diagnostic ---');
        const snap = await db.collection('video_queue')
            .orderBy('createdAt', 'desc')
            .limit(10)
            .get();

        console.log(`Total items found (last 10): ${snap.size}`);

        snap.forEach(doc => {
            const data = doc.data();
            const created = data.createdAt ? data.createdAt.toDate().toISOString() : 'N/A';
            console.log(`[${doc.id}] Status: ${data.status} | Created: ${created} | User: ${data.userId}`);
            if (data.status === 'processing') {
                const processed = data.processedAt ? data.processedAt.toDate().toISOString() : 'N/A';
                console.log(`  > ProcessedAt: ${processed}`);
            }
            if (data.status === 'failed') {
                console.log(`  > Error: ${data.error}`);
            }
        });

        const processingSnap = await db.collection('video_queue')
            .where('status', '==', 'processing')
            .get();

        console.log(`\nActive processing items: ${processingSnap.size}`);
        processingSnap.forEach(doc => {
            const data = doc.data();
            const processedAt = data.processedAt ? data.processedAt.toDate() : null;
            const now = new Date();
            const diffMin = processedAt ? Math.round((now - processedAt) / 60000) : 'N/A';
            console.log(`ID: ${doc.id} | User: ${data.userId} | Stuck for: ${diffMin} min`);
        });

        process.exit(0);
    } catch (err) {
        console.error('Diagnostic error:', err);
        process.exit(1);
    }
}

checkQueue();
