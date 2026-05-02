const express = require('express');
const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

// API Anahtarı Kontrolü
if (!process.env.GEMINI_API_KEY) {
    console.error("❌ HATA: .env dosyasında GEMINI_API_KEY bulunamadı!");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.get('/', (req, res) => {
    res.send('AI Yardımcım Sunucusu Aktif! Lütfen /api/chat adresine POST isteği gönderin.');
});

app.post('/api/chat', async (req, res) => {
    try {
        const { message } = req.body;
        console.log(`📩 Gelen Mesaj: ${message}`);

        // NOT: 404 hatasını çözmek için en kararlı model ismini kullanıyoruz.
        // Eğer bu da 404 verirse, sorun kodda değil API'nin Google tarafında kapalı olmasıdır.
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const result = await model.generateContent(message);
        const response = await result.response;
        const text = response.text();

        console.log("✅ Yanıt başarıyla üretildi.");
        res.json({ reply: text });
    } catch (error) {
        console.error('❌ Gemini API Hatası Detayları:');
        console.error('Mesaj:', error.message);

        if (error.message.includes('404') || error.status === 404) {
            return res.status(404).json({
                error: 'Hata (404): Model Bulunamadı.',
                detail: 'Bu hata genellikle Generative Language API\'nin etkinleştirilmemesinden kaynaklanır.',
                action: 'Lütfen şu linke tıklayarak API\'yi ETKİNLEŞTİRİN: https://console.cloud.google.com/apis/library/generativelanguage.googleapis.com?project=743036696023'
            });
        }

        res.status(500).json({ error: 'AI servisi hatası.', details: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`\n🚀 Sunucu http://localhost:${PORT} adresinde çalışıyor.`);
    console.log(`⚠️  DİKKAT: Her kod değişikliğinden sonra sunucuyu kapatıp (Ctrl+C) 'node index.js' ile tekrar açmalısınız.\n`);
});
