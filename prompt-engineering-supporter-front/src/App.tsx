import { ChatMessage, Prompt, PromptVersion } from './types/Prompt';
import React, { useEffect, useRef, useState } from 'react';
import { generateTextChatGPT, generateTextGemini } from './lib/api/api';

import AppHeader from './components/AppHeader';
import ChatHistory from './components/ChatHistory';
import PromptEditor from './components/PromptEditor';
import TextInput from './components/TextInput';
import { useChatHistory } from './hooks/useChatHistory';
import { usePrompts } from './hooks/usePrompts';
import { useUiState } from './hooks/useUiState';

type ApiType = 'gemini' | 'chatgpt';

const App: React.FC = () => {
  const [response, setResponse] = useState<{ text: string; count: number }>({
    text: '',
    count: 0,
  });
  const { chatHistory, addChatMessage } = useChatHistory();
  const { ui, startLoading, endLoading, openEditor, closeEditor } = useUiState();
  const [selectedApi, setSelectedApi] = useState<ApiType>('gemini');
  const [prompt, setPrompt] = useState<{
    selected: Prompt | null;
    versions: PromptVersion[];
  }>({
    selected: null,
    versions: [],
  });
  const { prompts, handleSavePrompt } = usePrompts();

  const chatContainerRef = useRef<HTMLDivElement>(null);

  // チャット履歴が更新されたときに最下部にスクロール
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const handleApiChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedApi(event.target.value as ApiType);
  };

  const handleTextSubmit = async (text: string) => {
    setResponse({ text: '', count: 0 }); // Reset response
    startLoading();

    // Add user message to chat history
    const userMessage: ChatMessage = {
      role: 'user',
      content: text,
      timestamp: new Date(),
    };
    addChatMessage(userMessage);

    try {
      let generatedResponse: { text: string; count: number } = {
        text: '',
        count: 0,
      };
      if (selectedApi === 'gemini') {
        generatedResponse.text = await generateTextGemini(chatHistory, text);
      } else {
        generatedResponse = await generateTextChatGPT(chatHistory, text);
      }

      // Add assistant message to chat history
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: generatedResponse.text,
        timestamp: new Date(),
      };
      addChatMessage(assistantMessage);

      setResponse(generatedResponse);
    } catch (error) {
      console.error('Error during text generation:', error);
      setResponse({ ...response, text: 'エラーが発生しました。' });

      // Add error message to chat history
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: 'エラーが発生しました。',
        timestamp: new Date(),
      };
      addChatMessage(errorMessage);
    } finally {
      endLoading();
    }
  };

  // 新規プロンプト作成時の初期値を更新
  const handleCreateNewPrompt = () => {
    const now = new Date();
    setPrompt({
      ...prompt,
      selected: {
        id: (prompts.length + 1).toString(),
        label: '新しいプロンプト',
        value: '',
        isSystemInstruction: true,
        version: 1,
        createdAt: now,
        updatedAt: now,
      },
    });
    openEditor();
  };

  return (
    <div className="flex justify-center min-h-screen">
      <div className="w-full max-w-4xl flex flex-col h-screen">
        {/* ヘッダー部分 */}
        <AppHeader
          selectedApi={selectedApi}
          handleApiChange={handleApiChange}
          handleCreateNewPrompt={handleCreateNewPrompt}
          prompts={prompts}
          setPrompt={setPrompt}
          openEditor={openEditor}
        />

        {/* チャット履歴（スクロール可能な領域） */}
        <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4">
          <ChatHistory
            chatHistory={chatHistory}
            isLoading={ui.isLoading}
          />
        </div>

        {/* 入力欄（画面下部に固定） */}
        <div className="border-t p-4 bg-white">
          <TextInput onSubmit={handleTextSubmit} disabled={ui.isLoading} />
        </div>
      </div>

      <PromptEditor
        prompt={prompt.selected}
        isOpen={ui.isEditorOpen}
        onClose={closeEditor}
        onSave={handleSavePrompt}
        versions={prompt.versions.filter(
          (v) => prompt.selected && v.promptId === prompt.selected.id
        )}
      />
    </div>
  );
};

export default App;
