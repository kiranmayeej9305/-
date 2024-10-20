import Link from 'next/link';
import { Montserrat } from 'next/font/google'; // Importing Google Font

const montserrat = Montserrat({ weight: ['400', '700'], subsets: ['latin'] });

export default function Logo() {
  return (
    <Link href="/" className="block" aria-label="InsertBot">
      <span
        className={`text-2xl sm:text-3xl md:text-4xl font-bold logo-stylish ${montserrat.className}`}
        style={{ display: 'flex', alignItems: 'center', letterSpacing: '0.02em' }}
      >
        <div className="bg-gradient-to-r from-primary to-secondary-foreground text-transparent bg-clip-text relative">
          <h1 className="font-bold flex items-center">
            <svg className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 mr-1 sm:mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 18V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M9 15H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            insertbot.
          </h1>
        </div>
      </span>
    </Link>
  );
}
