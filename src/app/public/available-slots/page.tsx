'use client';

import { useSearchParams } from 'next/navigation';
import AvailableSlots from '@/components/ui/AvailableSlots';

export default function AppointmentPicker() {
  // Using Next.js hook to get query params (chatbotId and customerEmail)
  const searchParams = useSearchParams();
  const chatbotId = searchParams?.get('chatbotId') ?? '';
  const customerEmail = searchParams?.get('customerEmail') ?? '';

  // Passing chatbotId and customerEmail as props to AvailableSlots component
  return (
    <div>
      <AvailableSlots chatbotId={chatbotId} customerEmail={customerEmail} />
    </div>
  );
}
