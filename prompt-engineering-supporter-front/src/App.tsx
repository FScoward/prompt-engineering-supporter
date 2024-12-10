import { Prompt } from './types/Prompt';
import PromptSelector from './components/PromptSelector';
import React from 'react';
// TextInputコンポーネントをインポート
import TextInput from './components/TextInput';

const App: React.FC = () => {
    const prompts: Prompt[] = [
        { id: '1', label: 'Explain a concept', value: 'explain' },
        { id: '2', label: 'Generate a summary', value: 'summarize' },
        { id: '3', label: 'Provide an example', value: 'example' },
    ];

    const handlePromptSelect = (selectedPrompt: Prompt) => {
        console.log('Selected Prompt:', selectedPrompt);
    };

    // テキスト送信時の処理を追加
    const handleTextSubmit = (text: string) => {
        console.log('Submitted Text:', text);
        // ここでテキストを送信する処理を行う
    };

    return (
        <div className="p-5">
            <h1 className="text-2xl font-bold mb-4">Prompt Selector</h1>
            <PromptSelector prompts={prompts} onSelect={handlePromptSelect} />

            {/* TextInputコンポーネントを使用 */}
            <TextInput onSubmit={handleTextSubmit} />
        </div>
    );
};

export default App;