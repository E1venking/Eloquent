import { motion } from 'motion/react';
import { Level } from '../types';
import { useSound } from '../hooks/useSound';

export default function LevelSelection({ levels, selected, onSelect, onNext, onBack }: any) {
  const { playSound } = useSound();

  const handleSelect = (level: Level) => {
    playSound('pop');
    onSelect(level);
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
        <h2 className="text-3xl font-bold text-blue-950 mb-3 tracking-tight">Select Proficiency Level</h2>
        <p className="text-stone-500">The AI counterpart will adapt its vocabulary and pacing accordingly.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
        {levels.map((level: Level) => {
          const isSelected = selected?.id === level.id;
          return (
            <button
              key={level.id}
              onClick={() => handleSelect(level)}
              className={`flex items-center p-6 rounded-xl border-2 transition-all text-left ${
                isSelected
                  ? 'border-blue-950 bg-blue-50/50 shadow-md scale-[1.02]'
                  : 'border-stone-200 bg-white hover:border-blue-900/30 hover:bg-stone-50'
              }`}
            >
              <div className={`w-14 h-14 rounded-lg flex items-center justify-center text-xl font-bold mr-5 shrink-0 transition-colors ${
                isSelected ? 'bg-blue-950 text-amber-400' : 'bg-stone-100 text-stone-600'
              }`}>
                {level.name}
              </div>
              <div>
                <h3 className={`font-bold text-lg tracking-tight ${isSelected ? 'text-blue-950' : 'text-stone-800'}`}>
                  {level.name} Level
                </h3>
                <p className={`text-sm ${isSelected ? 'text-blue-900' : 'text-stone-500'}`}>
                  {level.description}
                </p>
              </div>
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
          Initiate Session
        </button>
      </div>
    </motion.div>
  );
}
