'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { subscribeToNewsletter } from '@/lib/queries'; // Import the server-side query

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      await subscribeToNewsletter(email); // Call the server-side query
      setSuccess(true);
      setEmail(''); // Reset email after success
    } catch (error) {
      setError('Subscription failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="w-full py-8 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <Card className="relative bg-white text-gray-400 shadow-md rounded-lg p-8 lg:p-2">
          <div className="flex flex-col lg:flex-row justify-between items-center">
            <CardHeader className="mb-8 lg:mr-8 lg:mb-0 text-center lg:text-left lg:w-1/2">
              <CardTitle className="text-gray-900 dark:text-gray-100 mb-4 text-3xl font-semibold">
                Stay in the Loop!
              </CardTitle>
              <p className="text-md text-gray-600">
                Subscribe now to gain <span className="font-semibold">early access</span> and receive a <span className="font-semibold">special discount</span> once our product is live.
              </p>
            </CardHeader>
            <CardContent className="w-full lg:w-1/2">
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row justify-center max-w-md mx-auto sm:max-w-lg lg:max-w-full gap-4">
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-gray-200 border-gray-300 focus:border-purple-600 focus:ring-purple-600 rounded-full px-6 py-3 text-gray-900 placeholder-gray-400"
                  placeholder="Enter your email..."
                  aria-label="Your email address"
                  required
                />
                <Button
                  className="w-full sm:w-auto btn-sm text-white bg-black dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-300 px-6 py-3 rounded-full transition duration-150 ease-in-out"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? 'Subscribing...' : 'Subscribe'}
                </Button>
              </form>
              {success && (
                <p className="text-green-500 mt-4 text-center">
                  Thank you for subscribing! You’ll be the first to know when we launch and will receive exclusive early access and discounts.
                </p>
              )}
              {error && <p className="text-red-500 mt-4 text-center">{error}</p>}
            </CardContent>
          </div>
        </Card>
      </div>
    </section>
  );
}
