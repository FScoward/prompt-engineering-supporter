import { ChatMessage } from "../types/Prompt";
import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";
import { useState } from "react";

type ApiType = "gemini" | "chatgpt";

const useApi = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const geminiClient = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY ?? "");
  const openaiClient = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY ?? "",
    dangerouslyAllowBrowser: true,
  });

  const generateTextGemini = async (
    text: string,
    chatHistory: ChatMessage[]
  ) => {
    try {
      setIsLoading(true);
      const model = geminiClient.getGenerativeModel({ model: "gemini-pro" });

      // チャット履歴を変換
      const convertedHistory = chatHistory.map((msg) => ({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }],
      }));

      const request = {
        contents: [...convertedHistory, { role: "user", parts: [{ text }] }],
      };

      // ストリーミングレスポンスを生成
      const result = await model.generateContentStream(request);

      let fullResponse = "";
      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        fullResponse += chunkText;
      }
      return fullResponse;
    } catch (error) {
      console.error("Gemini APIとの通信中にエラーが発生しました:", error);
      throw new Error("Gemini APIとの通信中にエラーが発生しました。");
    } finally {
      setIsLoading(false);
    }
  };

  const generateTextChatGPT = async (
    text: string,
    chatHistory: ChatMessage[]
  ) => {
    try {
      setIsLoading(true);
      // チャット履歴を変換
      const messages = chatHistory.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      messages.push({ role: "user", content: text });

      const completion = await openaiClient.chat.completions.create({
        messages: messages,
        model: "gpt-3.5-turbo",
      });

      return completion.choices[0].message.content ?? "";
    } catch (error) {
      console.error("ChatGPT APIとの通信中にエラーが発生しました:", error);
      throw new Error("ChatGPT APIとの通信中にエラーが発生しました。");
    } finally {
      setIsLoading(false);
    }
  };

  return { generateTextGemini, generateTextChatGPT, isLoading };
};

export default useApi;
