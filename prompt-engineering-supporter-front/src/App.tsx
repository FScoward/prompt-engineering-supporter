import { Prompt } from './types/Prompt';
import PromptSelector from './components/PromptSelector';
import React, { useState } from 'react';
import TextInput from './components/TextInput';
import { GoogleGenerativeAI } from '@google/generative-ai';

const App: React.FC = () => {
    const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
    const [responseText, setResponseText] = useState<string>('');
    const [tokenCount, setTokenCount] = useState<number>(0);

    const prompts: Prompt[] = [
        { id: '1', label: '概念を説明する', value: '概念を説明してください:' },
        { id: '2', label: '要約を生成する', value: '要約を生成してください:' },
        { id: '3', label: '例を提供する', value: '例を提供してください:' },
    ];

    const handlePromptSelect = (selectedPrompt: Prompt) => {
        console.log('Selected Prompt:', selectedPrompt);
        setSelectedPrompt(selectedPrompt);
    };

    const handleTextSubmit = async (text: string) => {
        console.log('Submitted Text:', text);
        setResponseText(''); // Reset response text
        setTokenCount(0); // Reset token count
        try {
            if (selectedPrompt) {
                await generateText(`${selectedPrompt.value} ${text}`);
            } else {
                await generateText(text);
            }
        } catch (error) {
            console.error('Error during text generation:', error);
            setResponseText('エラーが発生しました。');
        }
    };

    const client = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);


    async function generateText(prompt: string): Promise<void> {
        try {
            const model = client.getGenerativeModel({ model: 'gemini-pro' });

            const request = {
                contents: [{ role: "user", parts: [{ text: prompt }] }],
            };

            // Generate content
            const generationResult = await model.generateContent(request);
            const response = await generationResult.response;
            const text = response.text();

            // Count tokens
            const tokenCountResult = await model.countTokens(request);
            const totalTokens = tokenCountResult.totalTokens;

            console.log('リクエスト:', JSON.stringify(request, null, 2));
            console.log('レスポンス:', JSON.stringify(response, null, 2));
            console.log('生成されたテキスト:', text);
            console.log('トークン数:', totalTokens);

            setResponseText(text);
            setTokenCount(totalTokens);
        } catch (error) {
            console.error('Gemini APIとの通信中にエラーが発生しました:', error);
            setResponseText('Gemini APIとの通信中にエラーが発生しました。');
        }
    }

    return (
        <div className="flex justify-center items-center h-screen">
            <div className="p-5">
                <h1 className="text-2xl font-bold mb-4">Prompt Selector</h1>
                <PromptSelector prompts={prompts} onSelect={handlePromptSelect} />
                <TextInput onSubmit={handleTextSubmit} />
                {responseText && (
                    <div className="mt-4">
                        <h2 className="text-lg font-bold mb-2">Response:</h2>
                        <p>{responseText}</p>
                        <p className="mt-2">Token Count: {tokenCount}</p>
                        <div className="mt-4">
                            <h3 className="text-lg font-bold mb-2">API Communication:</h3>
                            <div className="bg-gray-100 p-4 rounded-md">
                                <h4 className="font-bold">Request:</h4>
                                <pre className="whitespace-pre-wrap overflow-x-auto">
                                    {JSON.stringify({ role: "user", parts: [{ text: selectedPrompt ? `${selectedPrompt.value} ${responseText}` : responseText }] }, null, 2)}
                                </pre>
                                <h4 className="font-bold mt-4">Response:</h4>
                                <pre className="whitespace-pre-wrap overflow-x-auto">
                                    {responseText}
                                </pre>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default App;