import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const WebsiteForm = ({ chatbotId, onSubmit }) => {
  const [websites, setWebsites] = useState([''])

  const handleChange = (e, index) => {
    const newWebsites = [...websites]
    newWebsites[index] = e.target.value
    setWebsites(newWebsites)
  }

  const handleAddWebsite = () => {
    setWebsites([...websites, ''])
  }

  const handleRemoveWebsite = (index) => {
    const newWebsites = websites.filter((_, i) => i !== index)
    setWebsites(newWebsites)
  }

  const handleSubmit = () => {
    onSubmit({ websites }, 'website')
  }

  return (
    <div className="space-y-4">
      {websites.map((website, index) => (
        <div key={index} className="flex items-center gap-2">
          <Input
            value={website}
            onChange={(e) => handleChange(e, index)}
            placeholder={`Website ${index + 1}`}
          />
          <Button onClick={() => handleRemoveWebsite(index)}>-</Button>
        </div>
      ))}
      <Button onClick={handleAddWebsite}>Add Website</Button>
    </div>
  )
}

export default WebsiteForm
