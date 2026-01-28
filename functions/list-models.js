const axios = require('axios');
require('dotenv').config();

const apiKey = process.env.GEMINI_API_KEY;

async function listModels() {
    console.log('--- Listing Models via API ---');
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

    try {
        const response = await axios.get(url);
        const models = response.data.models;
        console.log(`Found ${models.length} models:`);
        models.forEach(m => {
            console.log(`- ${m.name} (${m.displayName})`);
        });
    } catch (error) {
        if (error.response) {
            console.log(`❌ Error ${error.response.status}: ${JSON.stringify(error.response.data)}`);
        } else {
            console.log(`❌ Error: ${error.message}`);
        }
    }
}

listModels();
