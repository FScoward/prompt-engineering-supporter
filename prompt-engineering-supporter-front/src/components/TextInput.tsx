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
        <div className="flex gap-2 items-end">
            <div className="flex-1">
                <Textarea
                    value={text}
                    onChange={handleTextChange}
                    onKeyDown={handleKeyDown}
                    placeholder="ここにテキストを入力してください (Ctrl + Enter で送信)"
                    disabled={disabled}
                    className="resize-none min-h-[40px] py-2"
                    rows={1}
                />
            </div>
            <Button
                onClick={handleSubmit}
                disabled={disabled || !text.trim()}
                className="h-10 px-6"
            >
                送信
            </Button>
        </div>
    );
};

export default TextInput;