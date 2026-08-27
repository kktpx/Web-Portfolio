import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './Section.css';

gsap.registerPlugin(ScrollTrigger);

const Section = ({ id, className = '', isFirst = false, hasGap = true, children }) => {
    const sectionRef = useRef(null);

    useEffect(() => {
        if (isFirst || !sectionRef.current) return;

        // Check if user prefers reduced motion
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) {
            gsap.set(sectionRef.current, { opacity: 1, y: 0 });
            return;
        }

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
                    end: 'top 50%',
                    toggleActions: 'play none none none',
                },
            }
        );

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
