import { Prompt, ChatMessage } from './types/Prompt';
import PromptSelector from './components/PromptSelector';
import React, { useState } from 'react';
import TextInput from './components/TextInput';
import { GoogleGenerativeAI } from '@google/generative-ai';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const App: React.FC = () => {
    const [responseText, setResponseText] = useState<string>('');
    const [tokenCount, setTokenCount] = useState<number>(0);
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
    const [inputText, setInputText] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const prompts: Prompt[] = [
        { id: '1', label: '概念を説明する', value: '概念を説明してください:', isSystemInstruction: true },
        { id: '2', label: '要約を生成する', value: '要約を生成してください:', isSystemInstruction: true },
        { id: '3', label: '例を提供する', value: '例を提供してください:', isSystemInstruction: true },
        { id: '4', label: 'コミットメッセージを生���する', value: '以下の変更内容に対する簡潔で分かりやすいGitコミットメッセージを生成してください。コミットメッセージは、変更内容を端的に表現し、他の開発者が理解しやすい形式で書いてください:', isSystemInstruction: true },
    ];

    const handlePromptSelect = (prompt: Prompt) => {
        console.log('Selected Prompt:', prompt);

        // システムインストラクションをチャット履歴に追加
        if (prompt.isSystemInstruction) {
            const systemMessage: ChatMessage = {
                role: 'system',
                content: prompt.value,
                timestamp: new Date()
            };
            setChatHistory(prev => [...prev, systemMessage]);
        }
    };

    const handleTextSubmit = async (text: string) => {
        setInputText(text);
        console.log('Submitted Text:', text);
        setResponseText(''); // Reset response text
        setTokenCount(0); // Reset token count
        setIsLoading(true); // Start loading

        // Add user message to chat history
        const userMessage: ChatMessage = {
            role: 'user',
            content: text,
            timestamp: new Date()
        };
        setChatHistory(prev => [...prev, userMessage]);

        try {
            await generateText(text);
        } catch (error) {
            console.error('Error during text generation:', error);
            setResponseText('エラーが発生しました。');
            
            // Add error message to chat history
            const errorMessage: ChatMessage = {
                role: 'assistant',
                content: 'エラーが発生しました。',
                timestamp: new Date()
            };
            setChatHistory(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false); // End loading
        }
    };

    const client = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY ?? '');

    async function generateText(text: string): Promise<void> {
        try {
            const model = client.getGenerativeModel({ model: 'gemini-pro' });

            // チャット履歴からシステムメッセージを取得
            const systemMessages = chatHistory
                .filter(msg => msg.role === 'system')
                .map(msg => ({ role: "user", parts: [{ text: msg.content }] }));

            const request = {
                contents: [
                    ...systemMessages,
                    { role: "user", parts: [{ text }] }
                ],
            };

            // Generate content
            const generationResult = await model.generateContent(request);
            const response = await generationResult.response;
            const responseText = response.text();

            // Count tokens
            const tokenCountResult = await model.countTokens(request);
            const totalTokens = tokenCountResult.totalTokens;

            console.log('リクエスト:', JSON.stringify(request, null, 2));
            console.log('レス���ンス:', JSON.stringify(response, null, 2));
            console.log('生成されたテキスト:', responseText);
            console.log('トークン数:', totalTokens);

            // Add assistant message to chat history
            const assistantMessage: ChatMessage = {
                role: 'assistant',
                content: responseText,
                timestamp: new Date()
            };
            setChatHistory(prev => [...prev, assistantMessage]);

            setResponseText(responseText);
            setTokenCount(totalTokens);
        } catch (error) {
            console.error('Gemini APIとの通信中にエラーが発生しました:', error);
            setResponseText('Gemini APIとの通信中にエラーが発生しました。');
            throw error; // Re-throw to handle in the calling function
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen">
            <div className="p-5 w-full max-w-4xl">
                <h1 className="text-2xl font-bold mb-4">Prompt Selector</h1>
                <PromptSelector prompts={prompts} onSelect={handlePromptSelect} />
                <TextInput onSubmit={handleTextSubmit} disabled={isLoading} />
                
                {/* チャット履歴の表示 */}
                <div className="mt-8">
                    <h2 className="text-xl font-bold mb-4">Chat History</h2>
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

                {/* API Communication Info */}
                {responseText && (
                    <div className="mt-4">
                        <h2 className="text-lg font-bold mb-2">API Info:</h2>
                        <p className="mt-2">Token Count: {tokenCount}</p>
                        <div className="mt-4">
                            <h3 className="text-lg font-bold mb-2">API Communication:</h3>
                            <div className="bg-gray-100 p-4 rounded-md">
                                <h4 className="font-bold">Request:</h4>
                                <pre className="whitespace-pre-wrap overflow-x-auto">
                                    {JSON.stringify({ 
                                        contents: [
                                            ...chatHistory
                                                .filter(msg => msg.role === 'system')
                                                .map(msg => ({ role: "user", parts: [{ text: msg.content }] })),
                                            { role: "user", parts: [{ text: inputText }] }
                                        ]
                                    }, null, 2)}
                                </pre>
                                <h4 className="font-bold mt-4">Response:</h4>
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
                                        {responseText}
                                    </ReactMarkdown>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default App;