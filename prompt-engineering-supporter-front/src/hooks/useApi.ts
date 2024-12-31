import { ApiType } from "../types/ApiType";
import { ChatMessage } from "../types/Prompt";
import { useState } from "react";

export const useApi = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async (url: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (e) {
      setError(e instanceof Error ? e : new Error("Unknown error occurred"));
      throw e;
    } finally {
      setIsLoading(false);
    }
  };

  const generateText = async (
    text: string,
    chatHistory: ChatMessage[],
    api: ApiType,
    onMessage: (message: ChatMessage) => void
  ) => {
    setIsLoading(true);
    try {
      // ここにAPI呼び出しの実装を追加
      const message: ChatMessage = {
        role: "assistant",
        content: "応答テスト",
        timestamp: new Date(),
      };
      onMessage(message);
    } catch (e) {
      setError(e instanceof Error ? e : new Error("Unknown error occurred"));
      throw e;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    fetchData,
    generateText,
  };
};
