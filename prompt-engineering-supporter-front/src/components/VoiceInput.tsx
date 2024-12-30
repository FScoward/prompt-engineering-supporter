 
import React, { useCallback, useEffect, useRef, useState } from 'react';

import { Button } from "@/components/ui/button";

interface Props {
    onTranscript: (text: string, isFinal: boolean) => void;
    disabled?: boolean;
}

interface SpeechRecognitionEvent {
    results: {
        [index: number]: {
            [index: number]: {
                transcript: string;
                isFinal?: boolean;
            };
        } & { isFinal: boolean };
        length: number;
    };
}

interface SpeechRecognitionError {
    error: string;
}

interface SpeechRecognition extends EventTarget {
    lang: string;
    continuous: boolean;
    interimResults: boolean;
    start: () => void;
    stop: () => void;
    onstart: () => void;
    onend: () => void;
    onerror: (event: SpeechRecognitionError) => void;
    onresult: (event: SpeechRecognitionEvent) => void;
}

declare global {
    interface Window {
        webkitSpeechRecognition: new () => SpeechRecognition;
    }
}

const VoiceInput: React.FC<Props> = ({ onTranscript, disabled }) => {
    const [isListening, setIsListening] = useState(false);
    const [error, setError] = useState<string>('');
    const recognitionRef = useRef<SpeechRecognition | null>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);

    const startListening = useCallback(() => {
        if (!('webkitSpeechRecognition' in window)) {
            setError('このブラウザは音声認識をサポートしていません。');
            return;
        }

        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }

        const recognition = new window.webkitSpeechRecognition();
        recognition.lang = 'ja-JP';
        recognition.continuous = true;
        recognition.interimResults = true;

        recognition.onstart = () => {
            setIsListening(true);
            setError('');
        };

        recognition.onerror = (event) => {
            setError('音声認識エラー: ' + event.error);
            setIsListening(false);
            recognitionRef.current = null;
        };

        recognition.onend = () => {
            setIsListening(false);
            recognitionRef.current = null;
        };

        recognition.onresult = (event) => {
            const lastResult = event.results[event.results.length - 1];
            const transcript = lastResult[0].transcript;
            const isFinal = lastResult.isFinal;

            onTranscript(transcript, isFinal);

            if (isFinal) {
                recognition.stop();
                recognitionRef.current = null;
            }
        };

        recognitionRef.current = recognition;
        recognition.start();
    }, [onTranscript]);

    const stopListening = useCallback(() => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
            recognitionRef.current = null;
        }
        setIsListening(false);
    }, []);

    const handleKeyDown = useCallback((event: KeyboardEvent) => {
        if (event.code === 'Space' && !event.repeat && !disabled && !isListening) {
            event.preventDefault();
            startListening();
        }
    }, [disabled, isListening, startListening]);

    const handleKeyUp = useCallback((event: KeyboardEvent) => {
        if (event.code === 'Space') {
            event.preventDefault();
            stopListening();
        }
    }, [stopListening]);

    const handleFocus = useCallback(() => {
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
    }, [handleKeyDown, handleKeyUp]);

    const handleBlur = useCallback(() => {
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('keyup', handleKeyUp);
    }, [handleKeyDown, handleKeyUp]);

    useEffect(() => {
        const button = buttonRef.current;
        if (button) {
            button.addEventListener('focus', handleFocus);
            button.addEventListener('blur', handleBlur);

            return () => {
                button.removeEventListener('focus', handleFocus);
                button.removeEventListener('blur', handleBlur);
            };
        }
    }, [handleFocus, handleBlur]);

    return (
        <div className="flex items-center space-x-2">
            <Button
                ref={buttonRef}
                type="button"
                onMouseDown={startListening}
                onMouseUp={stopListening}
                onMouseLeave={stopListening}
                disabled={disabled || isListening}
                className={`relative ${isListening ? 'bg-red-500 hover:bg-red-600' : ''}`}
            >
                {isListening ? (
                    <>
                        <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-red-400 opacity-75"></span>
                        <span>録音中...</span>
                    </>
                ) : (
                    <>
                        <svg 
                            className="w-5 h-5 mr-2" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                        >
                            <path 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                strokeWidth={2} 
                                d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" 
                            />
                        </svg>
                        スペースキーを押して録音
                    </>
                )}
            </Button>
            {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
    );
};

export default VoiceInput;
