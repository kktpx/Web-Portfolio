import Navbar from './components/Navbar/Navbar'
import HeroSection from './components/HeroSection/HeroSection'
import AboutSection from './components/AboutSection/AboutSection'
import SkillsSection from './components/SkillsSection/SkillsSection'
import EducationSection from './components/EducationSection/EducationSection'
import PortfolioSection from './components/PortfolioSection/PortfolioSection'
import ContactSection from './components/ContactSection/ContactSection'
import './App.css'

function App() {
  return (
    <div className="App">
      <Navbar />
      <HeroSection />
      <AboutSection />
      <SkillsSection />
      <EducationSection />
      <PortfolioSection />
      <ContactSection />
    </div>
  )
}

export default App
