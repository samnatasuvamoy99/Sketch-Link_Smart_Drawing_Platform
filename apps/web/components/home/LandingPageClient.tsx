"use client";

import { useState, useEffect } from "react";
import {
  Navbar,
  HeroSection,
  FeaturesSection,
  AIChatSection,
  PricingFooter,
} from "../landingpage";

const SECTIONS = ["hero", "features", "aichat", "pricing"] as const;

export default function HomePageClient() {
  const [activeSection, setActiveSection] = useState<string>("hero");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      { threshold: 0.35 }
    );

    SECTIONS.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <main>
      <Navbar activeSection={activeSection} />
      <HeroSection />
      <FeaturesSection />
      <AIChatSection />
      <PricingFooter />
    </main>
  );
}