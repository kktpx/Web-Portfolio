import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './Section.css';

gsap.registerPlugin(ScrollTrigger);

const Section = ({ id, className = '', isFirst = false, hasGap = true, children }) => {
    const sectionRef = useRef(null);

    
    useEffect(() => {
        if (!sectionRef.current) return;

        // Check if user prefers reduced motion
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) {
            gsap.set(sectionRef.current, { opacity: 1, y: 0 });
            return;
        }

        const staggerElements = sectionRef.current.querySelectorAll(
            '.about-left, .about-education, .about-skills, .project-card, .contact-card, .skills-header, .marquee-track-container, .stat-card, .calendar-card, .hero-content > *, .profile-circle, .github-header'
        );

        if (isFirst) {
            if (staggerElements.length > 0) {
                gsap.fromTo(staggerElements,
                    { opacity: 0, y: 30 },
                    { opacity: 1, y: 0, duration: 0.8, stagger: 0.15, ease: 'power3.out' }
                );
            } else {
                gsap.fromTo(sectionRef.current, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8 });
            }
            return;
        }

        if (staggerElements.length > 0) {
            gsap.set(sectionRef.current, { opacity: 1, y: 0 }); // Parent is visible
            gsap.fromTo(staggerElements,
                { opacity: 0, y: 40 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.8,
                    stagger: 0.15,
                    ease: 'power3.out',
                    scrollTrigger: {
                        trigger: sectionRef.current,
                        start: 'top 85%',
                        toggleActions: 'play none none none',
                    },
                }
            );
        } else {
            // Fallback for sections without stagger targets
            gsap.fromTo(sectionRef.current,
                { opacity: 0, y: 60 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.9,
                    ease: 'power3.out',
                    scrollTrigger: {
                        trigger: sectionRef.current,
                        start: 'top 85%',
                        toggleActions: 'play none none none',
                    },
                }
            );
        }

        return () => {
            ScrollTrigger.getAll().forEach(t => {
                if (t.trigger === sectionRef.current) t.kill();
            });
        };
    }, [isFirst]);


    const classes = [
        'section',
        isFirst ? 'section--first' : '',
        hasGap ? 'section--gap' : '',
        className
    ].filter(Boolean).join(' ');

    return (
        <section ref={sectionRef} id={id} className={classes}>
            {children}
        </section>
    );
};

export default Section;
