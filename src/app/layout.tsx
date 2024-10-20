import type { Metadata } from 'next';
import { DM_Sans } from 'next/font/google';
import './globals.css';
import { ClerkProvider, currentUser } from '@clerk/nextjs';
import { dark } from '@clerk/themes';
import { ThemeProvider } from '@/providers/theme-provider';
import ModalProvider from '@/providers/modal-provider';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as SonnarToaster } from '@/components/ui/sonner';
import { QuantitativeFeatureProvider } from '@/context/use-quantitative-feature-context';
import { PlanAddOnProvider } from '@/context/use-plan-addon-context';
import { FeatureProvider } from '@/context/use-feature-context'; 

const font = DM_Sans({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'insertbot.',
  description: 'All in one CustomBot Solution',
};

// Make the RootLayout async to get the current user
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Fetch the authenticated user from Clerk
  const authUser = await currentUser();

  // If the user is not authenticated, set userId to null
  const userId = authUser ? authUser.id : null;

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={font.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ClerkProvider appearance={{ baseTheme: dark }}>
            {/* Pass userId dynamically to the PlanAddOnProvider */}
            <PlanAddOnProvider userId={userId}>
              <QuantitativeFeatureProvider>
                <FeatureProvider>
                  <ModalProvider>
                    {children}
                  </ModalProvider>
                </FeatureProvider>
              </QuantitativeFeatureProvider>
            </PlanAddOnProvider>
            <SonnarToaster position="bottom-left" />
          </ClerkProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
