import React, { useState, useEffect, useRef } from 'react';
import './Navbar.css';

const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [activeSection, setActiveSection] = useState('home');
    
    const indicatorRef = useRef(null);
    const navLinksRef = useRef(null);

    useEffect(() => {
        const updateIndicator = () => {
            if (!navLinksRef.current || !indicatorRef.current) return;
            // Only show indicator on desktop
            if (window.innerWidth <= 768) return;
            
            const activeEl = navLinksRef.current.querySelector('.nav-item.active a');
            if (activeEl) {
                const { offsetLeft, offsetWidth } = activeEl.parentElement;
                indicatorRef.current.style.left = `${offsetLeft}px`;
                indicatorRef.current.style.width = `${offsetWidth}px`;
                indicatorRef.current.style.opacity = '1';
            } else {
                indicatorRef.current.style.opacity = '0';
            }
        };

        updateIndicator();
        window.addEventListener('resize', updateIndicator);
        
        // Small delay to ensure layout is done
        setTimeout(updateIndicator, 100);

        return () => window.removeEventListener('resize', updateIndicator);
    }, [activeSection, isMenuOpen]);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);

            // Scroll spy - detect active section
            const sections = ['home', 'about', 'skills', 'github-stats', 'education', 'portfolio', 'contact'];
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
        <nav className={"navbar " + (isScrolled ? 'navbar--scrolled' : '')}>
            <div className="navbar-container">
                <div className="navbar-logo">
                    <span className="logo-text">KTP</span>
                </div>

                {/* Hamburger Menu Button */}
                <button
                    className={"hamburger " + (isMenuOpen ? 'hamburger--active' : '')}
                    onClick={toggleMenu}
                    aria-label="Toggle menu"
                >
                    <span className="hamburger-line"></span>
                    <span className="hamburger-line"></span>
                    <span className="hamburger-line"></span>
                </button>

                {/* Navigation Links */}
                <ul ref={navLinksRef} className={"navbar-links " + (isMenuOpen ? 'navbar-links--open' : '')}>
                    <div ref={indicatorRef} className="nav-indicator"></div>
                    {navItems.map((item) => (
                        <li
                            key={item.id}
                            className={"nav-item " + (activeSection === item.id ? 'active' : '')}
                        >
                            <a href={"#" + item.id} onClick={closeMenu}>{item.label}</a>
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
