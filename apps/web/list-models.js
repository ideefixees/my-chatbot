const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'AIzaSyChcmuaXnaguS1aZh7HKgYF2-5Jx1wrQOY');

async function run() {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        // There isn't a direct listModels on the instance easily used without full client, 
        // but let's try a simple generateContent to see if it works in isolation.
        // Actually, newer SDK might have a different way to list models.
        // Let's just try to generate content and print full error.

        const result = await model.generateContent("Hello");
        console.log("Success:", result.response.text());
    } catch (e) {
        console.error("Error details:", e);

        // Try listing models if possible (not all SDK versions support it easily)
        // attempting via fetch
        try {
            const key = process.env.GEMINI_API_KEY || 'AIzaSyChcmuaXnaguS1aZh7HKgYF2-5Jx1wrQOY';
            const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
            const data = await resp.json();
            console.log("Available Models:", JSON.stringify(data, null, 2));
        } catch (fetchError) {
            console.error("Fetch Error:", fetchError);
        }
    }
}

run();
