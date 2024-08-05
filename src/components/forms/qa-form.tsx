import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Trash2 } from 'lucide-react'

const QAForm = ({ chatbotId, onFormChange }) => {
  const [qas, setQAs] = useState([{ question: '', answer: '' }])

  const handleChange = (e, index, field) => {
    const newQAs = [...qas]
    newQAs[index][field] = e.target.value
    setQAs(newQAs)
    onFormChange(newQAs)
  }

  const handleAddQA = () => {
    const newQAs = [...qas, { question: '', answer: '' }]
    setQAs(newQAs)
    onFormChange(newQAs)
  }

  const handleRemoveQA = (index) => {
    const newQAs = qas.filter((_, i) => i !== index)
    setQAs(newQAs)
    onFormChange(newQAs)
  }

  return (
    <div className="space-y-4">
      {qas.map((qa, index) => (
        <div key={index} className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Input
              value={qa.question}
              onChange={(e) => handleChange(e, index, 'question')}
              placeholder={`Question ${index + 1}`}
            />
          </div>
          <Textarea
            value={qa.answer}
            onChange={(e) => handleChange(e, index, 'answer')}
            placeholder={`Answer ${index + 1}`}
          />
          <div className="flex justify-end gap-2">
            <Button onClick={() => handleRemoveQA(index)} variant="ghost" type="button">
              <Trash2 className="h-4 w-4" />
              Remove Q&A
            </Button>
          </div>
        </div>
      ))}
      <div className="flex justify-end gap-2">
        <Button onClick={handleAddQA}>
          <Plus className="h-4 w-4" />
          Add Q&A
        </Button>
      </div>
    </div>
  )
}

export default QAForm
