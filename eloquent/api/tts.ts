import { GoogleGenAI, Modality } from '@google/genai';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    let apiKey = process.env.GEMINI_API_KEY;
    
    // Do not allow a client-provided Bearer Gemini API key to override the server key in production.
    if (!apiKey || process.env.NODE_ENV !== 'production') {
       const authHeader = req.headers?.authorization || req.headers?.Authorization;
       if (authHeader && authHeader.startsWith('Bearer ')) {
         const clientKey = authHeader.substring(7).trim();
         if (clientKey) apiKey = clientKey;
       }
    }

    if (!apiKey) return res.status(401).json({ error: 'Missing API key' });

    let body = req.body;
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch(e) {}
    }

    const { text, voiceName, level, avatarName, avatarPersonality } = body;

    const ai = new GoogleGenAI({ apiKey });
    const prompt = `You are ${avatarName}, an English conversation partner with a ${avatarPersonality} personality. 
Speak naturally, fluently, and conversationally with clear pronunciation and a warm, human delivery.
Adjust your speaking pace and clarity for a student at the ${level} English level.

Text to speak:
${text}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-preview-tts',
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    res.status(200).json({ audio: base64Audio });
  } catch (error: any) {
    console.error('TTS API Error:', error);
    res.status(500).json({ error: error.message });
  }
}
