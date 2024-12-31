import { ChatMessage } from '../types/Prompt';
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ChatHistoryProps {
  chatHistory: ChatMessage[];
  isLoading: boolean;
}

export const ChatHistory: React.FC<ChatHistoryProps> = ({
  chatHistory,
  isLoading,
}) => {
  return (
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
                  return isInline ? (
                    <code className="bg-gray-200 px-1 rounded" {...props}>
                      {children}
                    </code>
                  ) : (
                    <code {...props}>{children}</code>
                  );
                },
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
  );
};
