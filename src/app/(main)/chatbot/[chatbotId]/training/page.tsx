// components/forms/TrainingWrapper.tsx
import React from 'react';
import { TrainingProvider } from '@/context/use-training-context';
import TrainingPage from './training-page';

const TrainingWrapper = ({ params }) => {
  return (
    <TrainingProvider>
      <TrainingPage params={params} />
    </TrainingProvider>
  );
};

export default TrainingWrapper;
