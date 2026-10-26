import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const MENU_LINKS = [
  { href: '#home', label: 'Home' },
  { href: '#about', label: 'About' },
  { href: '#skills', label: 'Skills' },
  { href: '#github-stats', label: 'GitHub' },
  { href: '#portfolio', label: 'Portfolio' },
  { href: '#contact', label: 'Contact' },
];

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

        {/* Column 2: Menu */}
        <div className="footer-col">
          <h4 className="footer-title">Menu</h4>
          <ul className="footer-links footer-links--grid">
            {MENU_LINKS.map(({ href, label }) => (
              <li key={href}><a href={href}>{label}</a></li>
            ))}
          </ul>
        </div>

        {/* Column 3: Follow KTP */}
        <div className="footer-col">
          <h4 className="footer-title">Follow KTP</h4>
          <div className="footer-socials">
            <a href="https://github.com/kktpx" target="_blank" rel="noreferrer" className="social-pill">GitHub</a>
            <a href="https://www.linkedin.com/in/kittipop-sanpho-7b734739b/" target="_blank" rel="noreferrer" className="social-pill">LinkedIn</a>
          </div>
        </div>

      </div>

      {/* Bottom bar */}
      <div className="footer-bottom">
        <div className="footer-copy">© 2026 KTP Portfolio. All rights reserved.</div>
        <div className="footer-slogan">
          <Link to="/privacy" className="footer-privacy">Privacy Policy</Link>
          <span className="footer-sep">·</span>
          Crafting code with passion ✦
        </div>
      </div>
    </footer>
  );
};

export default Footer;
