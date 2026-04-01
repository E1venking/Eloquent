import { motion } from 'motion/react';
import { Avatar } from '../types';
import { useSound } from '../hooks/useSound';

export default function AvatarSelection({ avatars, selected, onSelect, onNext, onBack }: any) {
  const { playSound } = useSound();

  const handleSelect = (avatar: Avatar) => {
    playSound('pop');
    onSelect(avatar);
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
        <h2 className="text-3xl font-bold text-blue-950 mb-3 tracking-tight">Select your counterpart</h2>
        <p className="text-stone-500">Choose an AI professional to converse with.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {avatars.map((avatar: Avatar) => {
          const isSelected = selected?.id === avatar.id;
          return (
            <button
              key={avatar.id}
              onClick={() => handleSelect(avatar)}
              className={`flex flex-col items-center p-6 rounded-2xl border-2 transition-all text-left ${
                isSelected
                  ? 'border-blue-950 bg-blue-50/50 shadow-md scale-[1.02]'
                  : 'border-stone-200 bg-white hover:border-blue-900/30 hover:bg-stone-50'
              }`}
            >
              <img src={avatar.imageUrl} alt={avatar.name} referrerPolicy="no-referrer" className="w-24 h-24 rounded-full mb-4 bg-white shadow-sm object-cover border-2 border-stone-100" />
              <h3 className={`text-xl font-bold mb-1 tracking-tight ${isSelected ? 'text-blue-950' : 'text-stone-800'}`}>
                {avatar.name}
              </h3>
              <p className={`text-sm text-center ${isSelected ? 'text-blue-900' : 'text-stone-500'}`}>
                {avatar.personality}
              </p>
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
