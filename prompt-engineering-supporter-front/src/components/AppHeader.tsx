import { ApiType, Prompt, PromptVersion } from '../types/Prompt';

import { Button } from './ui/button';
import PromptSelector from './PromptSelector';
import React from 'react';

type AppHeaderProps = {
  selectedApi: ApiType;
  handleApiChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  handleCreateNewPrompt: () => void;
  prompts: Prompt[];
  setPrompt: React.Dispatch<
    React.SetStateAction<{
      selected: Prompt | null;
      versions: PromptVersion[];
    }>
  >;
  openEditor: () => void;
};

const AppHeader: React.FC<AppHeaderProps> = ({
  selectedApi,
  handleApiChange,
  handleCreateNewPrompt,
  prompts,
  setPrompt,
  openEditor,
}) => {
  return (
    <div className="p-4 border-b">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Prompt Selector</h1>
        <Button onClick={handleCreateNewPrompt} variant="outline">
          新規プロンプト作成
        </Button>
      </div>
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
      <PromptSelector
        prompts={prompts}
        onEdit={(selectedPrompt) => {
          setPrompt({
            selected: selectedPrompt,
            versions: [], // Add versions here
          });
          openEditor();
        }}
      />
    </div>
  );
};

export default AppHeader;
