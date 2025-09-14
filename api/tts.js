// Node.js 프록시 서버리스 함수
const { GoogleGenerativeAI } = require('@google/generative-ai');

// 환경 변수에서 API 키를 가져옵니다.
// Vercel 대시보드에서 환경 변수를 설정해야 합니다.
const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

module.exports = async (req, res) => {
    // CORS 문제를 해결하기 위한 헤더 설정
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // preflight 요청 처리
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Only POST requests are allowed.' });
        return;
    }

    if (!apiKey) {
        res.status(500).json({ error: 'GEMINI_API_KEY environment variable is not set.' });
        return;
    }
    
    try {
        const { textToSpeak } = req.body;

        if (!textToSpeak) {
            res.status(400).json({ error: 'Text data is missing.' });
            return;
        }

        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash-preview-tts",
            responseMimeType: "audio/L16;rate=16000",
        });

        const result = await model.generateContent({
            contents: [{ parts: [{ text: textToSpeak }] }],
            generationConfig: {
                responseModality: 'audio',
                speechConfig: {
                    voiceConfig: { prebuiltVoiceConfig: { voiceName: "Zephyr" } }
                }
            }
        });

        const part = result.candidates[0].content.parts[0];
        const audioData = part.inlineData.data;
        const mimeType = part.inlineData.mimeType;
        const sampleRateMatch = mimeType.match(/rate=(\d+)/);
        const sampleRate = sampleRateMatch ? parseInt(sampleRateMatch[1], 10) : 16000;

        res.status(200).json({ audioData, sampleRate });

    } catch (error) {
        console.error('API request failed:', error);
        res.status(500).json({ error: 'Failed to generate speech. Please check your API key and network connection.' });
    }
};
