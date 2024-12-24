import React, { useState, useCallback } from 'react';
import { Prompt, PromptVersion } from '../types/Prompt';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { diffChars } from 'diff';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Props {
    prompt: Prompt | null;
    versions: PromptVersion[];
    isOpen: boolean;
    onClose: () => void;
    onSave: (editedPrompt: Prompt, createNewVersion: boolean) => void;
}

const PromptEditor: React.FC<Props> = ({ prompt, versions, isOpen, onClose, onSave }) => {
    const [createNewVersion, setCreateNewVersion] = useState(false);
    const [width, setWidth] = useState(window.innerWidth * 0.7);
    const [isResizing, setIsResizing] = useState(false);
    const [selectedVersion, setSelectedVersion] = useState<PromptVersion | null>(null);
    const [isPreviewMode, setIsPreviewMode] = useState(false);
    const [editingValue, setEditingValue] = useState('');

    React.useEffect(() => {
        if (prompt) {
            setEditingValue(prompt.value);
        }
    }, [prompt]);

    const startResizing = useCallback((e: React.MouseEvent) => {
        setIsResizing(true);
        e.preventDefault();
    }, []);

    const stopResizing = useCallback(() => {
        setIsResizing(false);
    }, []);

    const resize = useCallback((e: MouseEvent) => {
        if (isResizing) {
            const newWidth = window.innerWidth - e.clientX;
            const clampedWidth = Math.min(Math.max(newWidth, 320), window.innerWidth * 0.8);
            setWidth(clampedWidth);
        }
    }, [isResizing]);

    React.useEffect(() => {
        if (isResizing) {
            window.addEventListener('mousemove', resize);
            window.addEventListener('mouseup', stopResizing);
        }
        return () => {
            window.removeEventListener('mousemove', resize);
            window.removeEventListener('mouseup', stopResizing);
        };
    }, [isResizing, resize, stopResizing]);

    React.useEffect(() => {
        const handleResize = () => {
            setWidth(window.innerWidth * 0.7);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    if (!isOpen || !prompt) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);
        const editedPrompt: Prompt = {
            ...prompt,
            label: formData.get('label') as string,
            value: editingValue,
        };
        onSave(editedPrompt, createNewVersion);
        setCreateNewVersion(false);
    };

    const handleVersionSelect = (version: PromptVersion) => {
        setSelectedVersion(version);
    };

    const renderDiff = () => {
        if (!selectedVersion || !prompt) return null;

        const diff = diffChars(selectedVersion.value, prompt.value);

        return (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-bold mb-2">現在のバージョンとの差分</h4>
                <div className="font-mono text-sm whitespace-pre-wrap bg-black text-white p-4 rounded">
                    {diff.map((part, index) => {
                        if (part.added) {
                            return (
                                <div key={index} className="text-green-400">
                                    {part.value.split('\n').map((line, i) => (
                                        <div key={`${index}-${i}`}>+ {line}</div>
                                    ))}
                                </div>
                            );
                        }
                        if (part.removed) {
                            return (
                                <div key={index} className="text-red-400">
                                    {part.value.split('\n').map((line, i) => (
                                        <div key={`${index}-${i}`}>- {line}</div>
                                    ))}
                                </div>
                            );
                        }
                        return (
                            <div key={index} className="text-gray-300">
                                {part.value.split('\n').map((line, i) => (
                                    <div key={`${index}-${i}`}>  {line}</div>
                                ))}
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    return (
        <div 
            className="fixed right-0 top-0 h-full bg-white shadow-lg overflow-hidden flex"
            style={{ width: `${width}px` }}
        >
            <div
                className="w-1 h-full cursor-ew-resize bg-gray-200 hover:bg-gray-300 active:bg-gray-400"
                onMouseDown={startResizing}
            />
            
            <div className="flex-1 p-4 overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <h2 className="text-xl font-bold">プロンプト編集</h2>
                        <p className="text-sm text-gray-500">バージョン: {prompt.version}</p>
                    </div>
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
                            <div className="flex justify-between items-center mb-1">
                                <label className="block text-sm font-medium text-gray-700">
                                    プロンプト内容
                                </label>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setIsPreviewMode(!isPreviewMode)}
                                >
                                    {isPreviewMode ? 'エディタ' : 'プレビュー'}
                                </Button>
                            </div>
                            {isPreviewMode ? (
                                <div className="min-h-[200px] p-4 border rounded-md bg-white text-gray-900 prose prose-sm max-w-none">
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
                                        {editingValue}
                                    </ReactMarkdown>
                                </div>
                            ) : (
                                <Textarea
                                    value={editingValue}
                                    onChange={(e) => setEditingValue(e.target.value)}
                                    className="w-full bg-white text-gray-900 font-mono"
                                    rows={8}
                                />
                            )}
                        </div>
                        <label className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                checked={createNewVersion}
                                onChange={(e) => setCreateNewVersion(e.target.checked)}
                                className="rounded border-gray-300"
                            />
                            <span className="text-sm text-gray-700">新しいバージョンとして保存</span>
                        </label>
                        <Button type="submit" className="w-full">
                            保存
                        </Button>
                    </div>
                </form>

                {versions.length > 0 && (
                    <div className="mt-8">
                        <h3 className="text-lg font-bold mb-4">バージョン履歴</h3>
                        <div className="space-y-4">
                            {versions.map((version) => (
                                <div 
                                    key={version.version} 
                                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                                        selectedVersion?.version === version.version
                                            ? 'border-blue-500 bg-blue-50'
                                            : 'hover:bg-gray-50'
                                    }`}
                                    onClick={() => handleVersionSelect(version)}
                                >
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="font-medium">バージョン {version.version}</span>
                                        <span className="text-sm text-gray-500">
                                            {version.createdAt.toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="text-sm text-gray-700">
                                        <p className="font-medium">ラベル: {version.label}</p>
                                        <div className="mt-2 prose prose-sm max-w-none">
                                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                {version.value}
                                            </ReactMarkdown>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {selectedVersion && renderDiff()}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PromptEditor; 