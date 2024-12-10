import React, { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

import { Prompt } from '../types/Prompt';

interface PromptSelectorProps {
    prompts: Prompt[];
    onSelect: (selectedPrompt: Prompt) => void;
}

const PromptSelector: React.FC<PromptSelectorProps> = ({ prompts, onSelect }) => {
    const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);

    const handleSelect = (value: string) => {
        const prompt = prompts.find((p) => p.value === value);
        if (prompt) {
            setSelectedPrompt(prompt);
            onSelect(prompt);
        }
    };

    return (
        <div className="w-full max-w-md">
            <Select onValueChange={handleSelect}>
                <SelectTrigger>
                    <SelectValue placeholder="Select a prompt" />
                </SelectTrigger>
                <SelectContent>
                    {prompts.map((prompt) => (
                        <SelectItem key={prompt.id} value={prompt.value}>
                            {prompt.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
};

export default PromptSelector;