
const admin = require('firebase-admin');
const { getFunctions } = require('firebase-admin/functions');

if (!admin.apps.length) {
    admin.initializeApp();
}

const db = admin.firestore();

async function fixQueue() {
    console.log('Checking for stuck video jobs...');
    const now = new Date();
    const thirtyMinsAgo = new Date(now.getTime() - 30 * 60 * 1000);

    const snapshot = await db.collection('video_queue')
        .where('status', 'in', ['pending', 'processing'])
        .get();

    console.log(`Found ${snapshot.size} jobs in queue.`);

    for (const doc of snapshot.docs) {
        const data = doc.data();
        const createdAt = data.createdAt?.toDate?.() || new Date(data.createdAt?._seconds * 1000);

        console.log(`Processing Job ${doc.id}: status=${data.status}, created=${createdAt.toISOString()}`);

        // If it's stuck in processing for too long or just pending, we want the new system to pick it up
        // The safest way is to set it to 'pending'
        if (data.status === 'processing' && createdAt < thirtyMinsAgo) {
            console.log(`Resetting stuck job ${doc.id} to pending...`);
            await doc.ref.update({
                status: 'pending',
                error: 'Stuck for too long, reset for retry',
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            });
        }
    }

    console.log('Fix complete. The scheduled maintenance task should pick up pending jobs within 1 minute.');
}

fixQueue().catch(console.error);
