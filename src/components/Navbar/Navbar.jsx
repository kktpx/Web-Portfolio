import React, { useState, useEffect, useRef } from 'react';
import ResumeButton from '../ResumeButton/ResumeButton';
import './Navbar.css';

const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'About' },
    { id: 'github-stats', label: 'GitHub' },
    { id: 'portfolio', label: 'Portfolio' },
    { id: 'contact', label: 'Contact' },
];

const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [activeSection, setActiveSection] = useState('home');

    const indicatorRef = useRef(null);
    const navLinksRef = useRef(null);
    const progressRef = useRef(null);

    // Sliding underline under the active link (desktop only)
    useEffect(() => {
        const updateIndicator = () => {
            if (!navLinksRef.current || !indicatorRef.current) return;
            if (window.innerWidth <= 968) return;

            const activeEl = navLinksRef.current.querySelector('.nav-item.active');
            if (activeEl) {
                indicatorRef.current.style.left = `${activeEl.offsetLeft}px`;
                indicatorRef.current.style.width = `${activeEl.offsetWidth}px`;
                indicatorRef.current.style.opacity = '1';
            } else {
                indicatorRef.current.style.opacity = '0';
            }
        };

        updateIndicator();
        window.addEventListener('resize', updateIndicator);
        // Re-measure after the pill resize transition and font swap settle
        const timer = setTimeout(updateIndicator, 450);

        return () => {
            clearTimeout(timer);
            window.removeEventListener('resize', updateIndicator);
        };
    }, [activeSection, isMenuOpen, isScrolled]);

    // Pill state + reading progress, batched to one update per frame
    useEffect(() => {
        let frame = 0;
        const update = () => {
            frame = 0;
            const { scrollY } = window;
            setIsScrolled(scrollY > 40);

            const max = document.documentElement.scrollHeight - window.innerHeight;
            const progress = max > 0 ? Math.min(scrollY / max, 1) : 0;
            if (progressRef.current) {
                progressRef.current.style.transform = `scaleX(${progress})`;
            }
        };
        const onScroll = () => {
            if (!frame) frame = requestAnimationFrame(update);
        };

        update();
        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onScroll);
        return () => {
            cancelAnimationFrame(frame);
            window.removeEventListener('scroll', onScroll);
            window.removeEventListener('resize', onScroll);
        };
    }, []);

    // Scroll spy: the section crossing the middle of the viewport is active
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) setActiveSection(entry.target.id);
                });
            },
            { rootMargin: '-45% 0px -50% 0px' }
        );

        navItems.forEach(({ id }) => {
            const section = document.getElementById(id);
            if (section) observer.observe(section);
        });

        return () => observer.disconnect();
    }, []);

    // Mobile menu: lock page scroll and close on Escape
    useEffect(() => {
        if (!isMenuOpen) return;

        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') setIsMenuOpen(false);
        };
        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.body.style.overflow = prevOverflow;
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isMenuOpen]);

    const toggleMenu = () => setIsMenuOpen((open) => !open);
    const closeMenu = () => setIsMenuOpen(false);

    return (
        <nav className={"navbar" + (isScrolled ? ' navbar--scrolled' : '')} aria-label="Main">
            <div className="scroll-progress" ref={progressRef} aria-hidden="true" />

            <div className="navbar-container">
                <a href="#home" className="navbar-logo" onClick={closeMenu} aria-label="Back to top">
                    <span className="logo-text">KTP</span>
                </a>

                {/* Hamburger Menu Button */}
                <button
                    className={"hamburger" + (isMenuOpen ? ' hamburger--active' : '')}
                    onClick={toggleMenu}
                    aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
                    aria-expanded={isMenuOpen}
                    aria-controls="primary-navigation"
                >
                    <span className="hamburger-line"></span>
                    <span className="hamburger-line"></span>
                    <span className="hamburger-line"></span>
                </button>

                {/* Navigation Links */}
                <ul
                    id="primary-navigation"
                    ref={navLinksRef}
                    className={"navbar-links" + (isMenuOpen ? ' navbar-links--open' : '')}
                >
                    <div ref={indicatorRef} className="nav-indicator"></div>
                    {navItems.map((item) => (
                        <li
                            key={item.id}
                            className={"nav-item" + (activeSection === item.id ? ' active' : '')}
                        >
                            <a
                                href={"#" + item.id}
                                onClick={closeMenu}
                                aria-current={activeSection === item.id ? 'location' : undefined}
                            >
                                {item.label}
                            </a>
                        </li>
                    ))}
                    <li className="nav-resume">
                        <ResumeButton variant="nav" />
                    </li>
                </ul>

                {/* Overlay for mobile menu */}
                {isMenuOpen && <div className="menu-overlay" onClick={closeMenu}></div>}
            </div>
        </nav>
    );
};

export default Navbar;
