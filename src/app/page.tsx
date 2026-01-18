import {
  Navbar,
  HeroSection,
  ProblemSection,
  PillarsSection,
  ToolsSection,
  PersonasSection,
  BuildInPublicSection,
  PricingSection,
  FAQSection,
  CTASection,
  Footer,
} from "@/components/landing";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <ProblemSection />
      <PillarsSection />
      <ToolsSection />
      <PersonasSection />
      <BuildInPublicSection />
      <PricingSection />
      <FAQSection />
      <CTASection />
      <Footer />
    </main>
  );
}
