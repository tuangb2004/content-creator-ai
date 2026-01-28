const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

async function listModels() {
    try {
        console.log('Fetching models with apiVersion v1beta...');
        const genAI_beta = new GoogleGenerativeAI(apiKey); // Default
        // Note: older SDK version might not have listModels easily, 
        // but we can try to generate content with a common model to test.

        const models = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-pro', 'gemini-1.0-pro'];

        for (const m of models) {
            try {
                const model = genAI.getGenerativeModel({ model: m });
                const result = await model.generateContent('hi');
                console.log(`✅ Model ${m} is working.`);
            } catch (e) {
                console.log(`❌ Model ${m} failed: ${e.message}`);
            }
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

listModels();
