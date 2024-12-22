export interface Prompt {
  id: string;
  label: string;
  value: string;
  isSystemInstruction?: boolean;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}
