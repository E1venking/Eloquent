import React from 'react';
import { motion } from 'motion/react';
import { MessageSquareQuote, Sparkles, ArrowRight, Globe, BookOpen } from 'lucide-react';
import { useSound } from '../hooks/useSound';

export default function WelcomeScreen({ onNext }: { onNext: () => void; key?: string }) {
  const { playSound } = useSound();

  const handleNext = () => {
    playSound('success');
    onNext();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col items-center justify-center py-24 text-center"
    >
      <div className="w-16 h-16 bg-blue-950 text-amber-400 rounded-2xl flex items-center justify-center mb-8 shadow-md border border-blue-900">
        <MessageSquareQuote size={32} strokeWidth={1.5} />
      </div>
      <h1 className="text-4xl md:text-6xl font-bold text-blue-950 tracking-tight mb-6">
        Master English <br className="hidden md:block" />
        <span className="text-stone-500 font-medium">with AI Professionals</span>
      </h1>
      <p className="text-lg text-stone-600 max-w-2xl mx-auto mb-12 leading-relaxed">
        Elevate your speaking skills in a sophisticated, pressure-free environment. Select a professional topic, choose your AI counterpart, and engage in meaningful dialogue at your proficiency level.
      </p>
      <button
        onClick={handleNext}
        className="group relative inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-medium text-white bg-blue-950 rounded-lg overflow-hidden transition-all hover:bg-blue-900 active:scale-[0.98] shadow-lg shadow-blue-950/20"
      >
        <span className="relative z-10 flex items-center gap-2">
          Begin Session <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform text-amber-400" />
        </span>
      </button>

      <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl w-full text-left">
        <FeatureCard icon={<Globe strokeWidth={1.5} />} title="Global Topics" desc="Engage in discussions ranging from international business to technology." />
        <FeatureCard icon={<MessageSquareQuote strokeWidth={1.5} />} title="Expert Counterparts" desc="Converse with specialized AI personas designed for professional dialogue." />
        <FeatureCard icon={<BookOpen strokeWidth={1.5} />} title="Adaptive Proficiency" desc="Tailored vocabulary and pacing from foundational to advanced levels." />
      </div>
    </motion.div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="bg-white p-8 rounded-xl border border-stone-200 shadow-sm hover:shadow-md transition-all hover:border-blue-900/30">
      <div className="w-12 h-12 bg-stone-50 text-blue-950 rounded-lg flex items-center justify-center mb-6 border border-stone-100">
        {icon}
      </div>
      <h3 className="font-semibold text-blue-950 mb-2 text-lg tracking-tight">{title}</h3>
      <p className="text-stone-500 leading-relaxed">{desc}</p>
    </div>
  );
}
