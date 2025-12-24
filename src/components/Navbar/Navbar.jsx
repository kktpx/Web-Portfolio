import React, { useState, useEffect } from 'react';
import './Navbar.css';

const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [activeSection, setActiveSection] = useState('home');

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);

            // Scroll spy - detect active section
            const sections = ['home', 'about', 'skills', 'education', 'portfolio', 'contact'];
            const scrollPosition = window.scrollY + 150;

            for (let i = sections.length - 1; i >= 0; i--) {
                const section = document.getElementById(sections[i]);
                if (section && section.offsetTop <= scrollPosition) {
                    setActiveSection(sections[i]);
                    break;
                }
            }
        };

        window.addEventListener('scroll', handleScroll);
        handleScroll(); // Initial check
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const closeMenu = () => {
        setIsMenuOpen(false);
    };

    const navItems = [
        { id: 'home', label: 'Home' },
        { id: 'about', label: 'About' },
        { id: 'portfolio', label: 'Portfolio' },
        { id: 'contact', label: 'Contact' }
    ];

    return (
        <nav className={`navbar ${isScrolled ? 'navbar--scrolled' : ''}`}>
            <div className="navbar-container">
                <div className="navbar-logo">
                    <span className="logo-text">KTP</span>
                </div>

                {/* Hamburger Menu Button */}
                <button
                    className={`hamburger ${isMenuOpen ? 'hamburger--active' : ''}`}
                    onClick={toggleMenu}
                    aria-label="Toggle menu"
                >
                    <span className="hamburger-line"></span>
                    <span className="hamburger-line"></span>
                    <span className="hamburger-line"></span>
                </button>

                {/* Navigation Links */}
                <ul className={`navbar-links ${isMenuOpen ? 'navbar-links--open' : ''}`}>
                    {navItems.map((item) => (
                        <li
                            key={item.id}
                            className={`nav-item ${activeSection === item.id ? 'active' : ''}`}
                        >
                            <a href={`#${item.id}`} onClick={closeMenu}>{item.label}</a>
                        </li>
                    ))}
                </ul>

                {/* Overlay for mobile menu */}
                {isMenuOpen && <div className="menu-overlay" onClick={closeMenu}></div>}
            </div>
        </nav>
    );
};

export default Navbar;
