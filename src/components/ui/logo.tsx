import Link from 'next/link';
import { Montserrat } from 'next/font/google'; // Importing Google Font

const montserrat = Montserrat({ weight: ['400', '700'], subsets: ['latin'] });

export default function Logo() {
  return (
    <Link href="/" className="block" aria-label="InsertBot">
      <span
        className={`text-4xl font-bold logo-stylish ${montserrat.className}`}
        style={{ display: 'flex', alignItems: 'center', letterSpacing: '0.02em' }}
      >
        <div className="bg-gradient-to-r from-primary to-secondary-foreground text-transparent bg-clip-text relative">
          <h1 className="text-4xl font-bold">
            insertbot.
          </h1>
        </div>
      </span>
    </Link>
  );
}
