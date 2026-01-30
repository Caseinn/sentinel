import { Navbar } from "@/components/navbar";
import { HeroSection } from "@/components/landing/hero-section";
import { ProblemSolutionSection } from "@/components/landing/problem-solution-section";
import { ProductShowcaseSection } from "@/components/landing/product-showcase-section";
import { SocialProofSection } from "@/components/landing/social-proof-section";
import { TechnicalDifferentiatorsSection } from "@/components/landing/technical-differentiators-section";
import { ConversionSection } from "@/components/landing/conversion-section";
import { Footer } from "@/components/landing/footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navbar />
      <HeroSection />
      <ProblemSolutionSection />
      <ProductShowcaseSection />
      <SocialProofSection />
      <TechnicalDifferentiatorsSection />
      <ConversionSection />
      <Footer />
    </main>
  );
}
