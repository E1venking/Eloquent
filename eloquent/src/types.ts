export type Topic = {
  id: string;
  name: string;
  icon: string;
};

export type Avatar = {
  id: string;
  name: string;
  gender: 'male' | 'female';
  personality: string;
  imageUrl: string;
  voiceName: string;
};

export type Level = {
  id: string;
  name: string;
  description: string;
};

export type Message = {
  id: string;
  role: 'user' | 'model';
  text: string;
};
