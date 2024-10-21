import { authMiddleware } from '@clerk/nextjs'
import { NextResponse } from 'next/server'

// This example protects all routes including api/trpc routes
// Please edit this to allow other routes to be public as needed.
// See https://clerk.com/docs/references/nextjs/auth-middleware for more information about configuring your Middleware
export default authMiddleware({
  publicRoutes: [
    '/',
    '/site(.*)',  // This will make all routes starting with /site public
    '/api/uploadthing', 
    'accounts.google.com',
    '/api/backblazeb2', 
    '/chatbot/:chatbotId/iframe',
    '/api/calendar-integrations/google/initiate',
    '/api/calendar-integrations/google/callback',
    '/api/calendar-integrations/calendly/initiate',
    '/api/calendar-integrations/calendly/callback',
    '/blogs(.*)',  // Make blog routes public
    '/guide(.*)',  // Make guide routes public
    '/demo(.*)',   // Make demo routes public
    '/api(.*)',    // Make all API routes public if they don't need authentication
    '/account/sign-in',  // Add sign-in page to public routes
    '/account/sign-up',  // Add sign-up page to public routes
  ],
  async beforeAuth(auth, req) {},
  async afterAuth(auth, req) {
    const url = req.nextUrl
    const searchParams = url.searchParams.toString()
    let hostname = req.headers

    const pathWithSearchParams = `${url.pathname}${
      searchParams.length > 0 ? `?${searchParams}` : ''
    }`

    // Handle subdomain
    const customSubDomain = hostname
      .get('host')
      ?.split(`${process.env.NEXT_PUBLIC_DOMAIN}`)
      .filter(Boolean)[0]

    if (customSubDomain) {
      return NextResponse.rewrite(
        new URL(`/${customSubDomain}${pathWithSearchParams}`, req.url)
      )
    }

    // Handle root and /site routes
    if (url.pathname === '/' || (url.pathname === '/site' && url.host === process.env.NEXT_PUBLIC_DOMAIN)) {
      return NextResponse.rewrite(new URL('/site', req.url));
    }

    // Handle blog, guide, and demo routes
    if (url.pathname.startsWith('/blogs') || url.pathname.startsWith('/guide') || url.pathname.startsWith('/demo')) {
      return NextResponse.rewrite(new URL(`/site${pathWithSearchParams}`, req.url));
    }

    // Handle protected routes
    if (url.pathname.startsWith('/account') || url.pathname.startsWith('/chatbot')) {
      if (!auth.userId && !url.pathname.startsWith('/account/sign-in') && !url.pathname.startsWith('/account/sign-up')) {
        // If user is not authenticated and not on sign-in or sign-up page, redirect to sign-in
        return NextResponse.redirect(new URL('/account/sign-in', req.url));
      }
      // If authenticated or on sign-in/sign-up page, proceed normally
      return NextResponse.next();
    }

    // For all other routes, proceed as normal
    return NextResponse.next();
  },
})

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
}
