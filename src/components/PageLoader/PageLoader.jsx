import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import './PageLoader.css';

const LETTERS = ['K', 'T', 'P'];

// Short intro (~0.5s): letters rise in with a glow, then the panel slides up
// to reveal the page. Skipped entirely for reduced-motion users.
const PageLoader = ({ onComplete }) => {
    const rootRef = useRef(null);
    const onCompleteRef = useRef(onComplete);
    const prefersReducedMotion =
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    useEffect(() => {
        onCompleteRef.current = onComplete;
    }, [onComplete]);

    useEffect(() => {
        if (prefersReducedMotion) {
            onCompleteRef.current?.();
            return;
        }

        const ctx = gsap.context(() => {
            gsap.timeline({ onComplete: () => onCompleteRef.current?.() })
                .fromTo('.loader-letter',
                    { yPercent: 100, opacity: 0 },
                    { yPercent: 0, opacity: 1, duration: 0.2, stagger: 0.04, ease: 'power3.out' })
                .to('.loader-line', { scaleX: 1, duration: 0.2, ease: 'power2.out' }, '<0.05')
                .to(rootRef.current, { yPercent: -100, duration: 0.3, ease: 'power3.inOut' }, '+=0.02');
        }, rootRef);

        return () => ctx.revert();
    }, [prefersReducedMotion]);

    if (prefersReducedMotion) return null;

    return (
        <div className="page-loader" ref={rootRef} aria-hidden="true">
            <div className="loader-glow" />
            <div className="loader-content">
                <div className="loader-logo">
                    {LETTERS.map((letter) => (
                        <span key={letter} className="loader-letter">{letter}</span>
                    ))}
                </div>
                <div className="loader-line" />
            </div>
        </div>
    );
};

export default PageLoader;
