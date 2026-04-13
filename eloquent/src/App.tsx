/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { AnimatePresence } from 'motion/react';
import { Topic, Avatar, Level } from './types';
import { TOPICS, AVATARS, LEVELS } from './data';
import WelcomeScreen from './components/WelcomeScreen';
import TopicSelection from './components/TopicSelection';
import AvatarSelection from './components/AvatarSelection';
import LevelSelection from './components/LevelSelection';
import ConversationScreen from './components/ConversationScreen';
import ApiKeyScreen from './components/ApiKeyScreen';
import { clearApiKey } from './services/ai';

export default function App() {
  const [isKeyVerified, setIsKeyVerified] = useState(false);
  const [step, setStep] = useState(0);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [selectedAvatar, setSelectedAvatar] = useState<Avatar | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<Level | null>(null);

  const nextStep = () => setStep((s) => s + 1);
  const prevStep = () => setStep((s) => s - 1);
  const restart = () => {
    setStep(0);
    setSelectedTopic(null);
    setSelectedAvatar(null);
    setSelectedLevel(null);
  };

  const resetApiKey = () => {
    clearApiKey();
    setIsKeyVerified(false);
    restart();
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 font-sans selection:bg-blue-900/20 selection:text-blue-950">
      <header className="bg-white border-b border-stone-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 font-bold text-xl text-blue-950 cursor-pointer tracking-tight" onClick={restart}>
            <div className="w-8 h-8 bg-blue-950 rounded-lg flex items-center justify-center text-amber-400 shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
              </svg>
            </div>
            Eloquent
          </div>

          <div className="flex items-center gap-4">
            {isKeyVerified && (
              <button
                onClick={resetApiKey}
                className="text-sm font-medium text-stone-500 hover:text-blue-950 transition-colors"
              >
                Change API Key
              </button>
            )}
            {isKeyVerified && step > 0 && step < 4 && (
              <div className="hidden md:flex items-center gap-2 text-sm font-medium text-stone-400">
                <span className={step >= 1 ? 'text-blue-950' : ''}>Topic</span>
                <span className="text-stone-300">/</span>
                <span className={step >= 2 ? 'text-blue-950' : ''}>Avatar</span>
                <span className="text-stone-300">/</span>
                <span className={step >= 3 ? 'text-blue-950' : ''}>Level</span>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {!isKeyVerified && <ApiKeyScreen key="apikey" onNext={() => setIsKeyVerified(true)} />}
          {isKeyVerified && step === 0 && <WelcomeScreen key="welcome" onNext={nextStep} />}
          {isKeyVerified && step === 1 && <TopicSelection key="topic" topics={TOPICS} selected={selectedTopic} onSelect={setSelectedTopic} onNext={nextStep} onBack={prevStep} />}
          {isKeyVerified && step === 2 && <AvatarSelection key="avatar" avatars={AVATARS} selected={selectedAvatar} onSelect={setSelectedAvatar} onNext={nextStep} onBack={prevStep} />}
          {isKeyVerified && step === 3 && <LevelSelection key="level" levels={LEVELS} selected={selectedLevel} onSelect={setSelectedLevel} onNext={nextStep} onBack={prevStep} />}
          {isKeyVerified && step === 4 && selectedTopic && selectedAvatar && selectedLevel && (
            <ConversationScreen
              key="chat"
              topic={selectedTopic}
              avatar={selectedAvatar}
              level={selectedLevel}
              onRestart={restart}
              onChangeTopic={() => setStep(1)}
              onChangeAvatar={() => setStep(2)}
              onChangeLevel={() => setStep(3)}
              onResetKey={resetApiKey}
            />
          )}
        </AnimatePresence>
      </main>

      <footer className="border-t border-stone-200 bg-white mt-8">
        <div className="max-w-5xl mx-auto px-4 h-12 flex items-center justify-center">
          <p className="text-sm text-stone-400">
            Prepared by Instructor Murat Furkan UĞUR
          </p>
        </div>
      </footer>
    </div>
  );
}
