import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const QAForm = ({ chatbotId, onSubmit }) => {
  const [qas, setQAs] = useState([{ question: '', answer: '' }])

  const handleChange = (e, index, field) => {
    const newQAs = [...qas]
    newQAs[index][field] = e.target.value
    setQAs(newQAs)
  }

  const handleAddQA = () => {
    setQAs([...qas, { question: '', answer: '' }])
  }

  const handleRemoveQA = (index) => {
    const newQAs = qas.filter((_, i) => i !== index)
    setQAs(newQAs)
  }

  const handleSubmit = () => {
    onSubmit({ questions: qas }, 'qa')
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
            <Button onClick={() => handleRemoveQA(index)}>-</Button>
          </div>
          <Input
            value={qa.answer}
            onChange={(e) => handleChange(e, index, 'answer')}
            placeholder={`Answer ${index + 1}`}
          />
        </div>
      ))}
      <Button onClick={handleAddQA}>Add Q&A</Button>
    </div>
  )
}

export default QAForm
