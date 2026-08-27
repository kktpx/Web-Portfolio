import React, { useEffect } from 'react';
import { gsap } from 'gsap';
import './PageLoader.css';

const PageLoader = ({ onComplete }) => {
    useEffect(() => {
        const tl = gsap.timeline({
            onComplete: () => {
                if (onComplete) onComplete();
            }
        });

        tl.to('.loader-logo', { opacity: 1, scale: 1, duration: 0.6, ease: 'back.out(1.7)' })
            .to('.loader-bar-fill', { width: '100%', duration: 1.2, ease: 'power2.inOut' }, '+=0.3')
            .to('.page-loader', { opacity: 0, duration: 0.5 })
            .set('.page-loader', { display: 'none' });
            
    }, [onComplete]);

    return (
        <div className="page-loader">
            <div className="loader-content">
                <div className="loader-logo">KTP</div>
                <div className="loader-bar">
                    <div className="loader-bar-fill" />
                </div>
            </div>
        </div>
    );
};

export default PageLoader;
