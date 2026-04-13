import { GoogleGenAI, Modality } from '@google/genai';

const STORAGE_KEY = 'CUSTOM_API_KEY';

export const getStoredApiKey = (): string | null => {
  try {
    const key = localStorage.getItem(STORAGE_KEY)?.trim();
    return key || null;
  } catch (error) {
    console.error('Could not read API key from storage.', error);
    return null;
  }
};

export const hasStoredApiKey = (): boolean => Boolean(getStoredApiKey());

export const saveApiKey = (apiKey: string): void => {
  localStorage.setItem(STORAGE_KEY, apiKey.trim());
};

export const clearApiKey = (): void => {
  localStorage.removeItem(STORAGE_KEY);
};

const getApiKeyOrThrow = (): string => {
  const apiKey = getStoredApiKey();

  if (!apiKey) {
    throw new Error('Missing Gemini API key.');
  }

  return apiKey;
};

export const isAuthenticationError = (error: unknown): boolean => {
  const message = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();

  return (
    message.includes('api key') ||
    message.includes('invalid') ||
    message.includes('unauthorized') ||
    message.includes('permission') ||
    message.includes('forbidden') ||
    message.includes('401') ||
    message.includes('403')
  );
};

export const validateApiKey = async (apiKey: string): Promise<boolean> => {
  try {
    const ai = new GoogleGenAI({ apiKey: apiKey.trim() });

    await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: 'Reply with the word OK only.',
    });

    return true;
  } catch (error) {
    console.error('API key validation failed:', error);
    return false;
  }
};

export const createChatSession = (
  topic: string,
  avatarName: string,
  avatarPersonality: string,
  level: string
) => {
  const ai = new GoogleGenAI({ apiKey: getApiKeyOrThrow() });

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
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction,
      temperature: 0.7,
      maxOutputTokens: 150,
    },
  });
};

export const generateSpeech = async (text: string, voiceName: string): Promise<string | null> => {
  try {
    const ai = new GoogleGenAI({ apiKey: getApiKeyOrThrow() });

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-preview-tts',
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
    console.error('Error generating speech:', error);
    return null;
  }
};
