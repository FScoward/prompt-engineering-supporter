import React, { useEffect, useRef } from 'react';

import { ChatHistory } from './ChatHistory';
import { ChatMessage } from '../types/Prompt';
import TextInput from './TextInput';

type ChatContainerProps = {
    chatHistory: ChatMessage[];
    isLoading: boolean;
    onSubmit: (text: string) => Promise<void>;
};

const ChatContainer: React.FC<ChatContainerProps> = ({ chatHistory, isLoading, onSubmit }) => {
    const chatContainerRef = useRef<HTMLDivElement>(null);

    // チャット履歴が更新されたときに最下部にスクロール
    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [chatHistory]);

    return (
        <>
            <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4">
                <ChatHistory chatHistory={chatHistory} isLoading={isLoading} />
            </div>
            <div className="border-t p-4 bg-white">
                <TextInput onSubmit={onSubmit} disabled={isLoading} />
            </div>
        </>
    );
};

export default ChatContainer;
