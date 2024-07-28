import Link from 'next/link'

export default function Logo() {
  return (
    <Link href="/" className="block" aria-label="InsertBot">
      <span className="text-4xl font-bold logo-stylish" style={{ display: 'flex', alignItems: 'center', fontFamily: 'Arial, sans-serif', letterSpacing: '0.02em' }}>
        <div className="bg-gradient-to-r from-primary to-secondary-foreground text-transparent bg-clip-text relative">
          <h1 className="text-4xl font-bold">
            insertbot.
          </h1>
        </div>
      </span>
    </Link>
  )
}
