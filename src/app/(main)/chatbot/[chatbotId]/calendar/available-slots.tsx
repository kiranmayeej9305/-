import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

// Define an interface for the slot
interface Slot {
  startTime: string;
  endTime: string;
}

export default function AvailableSlots({ chatbotId, customerEmail }) {
  const [availableSlots, setAvailableSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSlots() {
      try {
        const response = await fetch(`/api/calendar-integrations/google/available-slots?chatbotId=${chatbotId}&customerEmail=${customerEmail}`);
        const data = await response.json();
        setAvailableSlots(data.availableSlots);
      } catch (error) {
        console.error('Error fetching slots:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchSlots();
  }, [chatbotId, customerEmail]);

  const handleBookAppointment = async (slot) => {
    try {
      const response = await fetch(`/api/appointments/book`, {
        method: 'POST',
        body: JSON.stringify({ chatbotId, customerEmail, slot }),
      });
      if (response.ok) {
        alert('Appointment booked!');
      } else {
        alert('Failed to book the appointment.');
      }
    } catch (error) {
      console.error('Error booking appointment:', error);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h2>Select Available Slot</h2>
      {availableSlots.length === 0 ? (
        <p>No available slots</p>
      ) : (
        availableSlots.map((slot: Slot) => (
          <Button key={slot.startTime} onClick={() => handleBookAppointment(slot)}>
            {slot.startTime} - {slot.endTime}
          </Button>
        ))
      )}
    </div>
  );
}
