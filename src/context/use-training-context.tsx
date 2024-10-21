// context/use-training-context.tsx
'use client'
import { createContext, useContext, useState, Dispatch, SetStateAction, ReactNode } from 'react';

interface TrainingContextType {
  trainData: any[];
  setTrainData: Dispatch<SetStateAction<any[]>>;
  summary: Record<string, any>;
  setSummary: Dispatch<SetStateAction<Record<string, any>>>;
  valid: boolean;
  setValid: Dispatch<SetStateAction<boolean>>;
}

const TrainingContext = createContext<TrainingContextType | null>(null);

export function useTrainingContext(): TrainingContextType {
  const context = useContext(TrainingContext);
  if (context === null) {
    throw new Error('useTrainingContext must be used within a TrainingProvider');
  }
  return context;
}

interface TrainingProviderProps {
  children: ReactNode;
}

export function TrainingProvider({ children }: TrainingProviderProps) {
  const [trainData, setTrainData] = useState<any[]>([]);
  const [summary, setSummary] = useState<Record<string, any>>({});
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
