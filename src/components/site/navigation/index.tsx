'use client';

import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import Logo from '@/components/ui/logo';

const Navigation = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className="fixed top-0 right-0 left-0 z-10 bg-white dark:bg-gray-900 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between py-4">
        <div className="flex items-center">
          <Logo />
        </div>

        {/* Hamburger menu for mobile */}
        <button className="md:hidden" onClick={toggleMenu}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Navigation menu - desktop */}
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

        {/* Authentication buttons - desktop */}
        <aside className="hidden md:flex gap-2 items-center">
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

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <nav className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <a href="#features" onClick={(e) => { handleScrollToFeatures(e); toggleMenu(); }} className="block px-3 py-2 rounded-md text-base font-medium">Features</a>
            <a href="#pricing" onClick={(e) => { handleScrollToPricing(e); toggleMenu(); }} className="block px-3 py-2 rounded-md text-base font-medium">Pricing</a>
            <Link href="/blogs" onClick={toggleMenu} className="block px-3 py-2 rounded-md text-base font-medium">Blog</Link>
            <Link href="/demo" onClick={toggleMenu} className="block px-3 py-2 rounded-md text-base font-medium">Demo</Link>
            <Link href="/guide" onClick={toggleMenu} className="block px-3 py-2 rounded-md text-base font-medium">Guide</Link>
          </nav>
          <div className="pt-4 pb-3 border-t border-gray-700">
            <div className="flex items-center px-5">
              <Link href="/account/sign-in" onClick={toggleMenu} className="block px-3 py-2 rounded-md text-base font-medium">Login</Link>
              <Link href="/account/sign-up" onClick={toggleMenu} className="block px-3 py-2 rounded-md text-base font-medium bg-black text-white dark:bg-white dark:text-black">Try for Free</Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Navigation;
