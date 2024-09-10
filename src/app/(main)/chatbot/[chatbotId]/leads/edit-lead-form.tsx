import React, { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { updateLeadDetails } from '@/lib/queries'

const EditLeadForm = ({ lead, onClose }) => {
  const [name, setName] = useState(lead.name)
  const [email, setEmail] = useState(lead.email)
  const [leadQuality, setLeadQuality] = useState(lead.leadQuality)
  const { toast } = useToast()

  const handleSave = async () => {
    await updateLeadDetails(lead.id, { name, email, leadQuality })
    toast({ title: 'Lead updated successfully!' })
    onClose()
  }

  return (
    <div className="p-4">
      <Input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Name"
        className="mb-4"
      />
      <Input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        className="mb-4"
      />
      <select
        value={leadQuality}
        onChange={(e) => setLeadQuality(e.target.value)}
        className="mb-4 p-2 border rounded"
      >
        <option value="GOOD">Good</option>
        <option value="BAD">Bad</option>
        <option value="EXCELLENT">Excellent</option>
      </select>
      <div className="flex justify-end">
        <Button onClick={handleSave}>Save</Button>
      </div>
    </div>
  )
}

export default EditLeadForm
