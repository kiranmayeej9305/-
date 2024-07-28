'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function Newsletter() {
  const [email, setEmail] = useState('')

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    // Handle form submission logic here
    console.log(`Subscribed with email: ${email}`)
  }

  return (
    <section className="w-full py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <Card className="relative p-8 shadow-lg rounded-lg">
          <div className="flex flex-col lg:flex-row justify-between items-center">
            <CardHeader className="mb-4 lg:mr-8 lg:mb-0 text-center lg:text-left lg:w-1/2">
              <CardTitle className="text-gray-900 dark:text-gray-100 mb-2 text-xl md:text-2xl font-bold">
              Stay updated with our latest features.
              </CardTitle>
            </CardHeader>
            <CardContent className="w-full lg:w-1/2">
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row justify-center max-w-xs mx-auto sm:max-w-md lg:max-w-none">
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:border-gray-400 rounded-full px-4 py-2 mb-2 sm:mb-0 sm:mr-2 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                  placeholder="Your best email…"
                  aria-label="Your best email…"
                />
                <Button className="w-full sm:w-auto text-white bg-gray-900 dark:bg-gray-200 dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-300 px-4 py-2 rounded-full transition duration-150 ease-in-out" type="submit">
                  Subscribe
                </Button>
              </form>
            </CardContent>
          </div>
        </Card>
      </div>
    </section>
  )
}
