import React from 'react';
import ResumeButton from '../ResumeButton/ResumeButton';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      {/* Gradient glow effect */}
      <div className="footer-glow" />
      
      <div className="footer-container">
        
        {/* Column 1: Logo & Bio */}
        <div className="footer-col footer-col-bio">
          <div className="footer-logo">
            <span className="footer-logo-text">KTP</span>
          </div>
          <p className="footer-desc">
            Computer Science student passionate about web development and creating beautiful, intuitive digital experiences.
          </p>
        </div>

        {/* Column 2: Main Menu */}
        <div className="footer-col">
          <h4 className="footer-title">Main Menu</h4>
          <ul className="footer-links">
            <li><a href="#home">Home</a></li>
            <li><a href="#about">About</a></li>
            <li><a href="#portfolio">Portfolio</a></li>
            <li><a href="#contact">Contact</a></li>
          </ul>
        </div>

        {/* Column 3: Sections */}
        <div className="footer-col">
          <h4 className="footer-title">Sections</h4>
          <ul className="footer-links">
            <li><a href="#skills">Skills</a></li>
            <li><a href="#github">Github</a></li>
            <li><a href="#education">Education</a></li>
          </ul>
        </div>

        {/* Column 4: Follow KTP */}
        <div className="footer-col">
          <h4 className="footer-title">Follow KTP</h4>
          <div className="footer-socials">
            <a href="https://github.com/kktpx" target="_blank" rel="noreferrer" className="social-pill">GitHub</a>
            <a href="https://www.linkedin.com/in/kittipop-sanpho-7b734739b/" target="_blank" rel="noreferrer" className="social-pill">LinkedIn</a>
            <ResumeButton variant="pill" />
          </div>
        </div>

      </div>

      {/* Bottom bar */}
      <div className="footer-bottom">
        <div className="footer-copy">© 2026 KTP Portfolio. All rights reserved.</div>
        <div className="footer-slogan">Crafting code with passion ✦</div>
      </div>
    </footer>
  );
};

export default Footer;
