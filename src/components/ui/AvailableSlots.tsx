'use client';

import { useState, useEffect } from 'react';
import { formatInTimeZone } from 'date-fns-tz';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useModal } from '@/providers/modal-provider';
import CustomModal from '@/components/global/custom-modal'; // Global modal
import AppointmentForm from './AppointmentForm'; // Form component inside modal
import Calendar from 'react-calendar';
import { Clock } from 'lucide-react';
import 'react-calendar/dist/Calendar.css';
import { addMonths } from 'date-fns';

// Add this interface near the top of the file
interface Slot {
  startTime: string;
  endTime: string;
  booked: boolean;
}

export default function AvailableSlots({ chatbotId, customerEmail }) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [availableSlots, setAvailableSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(false);
  const { setOpen: openModal, setClose: closeModal } = useModal(); // Open and close modal
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  useEffect(() => {
    if (selectedDate) {
      fetchSlots(selectedDate);
    }
  }, [selectedDate]);

  const fetchSlots = async (date) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/calendar-integrations/google/available-slots?chatbotId=${chatbotId}&date=${date.toISOString()}`);
      const data = await response.json();
      setAvailableSlots(data.availableSlots);
    } catch (error) {
      console.error('Error fetching slots:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookAppointment = (slot) => {
    openModal(
      <CustomModal
        title="Book an Appointment"
        subheading={`Appointment for ${formatInTimeZone(slot.startTime, timeZone, 'h:mm a')} - ${formatInTimeZone(slot.endTime, timeZone, 'h:mm a')}`}
      >
        <AppointmentForm
          slot={slot}
          chatbotId={chatbotId}
        />
      </CustomModal>
    );
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col lg:flex-row gap-8">
        <Card className="lg:w-1/3 w-full shadow-md">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Select Date</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Calendar
              onChange={(value) => {
                if (value instanceof Date) {
                  setSelectedDate(value);
                }
              }}
              value={selectedDate}
              minDate={new Date()} // Only allow current and future dates
              maxDate={addMonths(new Date(), 1)} // Allow up to 1 month in the future
              tileDisabled={({ date }) => date.getDay() === 0 || date.getDay() === 6} // Disable weekends
              className="border-none shadow-sm rounded-lg"
            />
          </CardContent>
        </Card>

        <Card className="lg:w-2/3 w-full shadow-md">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              {selectedDate
                ? `Available Slots for ${formatInTimeZone(selectedDate, timeZone, 'PP')}`
                : 'Select a Date to View Available Slots'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedDate ? (
              <>
                {loading ? (
                  <div className="mt-4">Loading...</div>
                ) : availableSlots.length === 0 ? (
                  <p className="text-gray-500 mt-4">No available slots</p>
                ) : (
                  <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {availableSlots.map((slot) => (
                      <Button
                        key={slot.startTime}
                        variant={slot.booked ? 'secondary' : 'outline'}
                        className="flex items-center justify-center text-sm p-4"
                        onClick={() => !slot.booked && handleBookAppointment(slot)}
                        disabled={slot.booked}
                      >
                        <Clock className="mr-2 h-4 w-4" />
                        {formatInTimeZone(slot.startTime, timeZone, 'h:mm a')} - {formatInTimeZone(slot.endTime, timeZone, 'h:mm a')}
                      </Button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <p className="text-gray-500">Select a date to view available slots</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
