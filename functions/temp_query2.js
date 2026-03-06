const admin = require("firebase-admin");
const fs = require("fs");

try {
    admin.initializeApp();
} catch (e) {
    console.error("Failed to init app", e);
}

const db = admin.firestore();

async function run() {
    try {
        const snap = await db.collection("posts").orderBy("createdAt", "desc").limit(10).get();
        let out = "";
        snap.forEach(doc => {
            const data = doc.data();
            out += `ID: ${doc.id}\nTitle: ${data.title}\nType: ${data.type}\nmediaUrl: ${data.mediaUrl}\nthumbnailUrl: ${data.thumbnailUrl}\n\n`;
        });
        fs.writeFileSync("temp_output4.txt", out);
        console.log("Done");
    } catch (e) {
        fs.writeFileSync("temp_output4.txt", e.toString());
    }
}
run();
