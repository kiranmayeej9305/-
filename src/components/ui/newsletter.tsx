'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { subscribeToNewsletter } from '@/lib/queries';

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
      await subscribeToNewsletter(email);
      setSuccess(true);
      setEmail('');
    } catch (error) {
      setError('Subscription failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-gradient-to-r from-indigo-600 to-purple-600 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="px-6 py-12 sm:px-12 lg:py-16 lg:pr-0 xl:px-16 xl:py-20">
            <div className="lg:flex lg:items-center lg:justify-between">
              <div className="lg:w-0 lg:flex-1">
                <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                  Stay ahead of the curve
                </h2>
                <p className="mt-4 max-w-3xl text-lg text-gray-500">
                  Subscribe to our newsletter for exclusive updates, early access, and special discounts on our upcoming product launch.
                </p>
              </div>
              <div className="mt-8 lg:mt-0 lg:ml-8">
                <form onSubmit={handleSubmit} className="sm:flex">
                  <label htmlFor="email-address" className="sr-only">
                    Email address
                  </label>
                  <Input
                    id="email-address"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="w-full px-5 py-3 border border-gray-300 shadow-sm placeholder-gray-400 focus:ring-1 focus:ring-black focus:border-black sm:max-w-xs rounded-md"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <div className="mt-3 rounded-md shadow sm:mt-0 sm:ml-3 sm:flex-shrink-0">
                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
                    >
                      {loading ? 'Subscribing...' : 'Subscribe'}
                    </Button>
                  </div>
                </form>
                {success && (
                  <p className="mt-3 text-sm text-green-600">
                    Thank you for subscribing! We'll keep you updated on our launch.
                  </p>
                )}
                {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
