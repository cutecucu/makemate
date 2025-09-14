import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

export const config = {
    runtime: 'edge',
};

export default async function handler(req) {
    if (req.method !== 'POST') {
        return new NextResponse('Method Not Allowed', { status: 405 });
    }

    try {
        const { textToSpeak } = await req.json();

        if (!textToSpeak) {
            return new NextResponse('Text to speak is required', { status: 400 });
        }

        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            console.error("GEMINI_API_KEY is not set in environment variables.");
            return new NextResponse('API key not configured', { status: 500 });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-preview-tts" });

        const result = await model.generateContent({
            contents: [{ parts: [{ text: textToSpeak }] }],
            generationConfig: {
                responseModalities: ["AUDIO"],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: "Kore" }
                    }
                }
            },
        });

        const audioData = result?.candidates?.[0]?.content?.parts?.find(p => p.inlineData)?.inlineData?.data;
        const mimeType = result?.candidates?.[0]?.content?.parts?.find(p => p.inlineData)?.inlineData?.mimeType;

        if (audioData && mimeType) {
            return new NextResponse(JSON.stringify({ audioData, sampleRate: parseInt(mimeType.match(/rate=(\d+)/)[1], 10) }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            });
        } else {
            console.error("Audio data not found in API response.");
            return new NextResponse('Audio data not found', { status: 500 });
        }

    } catch (error) {
        console.error('Error in TTS API handler:', error);
        return new NextResponse(`Internal Server Error: ${error.message}`, { status: 500 });
    }
}
