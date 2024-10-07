import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import Features01 from '@/components/ui/features-01';
import Features02 from '@/components/ui/features-02';
import Features03 from '@/components/ui/features-03';
import Footer from '@/components/ui/footer';
import Hero from '@/components/ui/hero';
import Newsletter from '@/components/ui/newsletter';
import PricingTabs from '@/components/ui/pricing-tabs';
import Testimonials from '@/components/ui/testimonials';

export default async function Home() {
  return (
    <div className="bg-gradient-to-b from-white via-blue-100 to-blue-500 dark:from-zinc-900 dark:via-blue-800 dark:to-blue-900">
      {/* The gradient background */}
      <Hero />
      <Newsletter />
      <div id="features">
        <Features01 />
        <Features03 />
        <Features02 />
      </div>
      <div id="pricing">
        <PricingTabs />
      </div>
      <Testimonials />
      <Footer />
    </div>
  );
}
