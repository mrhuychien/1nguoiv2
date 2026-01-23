import {
  Navbar,
  HeroSection,
  Phase1Section,
  Phase2Section,
  Phase3Section,
  ToolsSection,
  AICouncilSection,
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
      <Phase1Section />
      <Phase2Section />
      <Phase3Section />
      <ToolsSection />
      <AICouncilSection />
      <PricingSection />
      <FAQSection />
      <CTASection />
      <Footer />
    </main>
  );
}
