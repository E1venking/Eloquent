import { Topic, Avatar, Level } from './types';

export const TOPICS: Topic[] = [
  { id: 'environment', name: 'Environment', icon: 'Leaf' },
  { id: 'education', name: 'Education', icon: 'BookOpen' },
  { id: 'family', name: 'Family', icon: 'Users' },
  { id: 'school', name: 'School', icon: 'GraduationCap' },
  { id: 'money', name: 'Money', icon: 'Banknote' },
  { id: 'jobs', name: 'Jobs', icon: 'Briefcase' },
  { id: 'technology', name: 'Technology', icon: 'Laptop' },
  { id: 'health', name: 'Health', icon: 'HeartPulse' },
  { id: 'travel', name: 'Travel', icon: 'Plane' },
  { id: 'hobbies', name: 'Hobbies', icon: 'Palette' },
  { id: 'food', name: 'Food', icon: 'Utensils' },
  { id: 'sports', name: 'Sports', icon: 'Trophy' },
  { id: 'movies', name: 'Movies', icon: 'Film' },
  { id: 'music', name: 'Music', icon: 'Music' },
  { id: 'science', name: 'Science', icon: 'Microscope' },
];

export const AVATARS: Avatar[] = [
  { id: 'alex', name: 'Alex', gender: 'male', personality: 'friendly and encouraging', imageUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=faces', voiceName: 'Puck' },
  { id: 'daniel', name: 'Daniel', gender: 'male', personality: 'calm and thoughtful', imageUrl: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=150&h=150&fit=crop&crop=faces', voiceName: 'Fenrir' },
  { id: 'leo', name: 'Leo', gender: 'male', personality: 'energetic and social', imageUrl: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=150&h=150&fit=crop&crop=faces', voiceName: 'Charon' },
  { id: 'emma', name: 'Emma', gender: 'female', personality: 'warm and supportive', imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=faces', voiceName: 'Kore' },
  { id: 'sophia', name: 'Sophia', gender: 'female', personality: 'confident and curious', imageUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=faces', voiceName: 'Zephyr' },
  { id: 'mia', name: 'Mia', gender: 'female', personality: 'cheerful and relaxed', imageUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=faces', voiceName: 'Aoede' },
];

export const LEVELS: Level[] = [
  { id: 'a1', name: 'A1', description: 'Very short, simple, clear questions.' },
  { id: 'a2', name: 'A2', description: 'Simple everyday language.' },
  { id: 'a2+', name: 'A2+', description: 'Slightly extended but still easy.' },
  { id: 'b1', name: 'B1', description: 'More natural everyday discussion.' },
  { id: 'b1+', name: 'B1+', description: 'More detailed opinions and reasons.' },
  { id: 'b2', name: 'B2', description: 'Flexible, abstract, and opinion-based.' },
];
