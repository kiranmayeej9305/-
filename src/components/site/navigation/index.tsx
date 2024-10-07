'use client';

import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useEffect } from 'react';
import Logo from '@/components/ui/logo';

const Navigation = () => {
  const router = useRouter();
  const pathname = usePathname();

  const handleScrollToPricing = (e) => {
    e.preventDefault();
    if (pathname !== '/') {
      router.push('/?scrollTo=pricing');
    } else {
      scrollToSection('pricing');
    }
  };

  const handleScrollToFeatures = (e) => {
    e.preventDefault();
    if (pathname !== '/') {
      router.push('/?scrollTo=features');
    } else {
      scrollToSection('features');
    }
  };

  const scrollToSection = (sectionId) => {
    setTimeout(() => {
      const section = document.getElementById(sectionId);
      if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  useEffect(() => {
    if (pathname === '/' && window.location.search.includes('scrollTo=pricing')) {
      scrollToSection('pricing');
    }
    if (pathname === '/' && window.location.search.includes('scrollTo=features')) {
      scrollToSection('features');
    }
  }, [pathname]);

  return (
    <div className="fixed top-0 right-0 left-0 z-10 bg-white dark:bg-gray-900 shadow-sm">
      {/* This container ensures alignment with the rest of the page content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between py-4">
        {/* Align Logo to the left */}
        <div className="flex items-center">
          <Logo />
        </div>

        {/* Navigation menu */}
        <nav className="hidden md:flex items-center justify-center gap-8">
          <ul className="flex items-center justify-center gap-8">
            <li>
              <a href="#features" onClick={handleScrollToFeatures}>
                Features
              </a>
            </li>
            <li>
              <a href="#pricing" onClick={handleScrollToPricing}>
                Pricing
              </a>
            </li>
            <li>
              <Link href="/blogs">Blog</Link>
            </li>
            <li>
              <Link href="/demo">Demo</Link>
            </li>
            <li>
              <Link href="/guide">Guide</Link>
            </li>
          </ul>
        </nav>

        {/* Authentication buttons */}
        <aside className="flex gap-2 items-center">
          <Link href="/account/sign-in" className="text-black dark:text-white font-bold">
            Login
          </Link>
          <Link
            href="/account/sign-up"
            className="btn-sm text-white bg-black dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-300 px-4 py-2 rounded-full transition duration-150 ease-in-out"
          >
            Try for Free
          </Link>
        </aside>
      </div>
    </div>
  );
};

export default Navigation;
