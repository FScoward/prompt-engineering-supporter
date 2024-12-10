import React from 'react';
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"

interface Props {
    onSubmit: (text: string) => void;
}

const TextInput: React.FC<Props> = ({ onSubmit }) => {
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
            />
            <Button
                className="mt-2"
                onClick={handleSubmit}
            >
                送信
            </Button>
        </div>
    );
};

export default TextInput;