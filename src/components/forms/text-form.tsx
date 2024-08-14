// components/forms/TextForm.tsx
import React, { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';

type TextFormProps = {
  onFormChange: (data: { content: string }, type: string) => void;
};

const TextForm: React.FC<TextFormProps> = ({ onFormChange }) => {
  const [text, setText] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setText(newText);
    onFormChange({ content: newText }, 'text');
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2">
        <Textarea
          value={text}
          onChange={handleChange}
          placeholder="Enter your text here"
          className="resize-none h-60"
        />
      </div>
    </div>
  );
};

export default TextForm;
