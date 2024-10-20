import { FileIcon, X } from 'lucide-react';
import Image from 'next/image';
import React from 'react';
import { Button } from '../ui/button';
import { UploadButton } from '@/lib/uploadthing';

type Props = {
  apiEndpoint: 'file' | 'avatar';
  onChange: (url?: string) => void;
  value?: string;
};

const FileUpload = ({ apiEndpoint, onChange, value }: Props) => {
  const type = value?.split('.').pop();

  if (value) {
    return (
      <div className="flex flex-col justify-center items-center">
        {type !== 'pdf' && type !== 'doc' && type !== 'docx' && type !== 'txt' ? (
          <div className="relative w-40 h-40">
            <Image
              src={value}
              alt="uploaded file"
              className="object-contain"
              fill
            />
            <button
              onClick={() => onChange('')}
              className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"
            >
              ✕
            </button>
          </div>
        ) : (
          <div className="relative flex flex-col items-center p-2 mt-2 rounded-md bg-background/10">
            <FileIcon className="h-6 w-6" />
            <a
              href={value}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-2 text-sm text-indigo-500 dark:text-indigo-400 hover:underline"
            >
              View File
            </a>
            <Button
              onClick={() => onChange('')}
              variant="ghost"
              type="button"
              className="mt-2"
            >
              <X className="h-4 w-4" />
              Remove File
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="w-full bg-muted/30 p-4 rounded-md text-center">
      <UploadButton
        endpoint={apiEndpoint as "media" | "chatbotLogo" | "avatar" | "accountLogo"}
        onClientUploadComplete={(res) => {
          const uploadedUrl = res?.[0].url;
          onChange(uploadedUrl); // Update the parent component with the new URL
        }}
        onUploadError={(error: Error) => {
          console.log(error);
        }}
      />
      {apiEndpoint === 'file' && (
        <div className="mt-4">
          <p>Drag & drop files here, or click to select files</p>
          <p>Supported File Types: .pdf, .doc, .docx, .txt</p>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
