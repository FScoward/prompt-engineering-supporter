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
        onSubmit(text);
        setText('');
    };

    return (
        <div className="mt-4">
            <Textarea
                className="w-full"
                value={text}
                onChange={handleTextChange}
                placeholder="ここにテキストを入力してください"
                disabled={disabled}
            />
            <Button
                className="mt-2"
                onClick={handleSubmit}
                disabled={disabled}
            >
                送信
            </Button>
        </div>
    );
};

export default TextInput;