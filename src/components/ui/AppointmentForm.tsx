'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

const schema = z.object({
  name: z.string().min(1, { message: 'Name is required' }),
  email: z.string().email({ message: 'Invalid email address' }),
  phone: z.string().min(10, { message: 'Phone number must be at least 10 digits' }).max(15, { message: 'Phone number must be maximum 15 digits' }),
  agenda: z.string().min(1, { message: 'Agenda is required' }),
});

export default function AppointmentForm({ slot, chatbotId }) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/calendar-integrations/google/book`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...data, chatbotId, slot }),
      });

      if (response.ok) {
        const result = await response.json();
        toast({
          title: 'Appointment Booked',
          description: `Your appointment has been successfully booked. Check your email for details!`,
          variant: 'default',
        });
      } else {
        toast({
          title: 'Error',
          description: 'Failed to book the appointment.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error booking appointment:', error);
      toast({
        title: 'Error',
        description: 'An error occurred while booking your appointment.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Name</label>
        <Input {...register('name')} placeholder="Your Name" />
        {errors.name && <p className="text-red-500 text-sm">{errors.name.message?.toString()}</p>}
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Email</label>
        <Input {...register('email')} placeholder="Your Email" />
        {errors.email && <p className="text-red-500 text-sm">{errors.email.message?.toString()}</p>}
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Phone</label>
        <Input {...register('phone')} placeholder="Your Phone Number" />
        {errors.phone && <p className="text-red-500 text-sm">{errors.phone.message?.toString()}</p>}
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Meeting Agenda</label>
        <Textarea {...register('agenda')} placeholder="Briefly describe the meeting agenda" />
        {errors.agenda && <p className="text-red-500 text-sm">{errors.agenda.message?.toString()}</p>}
      </div>

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? 'Booking...' : 'Book Appointment'}
      </Button>
    </form>
  );
}
