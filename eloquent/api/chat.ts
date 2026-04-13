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

    if (!apiKey) return res.status(401).json({ error: 'Missing API key' });

    let body = req.body;
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch(e) {}
    }

    const { topic, avatarName, avatarPersonality, level, history, message } = body;

    const ai = new GoogleGenAI({ apiKey });
    const systemInstruction = `You are an AI English conversation partner.
Your name is ${avatarName}. Your personality is ${avatarPersonality}.
The student wants to practice speaking English.
Topic: ${topic}
Student's English Level: ${level}

YOUR BEHAVIOR:
- Speak STRICTLY at the ${level} English level.
- A1: Very short, simple words.
- A2: Simple everyday language.
- B1: Natural everyday discussion.
- B2: More flexible, abstract.
- Be encouraging, patient, and warm.
- Ask ONE question at a time.
- Keep your responses short. Do not overwhelm the student.
- Gently keep the student talking (e.g., "Can you say more?", "Why do you think that?").
- Do not correct every mistake; focus on fluency.
- Never break character.

STARTING THE CONVERSATION:
When the user sends the message "START_CONVERSATION", you must reply by introducing yourself briefly and asking your first question about ${topic}.`;

    const chatHistory = (history || []).map((msg: any) => ({
      role: msg.role,
      parts: [{ text: msg.text }]
    }));

    const chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      history: chatHistory,
      config: {
        systemInstruction,
        temperature: 0.7,
        maxOutputTokens: 150,
      }
    });

    const response = await chat.sendMessage({ message });
    res.status(200).json({ text: response.text });
  } catch (error: any) {
    console.error('Chat API Error:', error);
    res.status(500).json({ error: error.message });
  }
}
