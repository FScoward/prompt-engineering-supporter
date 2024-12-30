import { Prompt } from "../types/Prompt";
import { useState } from "react";

export const usePrompts = () => {
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

  const handleSavePrompt = (
    editedPrompt: Prompt,
    createNewVersion: boolean
  ) => {
    const now = new Date();

    // 既存のプロンプトの場合
    if (prompts.some((p) => p.id === editedPrompt.id)) {
      if (createNewVersion) {
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
  };

  return { prompts, setPrompts, handleSavePrompt };
};
