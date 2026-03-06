import { initializeApp } from "firebase/app";
import { getFunctions, httpsCallable } from "firebase/functions";
import fs from "fs";

// Load config from process.env or just hardcode if we know the config
// We can parse the frontend firebase config
const firebaseConfigStr = fs.readFileSync("src/config/firebase.js", "utf8");
// We can't easily parse JS config with regex perfectly, let me try a different approach.

console.log("File loaded");
