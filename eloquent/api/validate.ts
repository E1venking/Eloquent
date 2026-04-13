import { GoogleGenAI } from '@google/genai';

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

    if (!apiKey) {
      return res.status(401).json({ error: 'Missing API key' });
    }

    const ai = new GoogleGenAI({ apiKey });
    await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: 'Reply with the word OK only.',
    });
    res.status(200).json({ valid: true });
  } catch (error: any) {
    res.status(401).json({ error: error.message });
  }
}
