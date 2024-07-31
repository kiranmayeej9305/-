import { ModeToggle } from '@/components/global/mode-toggle'
import Logo from '@/components/ui/logo'
import { UserButton } from '@clerk/nextjs'
import { User } from '@clerk/nextjs/server'
import Link from 'next/link'
import React from 'react'

type Props = {
  user?: null | User
}

const Navigation = ({ user }: Props) => {
  return (
    <div className="fixed top-0 right-0 left-0 p-4 flex items-center justify-between z-10">
      <aside className="flex items-center gap-2">
      <Logo />
      </aside>
      <nav className="hidden md:block absolute left-[50%] top-[50%] transform translate-x-[-50%] translate-y-[-50%]">
        <ul className="flex items-center justify-center gap-8">
        <li>
                <Link href="/features">
                  Features
                </Link>
              </li>
              <li>
                <Link href="/pricing">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/blogs">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/demo">
                  Demo
                </Link>
              </li>
              <li>
                <Link href="/contact">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/help/frequently-asked-questions">
                  FAQ
                </Link>
              </li>
        </ul>
      </nav>
      <aside className="flex gap-2 items-center">
      <Link href="/account/signin" className="text-black font-bold">
              Login
            </Link>
      <Link href="/account/signup" className="btn-sm text-white bg-black dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-300 px-4 py-2 rounded-full transition duration-150 ease-in-out">
              Try for Free
      </Link>
        {/* <Link
          href={'/account'}
          className="bg-primary text-white p-2 px-4 rounded-md hover:bg-primary/80"
        >
          Try for Free
        </Link> */}
        {/* <UserButton /> */}
        <ModeToggle />
      </aside>
    </div>
  )
}

export default Navigation
