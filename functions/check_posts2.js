const admin = require("firebase-admin");
const fs = require("fs");
admin.initializeApp({ projectId: "demo-project" });
const db = admin.firestore();

async function run() {
    try {
        const snap = await db.collection("posts").orderBy("createdAt", "desc").limit(10).get();
        let out = "";
        snap.forEach(doc => {
            const data = doc.data();
            out += `ID: ${doc.id}\nTitle: ${data.title}\nmediaUrl: ${data.mediaUrl}\nthumbnailUrl: ${data.thumbnailUrl}\n\n`;
        });
        fs.writeFileSync("temp_output2.txt", out);
        console.log("Done");
    } catch (e) {
        fs.writeFileSync("temp_output2.txt", e.toString());
    }
}
run();
