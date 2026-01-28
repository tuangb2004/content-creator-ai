const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const apiKey = process.env.GEMINI_API_KEY;

async function debugModels() {
    console.log('--- Gemini API Debug ---');
    if (!apiKey) {
        console.log('❌ Error: GEMINI_API_KEY is missing in .env');
        return;
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    try {
        console.log('Listing available models...');
        // The SDK version might not have listModels on the GenAI object directly in some versions
        // but we can try to access the underlying API.
        // Actually, let's just try to fetch some information.

        // Attempting to list models via a manual fetch if needed, 
        // but the SDK usually has it.

        const modelsToTest = [
            'gemini-1.5-flash',
            'gemini-1.5-pro',
            'gemini-1.0-pro',
            'gemini-pro'
        ];

        for (const m of modelsToTest) {
            console.log(`Testing [${m}]...`);
            try {
                const model = genAI.getGenerativeModel({ model: m });
                const result = await model.generateContent('ping');
                console.log(`✅ [${m}]: Success!`);
            } catch (e) {
                console.log(`❌ [${m}]: Failed - ${e.message}`);
            }
        }
    } catch (error) {
        console.log('Global Error:', error.message);
    }
}

debugModels();
