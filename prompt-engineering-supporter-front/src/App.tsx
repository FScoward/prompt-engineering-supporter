import ChatContainer from "./components/ChatContainer";
import { ChatMessage } from "./types/Prompt";
import PromptManagement from "./components/PromptManagement";
import React from "react";
import useAppState from "./hooks/useAppState";

const App: React.FC = () => {
  const {
    chatHistory,
    setChatHistory,
    isEditorOpen,
    selectedPrompt,
    selectedApi,
    promptVersions,
    prompts,
    isLoading,
    handlePromptSelect,
    handleSavePrompt,
    handleApiChange,
    generateText,
    handleCreateNewPrompt,
    handleCloseEditor,
  } = useAppState();

  const handleTextSubmitWrapper = async (text: string) => {
    // Add user message to chat history
    const userMessage: ChatMessage = {
      role: "user",
      content: text,
      timestamp: new Date(),
    };
    setChatHistory((prev) => [...prev, userMessage]);

    try {
      const response = await generateText(text, [...chatHistory, userMessage]);
      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: response,
        timestamp: new Date(),
      };
      setChatHistory((prev) => [...prev, assistantMessage]);
    } catch (error: unknown) {
      console.error("Error during text generation:", error);
      const errorMessage: ChatMessage = {
        role: "assistant",
        content: "エラーが発生しました。",
        timestamp: new Date(),
      };
      setChatHistory((prev) => [...prev, errorMessage]);
    }
  };

  return (
    <div className="flex justify-center min-h-screen">
      <div className="w-full max-w-4xl flex flex-col h-screen">
        {/* ヘッダー部分とプロンプト管理 */}
        <PromptManagement
          prompts={prompts}
          promptVersions={promptVersions}
          selectedPrompt={selectedPrompt}
          isEditorOpen={isEditorOpen}
          onPromptSelect={handlePromptSelect}
          onSavePrompt={handleSavePrompt}
          onCreateNewPrompt={handleCreateNewPrompt}
          onCloseEditor={handleCloseEditor}
        />

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            使用するAPI
          </label>
          <select
            value={selectedApi}
            onChange={handleApiChange}
            className="block w-full rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
          >
            <option value="gemini">Gemini</option>
            <option value="chatgpt">ChatGPT</option>
          </select>
        </div>

        {/* チャット履歴と入力欄 */}
        <ChatContainer
          chatHistory={chatHistory}
          isLoading={isLoading}
          onSubmit={handleTextSubmitWrapper}
        />
      </div>
    </div>
  );
};

export default App;
