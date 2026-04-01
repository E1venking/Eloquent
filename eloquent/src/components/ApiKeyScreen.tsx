import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { KeyRound, ArrowRight, ExternalLink } from 'lucide-react';
import { useSound } from '../hooks/useSound';

export default function ApiKeyScreen({ onNext }: { onNext: () => void; key?: string }) {
  const [isChecking, setIsChecking] = useState(true);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const { playSound } = useSound();

  useEffect(() => {
    const checkKey = async () => {
      try {
        if (localStorage.getItem('CUSTOM_API_KEY')) {
          onNext();
          return;
        }
        if (typeof (window as any).aistudio !== 'undefined') {
          const hasKey = await (window as any).aistudio.hasSelectedApiKey();
          if (hasKey) {
            onNext();
            return;
          }
        } else {
          // If not running inside the AI Studio environment, skip this step
          onNext();
          return;
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsChecking(false);
      }
    };
    checkKey();
  }, [onNext]);

  const handleConnect = async () => {
    playSound('click');
    if (apiKeyInput.trim()) {
      localStorage.setItem('CUSTOM_API_KEY', apiKeyInput.trim());
      onNext();
      return;
    }

    try {
      if (typeof (window as any).aistudio !== 'undefined') {
        await (window as any).aistudio.openSelectKey();
        // Assume success to mitigate race conditions as per platform guidelines
        onNext();
      } else {
        onNext();
      }
    } catch (e) {
      console.error(e);
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
        To access Eloquent, please provide your Google Gemini API key. This ensures a secure, private connection utilizing your dedicated resources.
      </p>

      <div className="bg-white p-8 rounded-xl border border-stone-200 shadow-sm w-full mb-10 text-left">
        <h3 className="font-semibold text-blue-950 mb-4 text-lg tracking-tight">Configuration Steps</h3>
        <ol className="list-decimal list-inside text-stone-600 space-y-3 mb-6 leading-relaxed">
          <li>Navigate to <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-950 font-medium hover:underline inline-flex items-center gap-1">Google AI Studio <ExternalLink size={14} /></a>.</li>
          <li>Authenticate with your Google credentials.</li>
          <li>Select <strong>"Create API key"</strong>.</li>
          <li>Copy the generated credential.</li>
        </ol>
        
        <div className="mt-8 pt-8 border-t border-stone-100">
          <label htmlFor="apiKey" className="block text-sm font-medium text-stone-700 mb-3">
            Manual Key Entry
          </label>
          <input
            type="password"
            id="apiKey"
            value={apiKeyInput}
            onChange={(e) => setApiKeyInput(e.target.value)}
            placeholder="AIzaSy..."
            className="w-full px-4 py-3 rounded-lg border border-stone-300 focus:ring-2 focus:ring-blue-950 focus:border-transparent outline-none transition-all text-stone-900"
          />
        </div>
      </div>

      <button
        onClick={handleConnect}
        className="group relative inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-medium text-white bg-blue-950 rounded-lg overflow-hidden transition-all hover:bg-blue-900 active:scale-[0.98] shadow-lg shadow-blue-950/20"
      >
        <span className="relative z-10 flex items-center gap-2">
          {apiKeyInput.trim() ? 'Authenticate' : 'Select Credential'} <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform text-amber-400" />
        </span>
      </button>
    </motion.div>
  );
}
