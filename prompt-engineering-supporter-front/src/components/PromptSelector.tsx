import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

import { Button } from './ui/button';
import { Prompt } from '../types/Prompt';
import React from 'react';

interface PromptSelectorProps {
  prompts: Prompt[];
  onEdit: (selectedPrompt: Prompt) => void;
}

const PromptSelector: React.FC<PromptSelectorProps> = ({ prompts, onEdit }) => {
  const handleEditClick = (prompt: Prompt) => {
    onEdit(prompt);
  };

  return (
    <div className="w-full max-w-md">
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Select a prompt" />
        </SelectTrigger>
        <SelectContent>
          {prompts.map((prompt) => (
            <div key={prompt.id} className="flex items-center justify-between">
              <SelectItem value={prompt.value}>
                {prompt.label}
              </SelectItem>
              <Button
                variant="outline"
                size="sm"
                onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                  e.stopPropagation();
                  handleEditClick(prompt);
                }}
              >
                Edit
              </Button>
            </div>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default PromptSelector;
