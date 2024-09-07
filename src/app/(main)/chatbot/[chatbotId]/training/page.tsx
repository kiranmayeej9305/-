// components/forms/TrainingWrapper.tsx
import React from 'react';
import { TrainingProvider } from '@/context/use-training-context';
import TrainingPage from './training-page';
import BlurPage from '@/components/global/blur-page'; 

const TrainingWrapper = ({ params }) => {
  return (
    <BlurPage>
    <TrainingProvider>
      <TrainingPage params={params} />
    </TrainingProvider>
    </BlurPage>

  );
};

export default TrainingWrapper;
