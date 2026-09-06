import React, { useState, useEffect, useRef } from 'react'
import Navbar from '../components/Navbar/Navbar'
import HeroSection from '../components/HeroSection/HeroSection'
import AboutSection from '../components/AboutSection/AboutSection'
import SkillsSection from '../components/SkillsSection/SkillsSection'
import PortfolioSection from '../components/PortfolioSection/PortfolioSection'
import ContactSection from '../components/ContactSection/ContactSection'
import GithubSection from '../components/GithubSection/GithubSection'
import Footer from '../components/Footer/Footer'
import ScrollToTop from '../components/ScrollToTop/ScrollToTop'
import PageLoader from '../components/PageLoader/PageLoader'
import { trackEvent } from '../services/analyticsService'

function HomePage() {
  const [isLoaded, setIsLoaded] = useState(false);
  const tracked = useRef(false);

  useEffect(() => {
    if (!tracked.current) {
      tracked.current = true;
      trackEvent('page_view', { pagePath: '/' });
    }
  }, []);

  return (
    <div className="App">
      {!isLoaded && <PageLoader onComplete={() => setIsLoaded(true)} />}
      <Navbar />
      <HeroSection />
      <AboutSection />
      <SkillsSection />
      <GithubSection />
      <PortfolioSection />
      <ContactSection />
      <Footer />
      <ScrollToTop />
    </div>
  )
}

export default HomePage
