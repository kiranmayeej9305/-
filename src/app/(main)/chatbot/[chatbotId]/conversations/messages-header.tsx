// components/messages-header.tsx
'use client';

import { useFlyoutContext } from '@/context/flyout-context';

export default function MessagesHeader() {
  const { flyoutOpen, setFlyoutOpen } = useFlyoutContext();

  return (
    <div className="sticky top-0 bg-slate-50 dark:bg-[#161F32] border-b border-slate-200 dark:border-slate-700 z-10">
      <div className="flex items-center justify-between px-4 sm:px-6 md:px-5 h-16">
        <div className="flex items-center">
          <button
            className="md:hidden text-slate-400 hover:text-slate-500 mr-4"
            onClick={() => setFlyoutOpen(!flyoutOpen)}
            aria-controls="messages-sidebar"
            aria-expanded={flyoutOpen}
          >
            <span className="sr-only">Toggle sidebar</span>
            <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
              <path d="M3 12h18M9 6l6 6-6 6" />
            </svg>
          </button>
          <h2 className="text-lg font-medium text-slate-900 dark:text-slate-100">Messages</h2>
        </div>
      </div>
    </div>
  );
}
