'use client';

import React from 'react';
import FileUpload from '../global/file-upload-backblaze'

type FileFormProps = {
  chatbotId: string;
  onFormChange: (data: any, type: string) => void;
};

const FileForm = ({ chatbotId, onFormChange }: FileFormProps) => {
  const handleFileChange = (fileUrl?: string) => {
    if (fileUrl) {
      onFormChange([{ type: 'file', fileName: fileUrl.split('/').pop(), content: fileUrl }], 'file');
    } else {
      onFormChange([], 'file');
    }
  };

  return (
    <div>
      <FileUpload onChange={handleFileChange} />
    </div>
  );
};

export default FileForm;
