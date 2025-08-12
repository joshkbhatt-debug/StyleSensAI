export const STYLE_OPTIONS = [
  { id: 'formal', label: 'Formal', description: 'Polished, professional tone for business or academic writing' },
  { id: 'casual', label: 'Casual', description: 'Relaxed, conversational style for everyday communication' },
  { id: 'technical', label: 'Technical', description: 'Clear, precise, and jargon-friendly for manuals or reports' },
  { id: 'creative', label: 'Creative', description: 'Imaginative and expressive for storytelling and artistic writing' },
  { id: 'persuasive', label: 'Persuasive', description: 'Convincing and impactful for sales, pitches, or opinion pieces' },
  { id: 'narrative', label: 'Narrative', description: 'Story-driven, engaging flow for blogs, essays, or anecdotes' },
  { id: 'academic', label: 'Academic', description: 'Structured, evidence-based style for research or scholarly work' },
  { id: 'journalistic', label: 'Journalistic', description: 'Concise, fact-focused style for news and reporting' },
  { id: 'descriptive', label: 'Descriptive', description: 'Rich detail and sensory language for vivid imagery' },
  { id: 'concise', label: 'Concise', description: 'Minimalist and to the point, great for summaries or short messages' }
];

export type StyleId = typeof STYLE_OPTIONS[number]['id'];
export type AIProvider = 'sensei' | 'openai' | 'anthropic' | 'google' | 'mistral' | 'cohere'; 