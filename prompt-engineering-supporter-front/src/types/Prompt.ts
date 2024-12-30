export type ApiType = "gemini" | "chatgpt";

export interface Prompt {
  id: string;
  label: string;
  value: string;
  isSystemInstruction?: boolean;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
}

export interface PromptVersion {
  promptId: string;
  version: number;
  label: string;
  value: string;
  isSystemInstruction: boolean;
  createdAt: Date;
}
