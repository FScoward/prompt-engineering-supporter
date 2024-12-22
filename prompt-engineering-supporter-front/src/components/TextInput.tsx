import React from 'react';
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"

interface Props {
    onSubmit: (text: string) => void;
    disabled?: boolean;
}

const TextInput: React.FC<Props> = ({ onSubmit, disabled }) => {
    const [text, setText] = React.useState('');

    const handleTextChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setText(event.target.value);
    };

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

    return (
        <div className="mt-4">
            <Textarea
                className="w-full"
                value={text}
                onChange={handleTextChange}
                onKeyDown={handleKeyDown}
                placeholder="ここにテキストを入力してください (Ctrl + Enter で送信)"
                disabled={disabled}
            />
            <Button
                className="mt-2"
                onClick={handleSubmit}
                disabled={disabled || !text.trim()}
            >
                送信
            </Button>
        </div>
    );
};

export default TextInput;