import React, { useState } from 'react'
import Navbar from './components/Navbar/Navbar'
import HeroSection from './components/HeroSection/HeroSection'
import AboutSection from './components/AboutSection/AboutSection'
import SkillsSection from './components/SkillsSection/SkillsSection'
import PortfolioSection from './components/PortfolioSection/PortfolioSection'
import ContactSection from './components/ContactSection/ContactSection'
import GithubSection from './components/GithubSection/GithubSection'
import Footer from './components/Footer/Footer'
import ScrollToTop from './components/ScrollToTop/ScrollToTop'
import PageLoader from './components/PageLoader/PageLoader'
import './App.css'

function App() {
  const [isLoaded, setIsLoaded] = useState(false);

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

export default App
