import { useState } from "react";
import AnnouncementBar from "../components/home/AnnouncementBar";
import HeroSection from "../components/home/HeroSection";
import EventsSection from "../components/home/EventsSection";
import NoticesSection from "../components/home/NoticesSection";
import AboutSection from "../components/home/AboutSection";
import ProgramsSection from "../components/home/ProgramsSection";
import MembershipCTA from "../components/home/MembershipCTA";
import Footer from "../components/layout/Footer";

export default function Home() {
  const [showBanner, setShowBanner] = useState(true);

  return (
    <div style={{ paddingTop: 36 }}>
      {showBanner && <AnnouncementBar onClose={() => setShowBanner(false)}/>}
      <HeroSection/>
      <EventsSection/>
      <NoticesSection/>
      <AboutSection/>
      <ProgramsSection/>
      <MembershipCTA/>
      <Footer/>
    </div>
  );
}
