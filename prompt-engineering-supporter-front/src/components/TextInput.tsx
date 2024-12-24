import React, { useState, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import VoiceInput from './VoiceInput';

interface Props {
    onSubmit: (text: string) => void;
    disabled?: boolean;
}

const TextInput: React.FC<Props> = ({ onSubmit, disabled }) => {
    const [text, setText] = useState('');
    const [isVoiceInput, setIsVoiceInput] = useState(false);
    const [voiceBuffer, setVoiceBuffer] = useState('');

    // 音声入力が終了したときに自動で送信
    useEffect(() => {
        if (!isVoiceInput && voiceBuffer.trim()) {
            onSubmit(voiceBuffer);
            setVoiceBuffer('');
        }
    }, [isVoiceInput, voiceBuffer, onSubmit]);

    const handleSubmit = () => {
        if (text.trim() && !disabled) {
            onSubmit(text);
            setText('');
        }
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
            event.preventDefault();
            handleSubmit();
        }
    };

    const handleVoiceTranscript = (transcript: string, isFinal: boolean) => {
        setIsVoiceInput(true);
        if (isFinal) {
            setVoiceBuffer(transcript);
            setIsVoiceInput(false);
        } else {
            setText(transcript);
        }
    };

    return (
        <div className="space-y-2">
            <div className="flex items-center space-x-2 mb-2">
                <VoiceInput
                    onTranscript={handleVoiceTranscript}
                    disabled={disabled}
                />
                <span className="text-sm text-gray-500">
                    Ctrl + Enter で送信
                </span>
            </div>
            <div className="flex space-x-2">
                <Textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={isVoiceInput ? "音声認識中..." : "メッセージを入力..."}
                    disabled={disabled || isVoiceInput}
                    className="flex-1"
                    rows={3}
                />
                <Button
                    onClick={handleSubmit}
                    disabled={!text.trim() || disabled || isVoiceInput}
                >
                    送信
                </Button>
            </div>
        </div>
    );
};

export default TextInput;