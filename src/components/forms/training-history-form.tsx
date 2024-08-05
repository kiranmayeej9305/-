import React from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Trash } from 'lucide-react'

type TrainingHistoryProps = {
  history: any[]
  sourceType: string
}

const TrainingHistory: React.FC<TrainingHistoryProps> = ({ history, sourceType }) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>User</TableHead>
          {sourceType === 'TEXT' && <TableHead>Content</TableHead>}
          {sourceType === 'FILE' && <TableHead>File Name</TableHead>}
          {sourceType === 'WEBSITE' && <TableHead>URL</TableHead>}
          {sourceType === 'QA' && (
            <>
              <TableHead>Question</TableHead>
              <TableHead>Answer</TableHead>
            </>
          )}
        </TableRow>
      </TableHeader>
      <TableBody>
        {history.map((item) => (
          <TableRow key={item.id}>
            <TableCell>{new Date(item.createdAt).toLocaleString()}</TableCell>
            <TableCell>{item.User.name}</TableCell>
            {sourceType === 'TEXT' && <TableCell>{item.content}</TableCell>}
            {sourceType === 'FILE' && <TableCell>{item.fileName}</TableCell>}
            {sourceType === 'WEBSITE' && <TableCell>{item.websiteUrl}</TableCell>}
            {sourceType === 'QA' && (
              <>
                <TableCell>{item.question}</TableCell>
                <TableCell>{item.answer}</TableCell>
              </>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

export default TrainingHistory
