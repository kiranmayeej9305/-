import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import FileUpload from '../global/file-upload'
import { X } from 'lucide-react'

const FileForm = ({ chatbotId, onFormChange }) => {
  const [files, setFiles] = useState([])

  const handleFileChange = (url) => {
    const newFiles = [...files, { url }]
    setFiles(newFiles)
    onFormChange(newFiles)
  }

  const handleRemoveFile = (index) => {
    const newFiles = files.filter((_, i) => i !== index)
    setFiles(newFiles)
    onFormChange(newFiles)
  }

  return (
    <div className="space-y-4">
      {files.map((file, index) => (
        <div key={index} className="flex items-center gap-2">
          <a href={file.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
            View File
          </a>
          <Button onClick={() => handleRemoveFile(index)} variant="ghost" type="button">
            <X className="h-4 w-4" />
          </Button>
        </div>
      ))}
      <FileUpload apiEndpoint="file" onChange={handleFileChange} />
    </div>
  )
}

export default FileForm
