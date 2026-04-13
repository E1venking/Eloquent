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

const getAuthHeaders = (): Record<string, string> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  const apiKey = getStoredApiKey();
  if (apiKey) {
    headers['Authorization'] = `Bearer ${apiKey}`;
  }
  return headers;
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
    const response = await fetch('/api/validate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey.trim()}`
      }
    });
    if (!response.ok) return false;
    const data = await response.json();
    return !!data.valid;
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
  const history: { role: string, text: string }[] = [];

  return {
    sendMessage: async ({ message }: { message: string }) => {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          topic,
          avatarName,
          avatarPersonality,
          level,
          history,
          message
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      history.push({ role: 'user', text: message });
      history.push({ role: 'model', text: data.text });

      return { text: data.text };
    }
  };
};

export const generateSpeech = async (
  text: string, 
  voiceName: string,
  level: string = 'B1',
  avatarName: string = 'Assistant',
  avatarPersonality: string = 'helpful'
): Promise<string | null> => {
  try {
    const response = await fetch('/api/tts', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        text,
        voiceName,
        level,
        avatarName,
        avatarPersonality
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.audio || null;
  } catch (error) {
    console.error('Error generating speech:', error);
    return null;
  }
};
