import { useState, useEffect, useCallback, useRef } from 'react';
import { generateSpeech } from '../services/ai';

// Helper to convert base64 string to Uint8Array
function base64ToUint8Array(base64: string): Uint8Array {
  const cleanBase64 = base64.replace(/^data:audio\/[a-z]+;base64,/, '').trim();
  const binaryString = atob(cleanBase64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// Helper to wrap raw PCM data into a valid WAV file Blob
function pcmToWav(pcmData: Uint8Array, sampleRate: number = 24000): Blob {
  const numChannels = 1;
  const bitsPerSample = 16;
  const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
  const blockAlign = numChannels * (bitsPerSample / 8);
  const dataSize = pcmData.length;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  const writeString = (offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
  view.setUint16(20, 1, true); // AudioFormat (1 for PCM)
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitsPerSample, true);
  writeString(36, 'data');
  view.setUint32(40, dataSize, true);

  const pcmBytes = new Uint8Array(buffer, 44);
  pcmBytes.set(pcmData);

  return new Blob([buffer], { type: 'audio/wav' });
}

export function useSpeech(onResult: (text: string) => void) {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  const recognitionRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentAudioUrlRef = useRef<string | null>(null);
  const fallbackUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const requestIdRef = useRef<number>(0);
  const cacheRef = useRef<Map<string, string>>(new Map());

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = 'en-US';

        recognitionRef.current.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          onResult(transcript);
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current.onerror = (event: any) => {
          if (event.error !== 'no-speech') {
            console.error('Speech recognition error', event.error);
          }
          setIsListening(false);
        };
      }
    }
  }, [onResult]);

  const startListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (e) {
        console.error(e);
      }
    } else {
      alert('Speech recognition is not supported in this browser.');
    }
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, []);

  const stopSpeaking = useCallback(() => {
    requestIdRef.current += 1; // Invalidate any pending async speech requests
    
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
      audioRef.current = null;
    }

    if (currentAudioUrlRef.current) {
      URL.revokeObjectURL(currentAudioUrlRef.current);
      currentAudioUrlRef.current = null;
    }
    
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    
    setIsSpeaking(false);
  }, []);

  const speakFallback = useCallback((text: string, voiceName: string, requestId: number) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      if (requestIdRef.current === requestId) setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    fallbackUtteranceRef.current = utterance;
    
    const voices = window.speechSynthesis.getVoices();
    let selectedVoice = voices.find(v => v.lang.startsWith('en-') && (v.name.includes('Google') || v.name.includes('Premium') || v.name.includes('Natural')));
    if (!selectedVoice) {
      selectedVoice = voices.find(v => v.lang.startsWith('en-'));
    }
    
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
    
    utterance.rate = 0.95;
    
    utterance.onend = () => {
      if (requestIdRef.current === requestId) setIsSpeaking(false);
    };
    utterance.onerror = () => {
      if (requestIdRef.current === requestId) setIsSpeaking(false);
    };
    
    window.speechSynthesis.speak(utterance);
  }, []);

  const speak = useCallback(async (
    text: string, 
    voiceName: string,
    level: string = 'B1',
    avatarName: string = 'Assistant',
    avatarPersonality: string = 'helpful'
  ) => {
    stopSpeaking(); // Stop any current audio and increment requestId
    const currentRequestId = requestIdRef.current;
    
    setIsSpeaking(true); // Optimistic UI update while fetching

    try {
      const cacheKey = `${voiceName}:${text}`;
      let base64Audio = cacheRef.current.get(cacheKey);

      if (!base64Audio) {
        base64Audio = await generateSpeech(text, voiceName, level, avatarName, avatarPersonality);
        if (base64Audio) {
          cacheRef.current.set(cacheKey, base64Audio);
        }
      }

      if (requestIdRef.current !== currentRequestId) return; // Stale request check

      if (base64Audio) {
        const pcmData = base64ToUint8Array(base64Audio);
        const wavBlob = pcmToWav(pcmData, 24000);
        const audioUrl = URL.createObjectURL(wavBlob);
        
        currentAudioUrlRef.current = audioUrl;

        const audio = new Audio(audioUrl);
        audioRef.current = audio;

        audio.onended = () => {
          if (currentAudioUrlRef.current === audioUrl) {
            URL.revokeObjectURL(audioUrl);
            currentAudioUrlRef.current = null;
          }
          if (requestIdRef.current === currentRequestId) {
            setIsSpeaking(false);
          }
        };

        audio.onerror = () => {
          if (currentAudioUrlRef.current === audioUrl) {
            URL.revokeObjectURL(audioUrl);
            currentAudioUrlRef.current = null;
          }
          if (requestIdRef.current === currentRequestId) {
            setIsSpeaking(false);
            speakFallback(text, voiceName, currentRequestId);
          }
        };

        await audio.play();
      } else {
        console.warn("Gemini TTS returned null, falling back to browser TTS");
        speakFallback(text, voiceName, currentRequestId);
      }
    } catch (error) {
      console.error("Error in TTS pipeline, falling back to browser TTS", error);
      if (requestIdRef.current === currentRequestId) {
        speakFallback(text, voiceName, currentRequestId);
      }
    }
  }, [stopSpeaking, speakFallback]);

  return {
    isListening,
    isSpeaking,
    startListening,
    stopListening,
    speak,
    stopSpeaking
  };
}
