import React from 'react'

type TrainingHistoryProps = {
  history: any[]
  sourceType: string
}

const TrainingHistory: React.FC<TrainingHistoryProps> = ({ history, sourceType }) => {
  return (
    <table className="w-full border-collapse">
      <thead>
        <tr>
          <th className="border px-4 py-2">Date</th>
          <th className="border px-4 py-2">User</th>
          {sourceType === 'TEXT' && <th className="border px-4 py-2">Content</th>}
          {sourceType === 'PDF' && <th className="border px-4 py-2">File Name</th>}
          {sourceType === 'WEBSITE' && <th className="border px-4 py-2">URL</th>}
          {sourceType === 'QA' && (
            <>
              <th className="border px-4 py-2">Question</th>
              <th className="border px-4 py-2">Answer</th>
            </>
          )}
        </tr>
      </thead>
      <tbody>
        {history.map((item) => (
          <tr key={item.id}>
            <td className="border px-4 py-2">{new Date(item.createdAt).toLocaleString()}</td>
            <td className="border px-4 py-2">{item.User.name}</td>
            {sourceType === 'TEXT' && <td className="border px-4 py-2">{item.content}</td>}
            {sourceType === 'PDF' && <td className="border px-4 py-2">{item.fileName}</td>}
            {sourceType === 'WEBSITE' && <td className="border px-4 py-2">{item.websiteUrl}</td>}
            {sourceType === 'QA' && (
              <>
                <td className="border px-4 py-2">{item.question}</td>
                <td className="border px-4 py-2">{item.answer}</td>
              </>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export default TrainingHistory
