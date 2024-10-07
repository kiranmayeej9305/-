'use client';

import { useState, useRef, useEffect } from 'react';
import { Transition } from '@headlessui/react';
import Image from 'next/image';

// Import unique images for each tab
import FeatureImage01 from '../../../public/images/feature-step-01.png';
import FeatureImage02 from '../../../public/images/feature-step-02.png';
import FeatureImage03 from '../../../public/images/feature-step-03.png';
import FeatureImage04 from '../../../public/images/feature-step-04.png';

export default function Features01() {
  const [tab, setTab] = useState<number>(1);
  const tabs = useRef<HTMLDivElement>(null);

  const heightFix = () => {
    if (tabs.current && tabs.current.parentElement) {
      tabs.current.parentElement.style.height = `${tabs.current.clientHeight}px`;
    }
  };

  useEffect(() => {
    heightFix();
  }, [tab]);

  // Images corresponding to each tab
  const tabImages = {
    1: FeatureImage01,
    2: FeatureImage02,
    3: FeatureImage03,
    4: FeatureImage04,
  };

  // Sticky note colors for each tab
  const tabColors = {
    1: 'bg-yellow-200 dark:bg-yellow-400',
    2: 'bg-green-200 dark:bg-green-400',
    3: 'bg-pink-200 dark:bg-pink-400',
    4: 'bg-blue-200 dark:bg-blue-400',
  };

  const featuresData = [
    {
      id: 1,
      title: 'Seamlessly Import Your Data',
      description: 'Easily connect your data sources, upload files, or add websites for automated crawling. Chatbase will use your data to train a custom chatbot tailored to your business.',
    },
    {
      id: 2,
      title: 'Tailor Chatbot Behavior & Design',
      description: 'Personalize your chatbot’s appearance and behavior to reflect your brand’s identity with custom colors, logos, and voice instructions.',
    },
    {
      id: 3,
      title: 'Effortlessly Embed on Your Website',
      description: 'Integrate your chatbot onto your website with just a simple embed code. Let it handle customer interactions directly on your platform with ease.',
    },
    {
      id: 4,
      title: 'Connect With Your Favorite Tools',
      description: 'Expand your chatbot’s capabilities by integrating it with tools like Slack, WhatsApp, Zapier, and more for enhanced communication and automation.',
    },
  ];

  return (
    <section className="relative bg-zinc-50 dark:bg-zinc-900">
      <div className="py-12 md:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="max-w-3xl mx-auto text-center pb-12">
            <h2 className="font-inter-tight text-3xl md:text-4xl font-bold text-black dark:text-white mb-4">
              Unlock the Full Power of AI-Powered Chatbots
            </h2>
            <p className="text-lg text-black dark:text-white">
              Leverage cutting-edge AI to engage your customers, streamline support, and drive meaningful results—tailored to your business, no coding required.
            </p>
          </div>

          <div>
            {/* Tabs buttons */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {featuresData.map((feature) => (
                <button
                  key={feature.id}
                  className={`relative text-left px-4 py-5 rounded transform shadow-md ${tabColors[feature.id]} ${
                    tab !== feature.id
                      ? 'opacity-60 hover:opacity-100 transition'
                      : 'rotate-1 shadow-lg scale-105'
                  }`}
                  onClick={(e) => {
                    e.preventDefault();
                    setTab(feature.id);
                  }}
                >
                  {/* Pin icon */}
                  <div className="flex items-center justify-between mb-1">
                    <div className="font-inter-tight font-semibold text-black dark:text-white">{feature.title}</div>
                  </div>
                  <div className="text-sm text-black dark:text-white">{feature.description}</div>
                </button>
              ))}
            </div>

            {/* Tabs items */}
            <div className="relative lg:max-w-none [mask-image:linear-gradient(white_0%,white_calc(100%-40px),_transparent_calc(100%-1px))] -mx-6">
              <div className="relative flex flex-col pt-12 md:pt-20 mx-6" ref={tabs}>
                {featuresData.map((feature) => (
                  <Transition
                    key={feature.id}
                    show={tab === feature.id}
                    className="w-full text-center"
                    enter="transition ease-in-out duration-700 transform order-first"
                    enterFrom="opacity-0 -translate-y-4"
                    enterTo="opacity-100 translate-y-0"
                    leave="transition ease-in-out duration-300 transform absolute"
                    leaveFrom="opacity-100 translate-y-0"
                    leaveTo="opacity-0 translate-y-4"
                    beforeEnter={() => heightFix()}
                    unmount={false}
                  >
                    <div className="inline-flex relative align-top">
                      <div className={`rounded-lg overflow-hidden ${tabColors[feature.id]} p-8 shadow-lg`}>
                        <Image
                          className="object-cover object-center mx-auto"
                          src={tabImages[feature.id]}
                          width={1200} // Increased width
                          height={800} // Increased height
                          alt={`Feature ${feature.id}`}
                          style={{
                            maxWidth: '100%',
                            height: 'auto',
                          }}
                        />
                      </div>
                    </div>
                  </Transition>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
