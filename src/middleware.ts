import { authMiddleware } from '@clerk/nextjs'
import { NextResponse } from 'next/server'

// This example protects all routes including api/trpc routes
// Please edit this to allow other routes to be public as needed.
// See https://clerk.com/docs/references/nextjs/auth-middleware for more information about configuring your Middleware
export default authMiddleware({
  publicRoutes: [
    '/site', 
    '/api/uploadthing', 
    'accounts.google.com',
    '/api/backblazeb2', 
    '/chatbot/:chatbotId/iframe',
    '/api/calendar-integrations/google/initiate',
    '/api/calendar-integrations/google/callback',
    '/api/calendar-integrations/calendly/initiate',
    '/api/calendar-integrations/calendly/callback',
  ],
  async beforeAuth(auth, req) {},
  async afterAuth(auth, req) {
    //rewrite for domains
    const url = req.nextUrl
    const searchParams = url.searchParams.toString()
    let hostname = req.headers

    const pathWithSearchParams = `${url.pathname}${
      searchParams.length > 0 ? `?${searchParams}` : ''
    }`

    //if subdomain exists
    const customSubDomain = hostname
      .get('host')
      ?.split(`${process.env.NEXT_PUBLIC_DOMAIN}`)
      .filter(Boolean)[0]

    if (customSubDomain) {
      return NextResponse.rewrite(
        new URL(`/${customSubDomain}${pathWithSearchParams}`, req.url)
      )
    }

    if (url.pathname === '/sign-in') {
      return NextResponse.redirect(new URL(`/account/sign-in`, req.url))
    }
    if (url.pathname === '/sign-up') {
      return NextResponse.redirect(new URL(`/account/sign-up`, req.url))
    }
    if (url.pathname === '/' ||
      (url.pathname === '/site' && url.host === process.env.NEXT_PUBLIC_DOMAIN)
  ) {
    return NextResponse.rewrite(new URL('/site', req.url));
  }
  // Rewrite /blogs to /site/blogs
  if (url.pathname.startsWith('/blogs') || url.pathname.startsWith('/guide') || url.pathname.startsWith('/demo')) {
    return NextResponse.rewrite(new URL(`/site${pathWithSearchParams}`, req.url));
  }
    if (
      url.pathname.startsWith('/account') ||
      url.pathname.startsWith('/chatbot')
    ) {
      return NextResponse.rewrite(new URL(`${pathWithSearchParams}`, req.url))
    }
  },
})

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
}
