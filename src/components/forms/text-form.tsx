import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'


const TextForm = ({ chatbotId, onSubmit }) => {
  const [texts, setTexts] = useState([''])

  const handleChange = (e, index) => {
    const newTexts = [...texts]
    newTexts[index] = e.target.value
    setTexts(newTexts)
  }

  const handleAddText = () => {
    setTexts([...texts, ''])
  }

  const handleRemoveText = (index) => {
    const newTexts = texts.filter((_, i) => i !== index)
    setTexts(newTexts)
  }

  const handleSubmit = () => {
    onSubmit({ content: texts.join(' ') }, 'text')
  }

  return (
    <div className="space-y-4">
      {texts.map((text, index) => (
        <div key={index} className="flex flex-col gap-2">
          <Textarea
            value={text}
            onChange={(e) => handleChange(e, index)}
            placeholder={`Text ${index + 1}`}
            className="resize-none"
          />
          <Button onClick={() => handleRemoveText(index)}>-</Button>
        </div>
      ))}
      <Button onClick={handleAddText}>Add Text</Button>
    </div>
  )
}

export default TextForm
