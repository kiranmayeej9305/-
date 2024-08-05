import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Trash2 } from 'lucide-react'

const TextForm = ({ chatbotId, onFormChange }) => {
  const [texts, setTexts] = useState([''])

  const handleChange = (e, index) => {
    const newTexts = [...texts]
    newTexts[index] = e.target.value
    setTexts(newTexts)
    onFormChange(newTexts.map(content => ({ content })))
  }

  const handleAddText = () => {
    const newTexts = [...texts, '']
    setTexts(newTexts)
    onFormChange(newTexts.map(content => ({ content })))
  }

  const handleRemoveText = (index) => {
    const newTexts = texts.filter((_, i) => i !== index)
    setTexts(newTexts)
    onFormChange(newTexts.map(content => ({ content })))
  }

  return (
    <div className="space-y-4">
      {texts.map((text, index) => (
        <div key={index} className="flex flex-col gap-2">
          <Textarea
            value={text}
            onChange={(e) => handleChange(e, index)}
            placeholder={`Text ${index + 1}`}
            className="resize-none h-60"
          />
        </div>
      ))}
    </div>
  )
}

export default TextForm
