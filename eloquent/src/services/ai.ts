import { GoogleGenAI, Modality } from '@google/genai';

export const createChatSession = (topic: string, avatarName: string, avatarPersonality: string, level: string) => {
  // Create a new instance right before making the call to ensure it uses the up-to-date key
  const apiKey = localStorage.getItem('CUSTOM_API_KEY') || process.env.API_KEY || process.env.GEMINI_API_KEY;
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

  return ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction,
      temperature: 0.7,
    }
  });
};

export const generateSpeech = async (text: string, voiceName: string): Promise<string | null> => {
  const apiKey = localStorage.getItem('CUSTOM_API_KEY') || process.env.API_KEY || process.env.GEMINI_API_KEY;
  const ai = new GoogleGenAI({ apiKey });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text }] }],
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
    return base64Audio || null;
  } catch (error) {
    console.error("Error generating speech:", error);
    return null;
  }
};
