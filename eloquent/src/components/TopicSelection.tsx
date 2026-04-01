import { motion } from 'motion/react';
import { Topic } from '../types';
import * as Icons from 'lucide-react';
import { useSound } from '../hooks/useSound';

export default function TopicSelection({ topics, selected, onSelect, onNext, onBack }: any) {
  const { playSound } = useSound();

  const handleSelect = (topic: Topic) => {
    playSound('pop');
    onSelect(topic);
  };

  const handleNext = () => {
    playSound('success');
    onNext();
  };

  const handleBack = () => {
    playSound('click');
    onBack();
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="max-w-4xl mx-auto"
    >
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-blue-950 mb-3 tracking-tight">What do you want to talk about?</h2>
        <p className="text-stone-500">Choose a topic for your conversation.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10">
        {topics.map((topic: Topic) => {
          const Icon = (Icons as any)[topic.icon] || Icons.MessageCircle;
          const isSelected = selected?.id === topic.id;
          return (
            <button
              key={topic.id}
              onClick={() => handleSelect(topic)}
              className={`flex flex-col items-center justify-center p-6 rounded-xl border-2 transition-all ${
                isSelected
                  ? 'border-blue-950 bg-blue-50/50 text-blue-950 shadow-md scale-[1.02]'
                  : 'border-stone-200 bg-white text-stone-600 hover:border-blue-900/30 hover:bg-stone-50'
              }`}
            >
              <Icon size={32} strokeWidth={1.5} className={`mb-3 ${isSelected ? 'text-blue-950' : 'text-stone-400'}`} />
              <span className="font-medium">{topic.name}</span>
            </button>
          );
        })}
      </div>

      <div className="flex justify-between items-center">
        <button onClick={handleBack} className="px-6 py-3 text-stone-500 font-medium hover:text-blue-950 transition-colors">
          Back
        </button>
        <button
          onClick={handleNext}
          disabled={!selected}
          className={`px-8 py-3 rounded-lg font-medium transition-all ${
            selected
              ? 'bg-blue-950 text-white shadow-lg hover:bg-blue-900 hover:scale-[1.02]'
              : 'bg-stone-200 text-stone-400 cursor-not-allowed'
          }`}
        >
          Continue
        </button>
      </div>
    </motion.div>
  );
}
