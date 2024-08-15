import React, { useState, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';

type TextFormProps = {
  onFormChange: (data: { content: string }, type: string) => void;
  setValid: (isValid: boolean) => void;
};

const TextForm: React.FC<TextFormProps> = ({ onFormChange, setValid }) => {
  const [text, setText] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const isValid = text.trim().length >= 100;
    setValid(isValid);
    setError(isValid ? '' : 'Minimum 100 characters required.');
    onFormChange({ content: text.trim() }, 'text'); // Ensure to pass the trimmed content
  }, [text, setValid, onFormChange]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
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
        {error && <p className="text-red-500 text-sm">{error}</p>}
      </div>
    </div>
  );
};

export default TextForm;
