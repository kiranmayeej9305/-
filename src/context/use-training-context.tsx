// context/use-training-context.tsx
'use client'
import React, { createContext, useContext, useState } from 'react';

const TrainingContext = createContext(null);

export const TrainingProvider = ({ children }) => {
  const [trainData, setTrainData] = useState([]);
  const [summary, setSummary] = useState({
    text: { count: 0, chars: 0, maxChars: 5000 },
    file: { count: 0, chars: 0, maxChars: 0 },
    qa: { count: 0, chars: 0, maxChars: 1000 },
    website: { count: 0, chars: 0, maxChars: 0 },
  });
  const [valid, setValid] = useState(false);

  return (
    <TrainingContext.Provider value={{ trainData, setTrainData, summary, setSummary, valid, setValid }}>
      {children}
    </TrainingContext.Provider>
  );
};

export const useTrainingContext = () => {
  return useContext(TrainingContext);
};
