import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { uploadFile } from '@/lib/queries'

const PDFForm = ({ chatbotId, onSubmit }) => {
  const [pdfs, setPDFs] = useState([])

  const handleFileChange = async (e) => {
    const file = e.target.files[0]
    const fileUrl = await uploadFile(file)
    setPDFs([...pdfs, { name: file.name, url: fileUrl }])
  }

  const handleRemovePDF = (index) => {
    const newPDFs = pdfs.filter((_, i) => i !== index)
    setPDFs(newPDFs)
  }

  const handleSubmit = () => {
    onSubmit({ fileUrl: pdfs.map(pdf => pdf.url) }, 'pdf')
  }

  return (
    <div className="space-y-4">
      {pdfs.map((pdf, index) => (
        <div key={index} className="flex items-center gap-2">
          <span>{pdf.name}</span>
          <Button onClick={() => handleRemovePDF(index)}>-</Button>
        </div>
      ))}
      <input type="file" accept="application/pdf" onChange={handleFileChange} />
    </div>
  )
}

export default PDFForm
