// components/forms/FileForm.tsx
'use client';

import React from 'react';
import FileUpload from '../global/file-upload-backblaze';

const FileForm = ({ onFormChange, setValid }) => {
  const handleFileSelect = (file) => {
    const isValid = !!file;
    setValid(isValid);

    if (file) {
      onFormChange({ type: 'file', fileName: file.name, content: file }, 'file');
    } else {
      onFormChange({}, 'file');
    }
  };

  return (
    <div>
      <FileUpload onFileSelect={handleFileSelect} />
    </div>
  );
};

export default FileForm;
