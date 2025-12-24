import React, { useRef, useEffect, useState } from 'react';
import './Section.css';

const Section = ({ id, className = '', isFirst = false, hasGap = true, children }) => {
    const sectionRef = useRef(null);
    // First section visible immediately, others animate on scroll
    const [isVisible, setIsVisible] = useState(isFirst);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.unobserve(entry.target);
                }
            },
            {
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px'
            }
        );

        if (sectionRef.current) {
            observer.observe(sectionRef.current);
        }

        return () => {
            if (sectionRef.current) {
                observer.unobserve(sectionRef.current);
            }
        };
    }, []);

    const classes = [
        'section',
        isFirst ? 'section--first' : '',
        hasGap ? 'section--gap' : '',
        isVisible ? 'section--visible' : 'section--hidden',
        className
    ].filter(Boolean).join(' ');

    return (
        <section ref={sectionRef} id={id} className={classes}>
            {children}
        </section>
    );
};

export default Section;
