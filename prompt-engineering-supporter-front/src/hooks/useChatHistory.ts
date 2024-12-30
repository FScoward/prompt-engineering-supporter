import { ChatMessage } from "../types/Prompt";
import { useState } from "react";

export const useChatHistory = () => {
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);

  const addChatMessage = (message: ChatMessage) => {
    setChatHistory((prev) => [...prev, message]);
  };

  return { chatHistory, addChatMessage };
};
