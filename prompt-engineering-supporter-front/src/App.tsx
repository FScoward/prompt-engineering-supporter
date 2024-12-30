import { ChatMessage, Prompt, PromptVersion } from './types/Prompt';
import React, { useEffect, useRef, useState } from 'react';

import { Button } from './components/ui/button';
import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';
import PromptEditor from './components/PromptEditor';
import PromptSelector from './components/PromptSelector';
import ReactMarkdown from 'react-markdown';
import TextInput from './components/TextInput';
import remarkGfm from 'remark-gfm';

type ApiType = 'gemini' | 'chatgpt';

const App: React.FC = () => {
    const [response, setResponse] = useState<{ text: string; count: number }>({
        text: '',
        count: 0,
    });
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
    const [ui, setUi] = useState<{ isLoading: boolean; isEditorOpen: boolean }>({
        isLoading: false,
        isEditorOpen: false,
    });
    const [selectedApi, setSelectedApi] = useState<ApiType>('gemini');
    const [prompt, setPrompt] = useState<{
        selected: Prompt | null;
        versions: PromptVersion[];
    }>({
        selected: null,
        versions: [],
    });
    const [prompts, setPrompts] = useState<Prompt[]>([
        {
            id: '1',
            label: '概念を説明する',
            value: '概念を説明してください:',
            isSystemInstruction: true,
            version: 1,
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            id: '2',
            label: '要約を生成する',
            value: '要約を生成してください:',
            isSystemInstruction: true,
            version: 1,
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            id: '3',
            label: '例を提供する',
            value: '例を提供してください:',
            isSystemInstruction: true,
            version: 1,
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            id: '4',
            label: 'コミットメッセージを生成する',
            value: '以下の変更内容に対する簡潔で分かりやすいGitコミットメッセージを生成してください。コミットメッセージは、変更内容を端的に表現し、他の開発者が理解しやすい形式で書いてください:',
            isSystemInstruction: true,
            version: 1,
            createdAt: new Date(),
            updatedAt: new Date(),
        },
    ]);

    const geminiClient = new GoogleGenerativeAI(
        process.env.GOOGLE_API_KEY ?? ''
    );
    const openaiClient = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY ?? '',
        dangerouslyAllowBrowser: true,
    });

    const chatContainerRef = useRef<HTMLDivElement>(null);

    // チャット履歴が更新されたときに最下部にスクロール
    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop =
                chatContainerRef.current.scrollHeight;
        }
    }, [chatHistory]);

    const handleSavePrompt = (
        editedPrompt: Prompt,
        createNewVersion: boolean
    ) => {
        const now = new Date();

        // 既存のプロンプトの場合
        if (prompts.some((p) => p.id === editedPrompt.id)) {
            if (createNewVersion) {
                // 現在のバージョンを履歴に保存
                const currentPrompt = prompts.find(
                    (p) => p.id === editedPrompt.id
                );
                if (currentPrompt) {
                    const versionHistory: PromptVersion = {
                        promptId: currentPrompt.id,
                        version: currentPrompt.version,
                        label: currentPrompt.label,
                        value: currentPrompt.value,
                        isSystemInstruction:
                            currentPrompt.isSystemInstruction ?? false,
                        createdAt: currentPrompt.createdAt,
                    };
                    setPrompt((prev) => ({
                        ...prev,
                        versions: [...prev.versions, versionHistory],
                    }));
                }

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

        // 保存後にプロンプトを選択し直す
        setPrompt({ ...prompt, selected: editedPrompt });
        setUi({ ...ui, isEditorOpen: true });
    };

    const handleApiChange = (
        event: React.ChangeEvent<HTMLSelectElement>
    ) => {
        setSelectedApi(event.target.value as ApiType);
    };

    const handleTextSubmit = async (text: string) => {
        setResponse({ text: '', count: 0 }); // Reset response
        setUi({ ...ui, isLoading: true }); // Start loading

        // Add user message to chat history
        const userMessage: ChatMessage = {
            role: 'user',
            content: text,
            timestamp: new Date(),
        };
        setChatHistory((prev) => [...prev, userMessage]);

        try {
            if (selectedApi === 'gemini') {
                await generateTextGemini(text);
            } else {
                await generateTextChatGPT(text);
            }
        } catch (error) {
            console.error('Error during text generation:', error);
            setResponse({ ...response, text: 'エラーが発生しました。' });

            // Add error message to chat history
            const errorMessage: ChatMessage = {
                role: 'assistant',
                content: 'エラーが発生しました。',
                timestamp: new Date(),
            };
            setChatHistory((prev) => [...prev, errorMessage]);
        } finally {
            setUi({ ...ui, isLoading: false }); // End loading
        }
    };

    async function generateTextGemini(text: string): Promise<void> {
        try {
            const model = geminiClient.getGenerativeModel({
                model: 'gemini-pro',
            });

            // チャット履歴を変換
            const convertedHistory = chatHistory.map((msg) => ({
                role: msg.role === 'assistant' ? 'model' : 'user',
                parts: [{ text: msg.content }],
            }));

            const request = {
                contents: [
                    ...convertedHistory,
                    { role: 'user', parts: [{ text }] },
                ],
            };

            // ストリーミングレスポンスを生成
            const result = await model.generateContentStream(request);

            // アシスタントメッセージを作成（空の状態から開始）
            const assistantMessage: ChatMessage = {
                role: 'assistant',
                content: '',
                timestamp: new Date(),
            };
            setChatHistory((prev) => [...prev, assistantMessage]);

            let fullResponse = '';
            for await (const chunk of result.stream) {
                const chunkText = chunk.text();
                fullResponse += chunkText;

                // チャット履歴の最後のメッセージを更新
                setChatHistory((prev) => {
                    const newHistory = [...prev];
                    const lastMessage = newHistory[newHistory.length - 1];
                    if (lastMessage.role === 'assistant') {
                        lastMessage.content = fullResponse;
                    }
                    return newHistory;
                });
            }

            setResponse({ ...response, text: fullResponse });
        } catch (error) {
            console.error(
                'Gemini APIとの通信中にエラーが発生しました:',
                error
            );
            setResponse({
                ...response,
                text: 'Gemini APIとの通信中にエラーが発生しました。',
            });
            throw error;
        }
    }

    async function generateTextChatGPT(text: string): Promise<void> {
        try {
            // チャット履歴を変換
            const messages = chatHistory.map((msg) => ({
                role: msg.role,
                content: msg.content,
            }));

            messages.push({ role: 'user', content: text });

            const completion = await openaiClient.chat.completions.create({
                messages: messages,
                model: 'gpt-3.5-turbo',
            });

            const responseText =
                completion.choices[0].message.content ?? '';
            const totalTokens = completion.usage?.total_tokens ?? 0;

            console.log(
                'リクエスト:',
                JSON.stringify({ messages }, null, 2)
            );
            console.log('レスポンス:', JSON.stringify(completion, null, 2));
            console.log('生成されたテキスト:', responseText);
            console.log('トークン数:', totalTokens);

            // Add assistant message to chat history
            const assistantMessage: ChatMessage = {
                role: 'assistant',
                content: responseText,
                timestamp: new Date(),
            };
            setChatHistory((prev) => [...prev, assistantMessage]);

            setResponse({ text: responseText, count: totalTokens });
        } catch (error) {
            console.error(
                'ChatGPT APIとの通信中にエラーが発生しました:',
                error
            );
            setResponse({
                ...response,
                text: 'ChatGPT APIとの通信中にエラーが発生しました。',
            });
            throw error;
        }
    }

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
        setUi({ ...ui, isEditorOpen: true });
    };

    return (
        <div className="flex justify-center min-h-screen">
            <div className="w-full max-w-4xl flex flex-col h-screen">
                {/* ヘッダー部分 */}
                <div className="p-4 border-b">
                    <div className="flex justify-between items-center mb-4">
                        <h1 className="text-2xl font-bold">Prompt Selector</h1>
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
                    <PromptSelector
                        prompts={prompts}
                        onEdit={(selectedPrompt) => {
                            setPrompt({ ...prompt, selected: selectedPrompt });
                            setUi({ ...ui, isEditorOpen: true });
                        }}
                    />
                </div>

                {/* チャット履歴（スクロール可能な領域） */}
                <div
                    ref={chatContainerRef}
                    className="flex-1 overflow-y-auto p-4"
                >
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
                                            pre: ({
                                                children,
                                                ...props
                                            }) => (
                                                <div className="overflow-auto bg-gray-800 text-white p-4 rounded-md my-2">
                                                    <pre {...props}>
                                                        {children}
                                                    </pre>
                                                </div>
                                            ),
                                            code: ({
                                                children,
                                                className,
                                                ...props
                                            }) => {
                                                const isInline = !className;
                                                return isInline ? (
                                                    <code
                                                        className="bg-gray-200 px-1 rounded"
                                                        {...props}
                                                    >
                                                        {children}
                                                    </code>
                                                ) : (
                                                    <code {...props}>
                                                        {children}
                                                    </code>
                                                );
                                            },
                                        }}
                                    >
                                        {message.content}
                                    </ReactMarkdown>
                                </div>
                            </div>
                        ))}
                        {ui.isLoading && (
                            <div className="flex items-center justify-center p-4 bg-gray-50 rounded-lg">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                                <span className="ml-3">
                                    応答を生成中...
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* 入力欄（画面下部に固定） */}
                <div className="border-t p-4 bg-white">
                    <TextInput
                        onSubmit={handleTextSubmit}
                        disabled={ui.isLoading}
                    />
                </div>
            </div>

            <PromptEditor
                prompt={prompt.selected}
                isOpen={ui.isEditorOpen}
                onClose={() => setUi({ ...ui, isEditorOpen: false })}
                onSave={handleSavePrompt}
                versions={prompt.versions.filter(
                    (v) => prompt.selected && v.promptId === prompt.selected.id
                )}
            />
        </div>
    );
};

export default App;
