import { ChatMessage, Prompt, PromptVersion } from "../types/Prompt";
import React, { useState } from "react";

import useApi from "./useApi";

type ApiType = "gemini" | "chatgpt";

const useAppState = () => {
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isEditorOpen, setIsEditorOpen] = useState<boolean>(false);
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [selectedApi, setSelectedApi] = useState<ApiType>("gemini");
  const [promptVersions, setPromptVersions] = useState<PromptVersion[]>([]);
  const [prompts, setPrompts] = useState<Prompt[]>([
    {
      id: "1",
      label: "概念を説明する",
      value: "概念を説明してください:",
      isSystemInstruction: true,
      version: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "2",
      label: "要約を生成する",
      value: "要約を生成してください:",
      isSystemInstruction: true,
      version: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "3",
      label: "例を提供する",
      value: "例を提供してください:",
      isSystemInstruction: true,
      version: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "4",
      label: "コミットメッセージを生成する",
      value:
        "以下の変更内容に対する簡潔で分かりやすいGitコミットメッセージを生成してください。コミットメッセージは、変更内容を端的に表現し、他の開発者が理解しやすい形式で書いてください:",
      isSystemInstruction: true,
      version: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);

  const { generateTextGemini, generateTextChatGPT, isLoading } = useApi();

  const handlePromptSelect = (prompt: Prompt) => {
    // 表示と履歴をクリア
    setChatHistory([]);

    // プロンプトエディタを開く
    setSelectedPrompt(prompt);
    setIsEditorOpen(false); // 一度閉じる
    setTimeout(() => {
      setIsEditorOpen(true); // 再度開く
    }, 0);

    // システムプロンプトを設定
    if (prompt.isSystemInstruction) {
      const systemMessage: ChatMessage = {
        role: "system",
        content: prompt.value,
        timestamp: new Date(),
      };
      setChatHistory([systemMessage]);
    }
  };

  const handleSavePrompt = (
    editedPrompt: Prompt,
    createNewVersion: boolean
  ) => {
    const now = new Date();

    // 既存のプロンプトの場合
    if (prompts.some((p) => p.id === editedPrompt.id)) {
      if (createNewVersion) {
        // 現在のバージョンを履歴に保存
        const currentPrompt = prompts.find((p) => p.id === editedPrompt.id);
        if (currentPrompt) {
          const versionHistory: PromptVersion = {
            promptId: currentPrompt.id,
            version: currentPrompt.version,
            label: currentPrompt.label,
            value: currentPrompt.value,
            isSystemInstruction: currentPrompt.isSystemInstruction ?? false,
            createdAt: currentPrompt.createdAt,
          };
          setPromptVersions((prev) => [...prev, versionHistory]);
        }

        // プロンプトを更新（新しいバージョンとして）
        setPrompts((prev) =>
          prev.map((p) =>
            p.id === editedPrompt.id
              ? {
                  ...editedPrompt,
                  version: (editedPrompt.version || 0) + 1,
                  updatedAt: now,
                }
              : p
          )
        );
      } else {
        // プロンプトを更新（バージョンは変更せず）
        setPrompts((prev) =>
          prev.map((p) =>
            p.id === editedPrompt.id
              ? {
                  ...editedPrompt,
                  updatedAt: now,
                }
              : p
          )
        );
      }
    } else {
      // 新規プロンプトの場合
      const newPrompt: Prompt = {
        ...editedPrompt,
        version: 1,
        createdAt: now,
        updatedAt: now,
      };
      setPrompts((prev) => [...prev, newPrompt]);
    }

    // 保存後にプロンプトを選択し直す
    setSelectedPrompt(editedPrompt);
    setIsEditorOpen(true);
  };

  const handleApiChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedApi(event.target.value as ApiType);
  };

  const generateText = async (text: string, chatHistory: ChatMessage[]) => {
    try {
      let response: string;
      if (selectedApi === "gemini") {
        response = await generateTextGemini(text, chatHistory);
      } else {
        response = await generateTextChatGPT(text, chatHistory);
      }
      return response;
    } catch (error: unknown) {
      console.error("Error during text generation:", error);
      throw error; // エラーを再スローして呼び出し元で処理する
    }
  };

  const handleCreateNewPrompt = () => {
    const now = new Date();
    setSelectedPrompt({
      id: (prompts.length + 1).toString(),
      label: "新しいプロンプト",
      value: "",
      isSystemInstruction: true,
      version: 1,
      createdAt: now,
      updatedAt: now,
    });
    setIsEditorOpen(true);
  };

  const handleCloseEditor = () => {
    setIsEditorOpen(false);
  };

  return {
    chatHistory,
    setChatHistory,
    isEditorOpen,
    setIsEditorOpen,
    selectedPrompt,
    setSelectedPrompt,
    selectedApi,
    setSelectedApi,
    promptVersions,
    setPromptVersions,
    prompts,
    setPrompts,
    isLoading,
    handlePromptSelect,
    handleSavePrompt,
    handleApiChange,
    generateText,
    handleCreateNewPrompt,
    handleCloseEditor,
  };
};

export default useAppState;
