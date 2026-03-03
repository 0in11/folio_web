import HeroSection from "@/components/sections/HeroSection";
import ProjectsSection from "@/components/sections/ProjectsSection";
import CareerSection from "@/components/sections/CareerSection";
import AboutSection from "@/components/sections/AboutSection";
import SkillsSection from "@/components/sections/SkillsSection";
import CredentialsSection from "@/components/sections/CredentialsSection";
import ContactSection from "@/components/sections/ContactSection";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <ProjectsSection />
      <CareerSection />
      <AboutSection />
      <SkillsSection />
      <CredentialsSection />
      <ContactSection />
    </>
  );
}
