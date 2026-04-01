import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Mic, Square, Send, Volume2, RefreshCw, Settings } from 'lucide-react';
import { Topic, Avatar, Level, Message } from '../types';
import { createChatSession } from '../services/ai';
import { useSpeech } from '../hooks/useSpeech';
import { useSound } from '../hooks/useSound';

export default function ConversationScreen({ topic, avatar, level, onRestart, onChangeTopic, onChangeAvatar, onChangeLevel }: any) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const chatRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { playSound } = useSound();

  const handleSpeechResult = (text: string) => {
    setInputText(text);
  };

  const { isListening, isSpeaking, startListening, stopListening, speak, stopSpeaking } = useSpeech(handleSpeechResult);

  useEffect(() => {
    const initChat = async () => {
      setIsLoading(true);
      try {
        chatRef.current = createChatSession(topic.name, avatar.name, avatar.personality, level.name);
        const response = await chatRef.current.sendMessage({ message: "START_CONVERSATION" });
        const text = response.text || "Hello! Let's talk.";
        const newMsg: Message = { id: Date.now().toString(), role: 'model', text };
        setMessages([newMsg]);
        speak(text, avatar.voiceName);
      } catch (error) {
        console.error("Failed to start chat", error);
        setMessages([{ id: 'error', role: 'model', text: "Sorry, I couldn't connect. Please try again." }]);
      } finally {
        setIsLoading(false);
      }
    };
    initChat();

    return () => {
      stopSpeaking();
    };
  }, [topic, avatar, level]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!inputText.trim() || isLoading) return;

    playSound('pop');
    const userMsg: Message = { id: Date.now().toString(), role: 'user', text: inputText };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);
    stopSpeaking();

    try {
      const response = await chatRef.current.sendMessage({ message: userMsg.text });
      const text = response.text || "I didn't catch that.";
      const modelMsg: Message = { id: (Date.now() + 1).toString(), role: 'model', text };
      setMessages(prev => [...prev, modelMsg]);
      speak(text, avatar.voiceName);
    } catch (error) {
      console.error("Chat error", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const replayLastMessage = () => {
    playSound('click');
    const lastModelMsg = [...messages].reverse().find(m => m.role === 'model');
    if (lastModelMsg) {
      speak(lastModelMsg.text, avatar.voiceName);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-5xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-stone-200 flex flex-col md:flex-row h-[80vh]"
    >
      {/* Sidebar */}
      <div className="w-full md:w-80 bg-blue-950 border-r border-blue-900 p-8 flex flex-col text-white">
        <div className="flex flex-col items-center text-center mb-10">
          <div className="relative mb-6">
            <img src={avatar.imageUrl} alt={avatar.name} referrerPolicy="no-referrer" className="w-32 h-32 rounded-full bg-white shadow-sm border-4 border-blue-900/50 object-cover" />
            {isSpeaking && (
              <span className="absolute bottom-2 right-2 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-amber-500 border-2 border-blue-950"></span>
              </span>
            )}
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">{avatar.name}</h2>
          <p className="text-amber-400/90 font-medium text-sm mt-1">{avatar.personality}</p>
        </div>

        <div className="space-y-4 flex-1">
          <div className="bg-blue-900/40 p-5 rounded-xl border border-blue-800/50 shadow-sm">
            <div className="text-xs text-blue-300 uppercase font-bold tracking-wider mb-2">Topic</div>
            <div className="font-medium text-white flex justify-between items-center">
              {topic.name}
              <button onClick={onChangeTopic} className="text-blue-300 hover:text-amber-400 transition-colors"><Settings size={16}/></button>
            </div>
          </div>
          <div className="bg-blue-900/40 p-5 rounded-xl border border-blue-800/50 shadow-sm">
            <div className="text-xs text-blue-300 uppercase font-bold tracking-wider mb-2">Level</div>
            <div className="font-medium text-white flex justify-between items-center">
              {level.name}
              <button onClick={onChangeLevel} className="text-blue-300 hover:text-amber-400 transition-colors"><Settings size={16}/></button>
            </div>
          </div>
        </div>

        <button
          onClick={onRestart}
          className="mt-8 flex items-center justify-center gap-2 w-full py-3 text-blue-200 hover:text-white hover:bg-blue-900/50 rounded-lg transition-colors font-medium"
        >
          <RefreshCw size={18} /> End Session
        </button>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-stone-50 relative">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-2xl px-6 py-4 shadow-sm ${
                msg.role === 'user'
                  ? 'bg-blue-950 text-white rounded-br-sm'
                  : 'bg-white border border-stone-200 text-stone-800 rounded-bl-sm'
              }`}>
                <p className="text-base leading-relaxed">{msg.text}</p>
              </div>
            </div>
          ))}
          {isLoading && messages.length > 0 && (
            <div className="flex justify-start">
              <div className="bg-white border border-stone-200 rounded-2xl rounded-bl-sm px-6 py-4 flex items-center gap-2 shadow-sm">
                <div className="w-2 h-2 bg-stone-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-stone-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-stone-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-6 bg-white border-t border-stone-200">
          <div className="flex items-center gap-3 max-w-3xl mx-auto">
            <button
              onClick={replayLastMessage}
              className="p-3 text-stone-400 hover:text-blue-950 hover:bg-stone-100 rounded-lg transition-colors"
              title="Replay last message"
            >
              <Volume2 size={24} strokeWidth={1.5} />
            </button>

            <div className="flex-1 relative">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type or speak your response..."
                className="w-full bg-stone-50 border border-stone-200 rounded-xl py-3 pl-4 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-950 focus:border-transparent resize-none h-[52px] overflow-hidden leading-relaxed text-stone-900 placeholder:text-stone-400"
                rows={1}
              />
              <button
                onClick={() => {
                  playSound('click');
                  isListening ? stopListening() : startListening();
                }}
                className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-colors ${
                  isListening ? 'bg-red-50 text-red-600 animate-pulse' : 'text-stone-400 hover:text-blue-950 hover:bg-stone-200'
                }`}
              >
                {isListening ? <Square size={18} fill="currentColor" /> : <Mic size={20} strokeWidth={1.5} />}
              </button>
            </div>

            <button
              onClick={handleSend}
              disabled={!inputText.trim() || isLoading}
              className="p-3 bg-blue-950 text-amber-400 rounded-lg hover:bg-blue-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
            >
              <Send size={20} className="ml-0.5" strokeWidth={1.5} />
            </button>
          </div>
          <div className="text-center mt-3 text-xs text-stone-400 font-medium">
            Press Enter to send, or use the microphone to speak.
          </div>
        </div>
      </div>
    </motion.div>
  );
}
