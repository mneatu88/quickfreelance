import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import SEO, { organizationSchema, websiteSchema, aggregateRatingSchema, offerCatalogSchema } from "@/components/SEO";
import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import ReferralBanner from "@/components/landing/ReferralBanner";
import FeaturedGigsSection from "@/components/landing/FeaturedGigsSection";
import PopularServicesSection from "@/components/landing/PopularServicesSection";
import SocialProofSection from "@/components/landing/SocialProofSection";
import TrustedBySection from "@/components/landing/TrustedBySection";
import BenefitsSection from "@/components/landing/BenefitsSection";
import FeaturedCategoriesSection from "@/components/landing/FeaturedCategoriesSection";
import TrendingGigsSection from "@/components/landing/TrendingGigsSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import ProPromoSection from "@/components/landing/ProPromoSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import SuccessStoriesSection from "@/components/landing/SuccessStoriesSection";
import SellerCtaSection from "@/components/landing/SellerCtaSection";
import TestimonialsSection from "@/components/landing/TestimonialsSection";
import GuidesSection from "@/components/landing/GuidesSection";
import CtaSection from "@/components/landing/CtaSection";
import Footer from "@/components/landing/Footer";

const Index = () => {
  const [searchParams] = useSearchParams();

  // Capture referral code from URL and store for signup
  useEffect(() => {
    const ref = searchParams.get('ref');
    if (ref) {
      localStorage.setItem('qf_ref', ref);
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen relative">
      <SEO
        title="QuickFreelance - Hire Expert Freelancers in the UK"
        description="Hire skilled freelancers across the UK. Fast AI-powered matching, secure payments, no hidden fees. Web development, logo design, AI services, marketing and more."
        canonical="/"
        jsonLd={[organizationSchema, websiteSchema, aggregateRatingSchema, offerCatalogSchema]}
      />
      {/* Fixed subtle background */}
      <div
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=1920&h=1080&fit=crop&q=80')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
          filter: "brightness(0.12) blur(3px)",
        }}
      />
      <div className="fixed inset-0 z-[1] bg-background/85" />
      {/* Noise texture */}
      <div className="fixed inset-0 z-[2] pointer-events-none opacity-[0.015]" style={{
        backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
      }} />

      {/* Page content */}
      <div className="relative z-10">
        <Navbar />
        <HeroSection />
        <ReferralBanner />
        <div className="space-y-0">
          <FeaturedGigsSection />
          <PopularServicesSection />
          <SocialProofSection />
          <TrustedBySection />
          <BenefitsSection />
          <FeaturedCategoriesSection />
          <TrendingGigsSection />
          <HowItWorksSection />
          <ProPromoSection />
          <FeaturesSection />
          <SellerCtaSection />
          <SuccessStoriesSection />
          <TestimonialsSection />
          <GuidesSection />
          <CtaSection />
        </div>
        <Footer />
      </div>
    </div>
  );
};

export default Index;
