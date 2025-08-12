export const TONES = [
  { id: 'confident', name: 'Confident', sub: 'Bold, assertive' },
  { id: 'polite', name: 'Polite', sub: 'Respectful, courteous' },
  { id: 'friendly', name: 'Friendly', sub: 'Warm, approachable' },
  { id: 'persuasive', name: 'Persuasive', sub: 'Convincing, goal-oriented' },
  { id: 'academic', name: 'Academic', sub: 'Scholarly, formal' },
  { id: 'creative', name: 'Creative', sub: 'Imaginative, expressive' },
];

export type ToneId = typeof TONES[number]['id']; 