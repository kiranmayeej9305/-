'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

// Import unique images for each step
import StepImage01 from '../../../public/images/feature-step-01.png';
import StepImage02 from '../../../public/images/feature-step-02.png';
import StepImage03 from '../../../public/images/feature-step-03.png';
import StepImage04 from '../../../public/images/feature-step-04.png';

export default function Features01() {
  const [activeStep, setActiveStep] = useState<number>(1);

  const stepsData = [
    {
      id: 1,
      title: 'Import Data',
      description: 'Seamlessly connect your data sources for a tailored chatbot experience.',
      image: StepImage01,
    },
    {
      id: 2,
      title: 'Customize',
      description: 'Personalize your chatbot\'s appearance and behavior to match your brand.',
      image: StepImage02,
    },
    {
      id: 3,
      title: 'Embed',
      description: 'Effortlessly integrate your chatbot onto your website with a simple code.',
      image: StepImage03,
    },
    {
      id: 4,
      title: 'Integrate',
      description: 'Connect with your favorite tools to enhance communication and automation.',
      image: StepImage04,
    },
  ];

  return (
    <section className="bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 py-20 sm:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white sm:text-5xl mb-4">
            Four Simple Steps to AI-Powered Success
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Follow these steps to unlock the full potential of your AI chatbot and transform your customer engagement.
          </p>
        </div>

        <div className="relative">
          <div className="absolute top-0 left-8 w-1 h-full bg-gradient-to-b from-indigo-400 to-indigo-600 rounded-full hidden md:block" aria-hidden="true"></div>

          {stepsData.map((step, index) => (
            <motion.div
              key={step.id}
              className="relative mb-12 md:mb-20"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
            >
              <div className="flex flex-col md:flex-row items-center">
                <motion.div
                  className="flex-shrink-0 w-16 h-16 rounded-full border-4 border-white dark:border-gray-800 bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold text-xl flex items-center justify-center mb-4 md:mb-0 md:mr-8 z-10 shadow-lg cursor-pointer"
                  whileHover={{ scale: 1.1, boxShadow: "0 0 15px rgba(79, 70, 229, 0.6)" }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setActiveStep(step.id)}
                >
                  {step.id}
                </motion.div>
                <div className="md:flex-1">
                  <motion.div
                    className={`bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 md:p-8 transition-all duration-300 ${
                      activeStep === step.id ? 'scale-105 border-2 border-indigo-500' : ''
                    }`}
                    whileHover={{ scale: 1.03, boxShadow: "0 4px 20px rgba(79, 70, 229, 0.2)" }}
                  >
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      {step.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-6">
                      {step.description}
                    </p>
                    <div className="relative aspect-video rounded-lg overflow-hidden shadow-md border border-gray-200 dark:border-gray-700">
                      <Image
                        src={step.image}
                        alt={step.title}
                        layout="fill"
                        objectFit="cover"
                        className="transition-all duration-300 transform hover:scale-105"
                      />
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
