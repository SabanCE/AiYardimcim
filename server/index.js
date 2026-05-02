const express = require('express');
const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

// API KEY kontrol
if (!process.env.GEMINI_API_KEY) {
    console.error("❌ GEMINI_API_KEY bulunamadı!");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// test route
app.get('/', (req, res) => {
    res.send('AI Yardımcım Sunucusu Aktif!');
});

// model list (debug için)
app.get('/api/models', async (req, res) => {
    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1/models?key=${process.env.GEMINI_API_KEY}`
        );
        const data = await response.json();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// chat endpoint
app.post('/api/chat', async (req, res) => {
    const { message } = req.body;

    if (!message) {
        return res.status(400).json({ error: "Mesaj boş." });
    }

    console.log("📩 Gelen mesaj:", message);

    try {
        // Kullanıcının onayladığı ve çalışan gemini-2.5-flash modelini kullanıyoruz
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash"
        });

        const result = await model.generateContent(message);
        const response = await result.response;
        const text = response.text();

        return res.json({
            reply: text
        });

    } catch (error) {
        console.error("❌ Gemini hata:", error);

        return res.status(500).json({
            error: error.message,
            hint: "API key / billing / model adı kontrol edin"
        });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Sunucu çalışıyor: http://localhost:${PORT}`);
});