import { Prompt, PromptVersion } from '../types/Prompt';

import { Button } from './ui/button';
import PromptEditor from './PromptEditor';
import PromptSelector from './PromptSelector';
import React from 'react';

type PromptManagementProps = {
    prompts: Prompt[];
    promptVersions: PromptVersion[];
    selectedPrompt: Prompt | null;
    isEditorOpen: boolean;
    onPromptSelect: (prompt: Prompt) => void;
    onSavePrompt: (editedPrompt: Prompt, createNewVersion: boolean) => void;
    onCreateNewPrompt: () => void;
    onCloseEditor: () => void;
};

const PromptManagement: React.FC<PromptManagementProps> = ({
    prompts,
    promptVersions,
    selectedPrompt,
    isEditorOpen,
    onPromptSelect,
    onSavePrompt,
    onCreateNewPrompt,
    onCloseEditor
}) => {
    return (
        <>
            <div className="p-4 border-b">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-2xl font-bold">Prompt Selector</h1>
                    <Button
                        onClick={onCreateNewPrompt}
                        variant="outline"
                    >
                        新規プロンプト作成
                    </Button>
                </div>
                <PromptSelector prompts={prompts} onSelect={onPromptSelect} />
            </div>

            <PromptEditor
                prompt={selectedPrompt}
                isOpen={isEditorOpen}
                onClose={onCloseEditor}
                onSave={onSavePrompt}
                versions={promptVersions.filter(v => selectedPrompt && v.promptId === selectedPrompt.id)}
            />
        </>
    );
};

export default PromptManagement;
