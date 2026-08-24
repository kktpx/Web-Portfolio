import Navbar from './components/Navbar/Navbar'
import HeroSection from './components/HeroSection/HeroSection'
import AboutSection from './components/AboutSection/AboutSection'
import SkillsSection from './components/SkillsSection/SkillsSection'
import EducationSection from './components/EducationSection/EducationSection'
import PortfolioSection from './components/PortfolioSection/PortfolioSection'
import ContactSection from './components/ContactSection/ContactSection'
import GithubSection from './components/GithubSection/GithubSection'
import Footer from './components/Footer/Footer'
import './App.css'

function App() {
  return (
    <div className="App">
      <Navbar />
      <HeroSection />
      <AboutSection />
      <SkillsSection />
      <GithubSection />
      <EducationSection />
      <PortfolioSection />
      <ContactSection />
      <Footer />
    </div>
  )
}

export default App
