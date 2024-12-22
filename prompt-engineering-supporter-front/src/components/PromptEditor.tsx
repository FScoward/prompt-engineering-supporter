import React from 'react';
import { Prompt } from '../types/Prompt';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';

interface Props {
    prompt: Prompt | null;
    isOpen: boolean;
    onClose: () => void;
    onSave: (editedPrompt: Prompt) => void;
}

const PromptEditor: React.FC<Props> = ({ prompt, isOpen, onClose, onSave }) => {
    if (!isOpen || !prompt) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);
        const editedPrompt: Prompt = {
            ...prompt,
            label: formData.get('label') as string,
            value: formData.get('value') as string,
        };
        onSave(editedPrompt);
    };

    return (
        <div className="fixed right-0 top-0 h-full w-96 bg-white shadow-lg p-4 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">プロンプト編集</h2>
                <Button 
                    variant="outline" 
                    onClick={onClose}
                    className="text-gray-500 hover:text-gray-700"
                >
                    ✕
                </Button>
            </div>
            <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            ラベル
                        </label>
                        <input
                            name="label"
                            type="text"
                            defaultValue={prompt.label}
                            className="w-full px-3 py-2 border rounded-md bg-white text-gray-900"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            プロンプト内容
                        </label>
                        <Textarea
                            name="value"
                            defaultValue={prompt.value}
                            className="w-full bg-white text-gray-900"
                            rows={8}
                        />
                    </div>
                    <Button type="submit" className="w-full">
                        保存
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default PromptEditor; 