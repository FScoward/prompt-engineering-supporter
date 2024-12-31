import { ApiType, useApi } from './hooks/useApi';
import { ChatMessage, Prompt, PromptVersion } from './types/Prompt';
import React, { useEffect, useRef, useState } from 'react';

import { Button } from './components/ui/button';
import PromptEditor from './components/PromptEditor';
import PromptSelector from './components/PromptSelector';
import ReactMarkdown from 'react-markdown';
import TextInput from './components/TextInput';
import remarkGfm from 'remark-gfm';

const App: React.FC = () => {
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
    const [inputText, setInputText] = useState<string>('');
    const [isEditorOpen, setIsEditorOpen] = useState<boolean>(false);
    const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
    const [selectedApi, setSelectedApi] = useState<ApiType>('gemini');
    const [promptVersions, setPromptVersions] = useState<PromptVersion[]>([]);
    const [prompts, setPrompts] = useState<Prompt[]>([
        { 
            id: '1', 
            label: '概念を説明する', 
            value: '概念を説明してください:', 
            isSystemInstruction: true,
            version: 1,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        { 
            id: '2', 
            label: '要約を生成する', 
            value: '要約を生成してください:', 
            isSystemInstruction: true,
            version: 1,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        { 
            id: '3', 
            label: '例を提供する', 
            value: '例を提供してください:', 
            isSystemInstruction: true,
            version: 1,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        { 
            id: '4', 
            label: 'コミットメッセージを生成する', 
            value: '以下の変更内容に対する簡潔で分かりやすいGitコミットメッセージを生成してください。コミットメッセージは、変更内容を端的に表現し、他の開発者が理解しやすい形式で書いてください:', 
            isSystemInstruction: true,
            version: 1,
            createdAt: new Date(),
            updatedAt: new Date()
        },
    ]);

    const { isLoading, generateText } = useApi();
    const chatContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [chatHistory]);

    const handlePromptSelect = (prompt: Prompt) => {
        setChatHistory([]);
        setInputText('');
        setSelectedPrompt(prompt);

        if (prompt.isSystemInstruction) {
            const systemMessage: ChatMessage = {
                role: 'system',
                content: prompt.value,
                timestamp: new Date()
            };
            setChatHistory([systemMessage]);
        }
    };

    const handleSavePrompt = (editedPrompt: Prompt, createNewVersion: boolean) => {
        const now = new Date();
        if (prompts.some(p => p.id === editedPrompt.id)) {
            if (createNewVersion) {
                const currentPrompt = prompts.find(p => p.id === editedPrompt.id);
                if (currentPrompt) {
                    const versionHistory: PromptVersion = {
                        promptId: currentPrompt.id,
                        version: currentPrompt.version,
                        label: currentPrompt.label,
                        value: currentPrompt.value,
                        isSystemInstruction: currentPrompt.isSystemInstruction ?? false,
                        createdAt: currentPrompt.createdAt
                    };
                    setPromptVersions(prev => [...prev, versionHistory]);
                }
                setPrompts(prev => prev.map(p => 
                    p.id === editedPrompt.id 
                        ? { ...editedPrompt, version: (editedPrompt.version || 0) + 1, updatedAt: now }
                        : p
                ));
            } else {
                setPrompts(prev => prev.map(p => 
                    p.id === editedPrompt.id 
                        ? { ...editedPrompt, updatedAt: now }
                        : p
                ));
            }
        } else {
            const newPrompt: Prompt = {
                ...editedPrompt,
                version: 1,
                createdAt: now,
                updatedAt: now
            };
            setPrompts(prev => [...prev, newPrompt]);
        }
        setSelectedPrompt(editedPrompt);
        setIsEditorOpen(true);
    };

    const handleApiChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedApi(event.target.value as ApiType);
    };

    const handleTextSubmit = async (text: string) => {
        const userMessage: ChatMessage = {
            role: 'user',
            content: text,
            timestamp: new Date()
        };
        setChatHistory(prev => [...prev, userMessage]);

        try {
            await generateText(text, chatHistory, selectedApi, (message) => {
                setChatHistory(prev => [...prev, message]);
            });
        } catch (error) {
            const errorMessage: ChatMessage = {
                role: 'assistant',
                content: 'エラーが発生しました。',
                timestamp: new Date()
            };
            setChatHistory(prev => [...prev, errorMessage]);
        }
    };

    const handleCreateNewPrompt = () => {
        const now = new Date();
        setSelectedPrompt({
            id: (prompts.length + 1).toString(),
            label: '新しいプロンプト',
            value: '',
            isSystemInstruction: true,
            version: 1,
            createdAt: now,
            updatedAt: now
        });
        setIsEditorOpen(true);
    };

    return (
        <div className="flex justify-center min-h-screen">
            <div className="w-full max-w-4xl flex flex-col h-screen">
                <div className="p-4 border-b">
                    <div className="flex justify-between items-center mb-4">
                        <h1 className="text-2xl font-bold">Prompt Engineering Supporter</h1>
                        <Button
                            onClick={handleCreateNewPrompt}
                            variant="outline"
                        >
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
                    <div className="space-y-2">
                        <PromptSelector prompts={prompts} onSelect={handlePromptSelect} />
                        {selectedPrompt && (
                            <Button 
                                onClick={() => setIsEditorOpen(true)}
                                variant="outline"
                                className="w-full mt-2"
                            >
                                選択中のプロンプトを編集
                            </Button>
                        )}
                    </div>
                </div>

                <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4">
                    <div className="space-y-4">
                        {chatHistory.map((message, index) => (
                            <div
                                key={index}
                                className={`p-4 rounded-lg ${
                                    message.role === 'user'
                                        ? 'bg-blue-100 ml-auto'
                                        : message.role === 'system'
                                        ? 'bg-yellow-100'
                                        : 'bg-gray-100'
                                } max-w-3xl`}
                            >
                                <div className="flex items-center mb-2">
                                    <span className="font-bold">
                                        {message.role === 'user' 
                                            ? 'You' 
                                            : message.role === 'system'
                                            ? 'System'
                                            : 'Assistant'}
                                    </span>
                                    <span className="text-sm text-gray-500 ml-2">
                                        {message.timestamp.toLocaleTimeString()}
                                    </span>
                                </div>
                                <div className="prose prose-sm max-w-none">
                                    <ReactMarkdown 
                                        remarkPlugins={[remarkGfm]}
                                        components={{
                                            pre: ({ children, ...props }) => (
                                                <div className="overflow-auto bg-gray-800 text-white p-4 rounded-md my-2">
                                                    <pre {...props}>{children}</pre>
                                                </div>
                                            ),
                                            code: ({ children, className, ...props }) => {
                                                const isInline = !className;
                                                return isInline 
                                                    ? <code className="bg-gray-200 px-1 rounded" {...props}>{children}</code>
                                                    : <code {...props}>{children}</code>;
                                            }
                                        }}
                                    >
                                        {message.content}
                                    </ReactMarkdown>
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex items-center justify-center p-4 bg-gray-50 rounded-lg">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                                <span className="ml-3">応答を生成中...</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="border-t p-4 bg-white">
                    <TextInput onSubmit={handleTextSubmit} disabled={isLoading} />
                </div>
            </div>

            <PromptEditor
                prompt={selectedPrompt}
                isOpen={isEditorOpen}
                onClose={() => setIsEditorOpen(false)}
                onSave={handleSavePrompt}
                versions={promptVersions.filter(v => selectedPrompt && v.promptId === selectedPrompt.id)}
            />
        </div>
    );
};

export default App;