import { ChatMessage } from "../../types/Prompt";
import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";

const geminiClient = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY ?? "");
const openaiClient = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY ?? "",
  dangerouslyAllowBrowser: true,
});

export async function generateTextGemini(
  chatHistory: ChatMessage[],
  text: string
): Promise<string> {
  try {
    const model = geminiClient.getGenerativeModel({
      model: "gemini-pro",
    });

    const convertedHistory = chatHistory.map((msg) => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }],
    }));

    const request = {
      contents: [...convertedHistory, { role: "user", parts: [{ text }] }],
    };

    const result = await model.generateContentStream(request);

    let fullResponse = "";
    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      fullResponse += chunkText;
    }

    return fullResponse;
  } catch (error) {
    console.error("Gemini APIとの通信中にエラーが発生しました:", error);
    throw error;
  }
}

export async function generateTextChatGPT(
  chatHistory: ChatMessage[],
  text: string
): Promise<{ text: string; count: number }> {
  try {
    const messages = chatHistory.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

    messages.push({ role: "user", content: text });

    const completion = await openaiClient.chat.completions.create({
      messages: messages,
      model: "gpt-3.5-turbo",
    });

    const responseText = completion.choices[0].message.content ?? "";
    const totalTokens = completion.usage?.total_tokens ?? 0;

    return { text: responseText, count: totalTokens };
  } catch (error) {
    console.error("ChatGPT APIとの通信中にエラーが発生しました:", error);
    throw error;
  }
}
