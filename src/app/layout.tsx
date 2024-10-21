import type { Metadata } from 'next';
import { DM_Sans } from 'next/font/google';
import './globals.css';
import { ClerkProvider } from '@clerk/nextjs';
import { PlanAddOnProvider } from "@/context/use-plan-addon-context";
import { QuantitativeFeatureProvider } from "@/context/use-quantitative-feature-context";
import { FeatureProvider } from "@/context/use-feature-context";

const font = DM_Sans({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'insertbot.',
  description: 'All in one CustomBot Solution',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={font.className}>
          <PlanAddOnProvider>
            <QuantitativeFeatureProvider>
              <FeatureProvider>
                {children}
              </FeatureProvider>
            </QuantitativeFeatureProvider>
          </PlanAddOnProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
