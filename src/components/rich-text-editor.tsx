import React, { useRef } from 'react';
import dynamic from 'next/dynamic';
import 'react-quill/dist/quill.snow.css';

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange }) => {

  const modules = {
    toolbar: [
      [{ 'header': '1'}, {'header': '2'}, {'header': '3'}, {'header': '4'}, {'header': '5'}, {'header': '6'}, { 'font': [] }, { 'size': [] }], // Added font and size options
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{ 'align': [] }],
      [{ 'color': [] }, { 'background': [] }],
      ['link', 'image', 'video'],
      ['code'],
      ['clean']
    ],
  };

  return (
    <ReactQuill
      value={value}
      onChange={onChange}
      modules={modules}
      theme="snow"
      className="h-[300px]" // Adjust the height as needed
    />
  );
};

export default RichTextEditor;
