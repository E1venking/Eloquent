import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { KeyRound, ArrowRight, ExternalLink } from 'lucide-react';
import { useSound } from '../hooks/useSound';
import { clearApiKey, hasStoredApiKey, saveApiKey, validateApiKey } from '../services/ai';

export default function ApiKeyScreen({ onNext }: { onNext: () => void; key?: string }) {
  const [isChecking, setIsChecking] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const { playSound } = useSound();

  // Stable ref so the effect doesn't re-run if the parent re-renders and
  // passes a new function identity for onNext.
  const onNextRef = useRef(onNext);
  useEffect(() => {
    onNextRef.current = onNext;
  }, [onNext]);

  useEffect(() => {
    let cancelled = false;

    const checkKey = async () => {
      try {
        if (hasStoredApiKey()) {
          if (!cancelled) onNextRef.current();
          return;
        }

        if (typeof (window as any).aistudio !== 'undefined') {
          const hasKey = await (window as any).aistudio.hasSelectedApiKey();
          if (hasKey && !cancelled) {
            onNextRef.current();
            return;
          }
        }
      } catch (error) {
        console.error(error);
      } finally {
        if (!cancelled) setIsChecking(false);
      }
    };

    checkKey();

    return () => {
      cancelled = true;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleConnect = async () => {
    playSound('click');
    setErrorMessage('');

    if (apiKeyInput.trim()) {
      setIsSubmitting(true);

      try {
        const isValid = await validateApiKey(apiKeyInput);

        if (!isValid) {
          clearApiKey();
          setErrorMessage(
            'This API key could not be verified. Please check the key and try again.'
          );
          return;
        }

        saveApiKey(apiKeyInput);
        onNextRef.current();
        return;
      } catch (error) {
        console.error(error);
        clearApiKey();
        setErrorMessage(
          'Something went wrong while checking your API key. Please try again.'
        );
        return;
      } finally {
        setIsSubmitting(false);
      }
    }

    try {
      if (typeof (window as any).aistudio !== 'undefined') {
        await (window as any).aistudio.openSelectKey();
        onNextRef.current();
      } else {
        setErrorMessage('Please enter your Gemini API key first.');
      }
    } catch (error) {
      console.error(error);
      setErrorMessage('The key picker could not be opened. Please paste your key manually.');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleConnect();
    }
  };

  if (isChecking) {
    return (
      <div className="flex justify-center items-center py-24">
        <div className="w-8 h-8 border-4 border-stone-200 border-t-blue-950 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col items-center justify-center py-16 text-center max-w-2xl mx-auto"
    >
      <div className="w-16 h-16 bg-blue-950 text-amber-400 rounded-2xl flex items-center justify-center mb-8 border border-blue-900 shadow-sm">
        <KeyRound size={32} strokeWidth={1.5} />
      </div>
      <h1 className="text-3xl md:text-4xl font-bold text-blue-950 tracking-tight mb-4">
        Authentication Required
      </h1>
      <p className="text-lg text-stone-600 mb-10 leading-relaxed">
        To access Eloquent, please provide your Google Gemini API key. The key is stored only in
        this browser on this device.
      </p>

      <div className="bg-white p-8 rounded-xl border border-stone-200 shadow-sm w-full mb-10 text-left">
        <label htmlFor="apiKey" className="block text-sm font-medium text-stone-700 mb-3">
          Enter your Gemini API Key
        </label>
        <input
          type="password"
          id="apiKey"
          value={apiKeyInput}
          onChange={(e) => setApiKeyInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="AIzaSy..."
          className="w-full px-4 py-3 rounded-lg border border-stone-300 focus:ring-2 focus:ring-blue-950 focus:border-transparent outline-none transition-all text-stone-900 mb-3"
          autoComplete="off"
          spellCheck={false}
        />
        <p className="text-sm text-stone-500">
          Don&apos;t have an API key? Get one from{' '}
          <a
            href="https://aistudio.google.com/app/apikey"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-950 font-medium hover:underline inline-flex items-center gap-1"
          >
            Google AI Studio <ExternalLink size={12} />
          </a>
          .
        </p>
        {errorMessage && (
          <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMessage}
          </p>
        )}
      </div>

      <button
        onClick={handleConnect}
        disabled={isSubmitting}
        className="group relative inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-medium text-white bg-blue-950 rounded-lg overflow-hidden transition-all hover:bg-blue-900 active:scale-[0.98] shadow-lg shadow-blue-950/20 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        <span className="relative z-10 flex items-center gap-2">
          {isSubmitting ? 'Checking key...' : 'Authenticate'}{' '}
          <ArrowRight
            size={18}
            className="group-hover:translate-x-1 transition-transform text-amber-400"
          />
        </span>
      </button>
    </motion.div>
  );
}
