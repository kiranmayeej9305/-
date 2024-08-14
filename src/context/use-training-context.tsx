// context/use-training-context.tsx
'use client'
import { createContext, useContext, useState } from 'react';

const TrainingContext = createContext();

export function useTrainingContext() {
  return useContext(TrainingContext);
}

export function TrainingProvider({ children }) {
  const [trainData, setTrainData] = useState([]);
  const [summary, setSummary] = useState({});
  const [valid, setValid] = useState(false);

  return (
    <TrainingContext.Provider
      value={{
        trainData,
        setTrainData,
        summary,
        setSummary,
        valid,
        setValid,
      }}
    >
      {children}
    </TrainingContext.Provider>
  );
}
