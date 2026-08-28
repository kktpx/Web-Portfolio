import React, { useEffect, useRef } from 'react';
import { Download } from 'lucide-react';
import Section from '../common/Section';
import ElectricBorder from '../ElectricBorder/ElectricBorder';
import TextType from '../TextType/TextType';
import ResumeButton from '../ResumeButton/ResumeButton';
import './HeroSection.css';
const profileImg = '/images/profile.webp';

const HeroSection = () => {
    const canvasRef = useRef(null);

    // Particle animation
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let animationId;
        let particles = [];

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resize();
        window.addEventListener('resize', resize);

        // Create particles
        for (let i = 0; i < 60; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                size: Math.random() * 2 + 0.5,
                speedX: (Math.random() - 0.5) * 0.3,
                speedY: (Math.random() - 0.5) * 0.3,
                opacity: Math.random() * 0.5 + 0.1,
            });
        }

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(p => {
                p.x += p.speedX;
                p.y += p.speedY;
                if (p.x < 0 || p.x > canvas.width) p.speedX *= -1;
                if (p.y < 0 || p.y > canvas.height) p.speedY *= -1;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = "rgba(255, 204, 0, " + p.opacity + " )";
                ctx.fill();
            });

            // Draw connecting lines between nearby particles
            particles.forEach((a, i) => {
                particles.slice(i + 1).forEach(b => {
                    const dist = Math.hypot(a.x - b.x, a.y - b.y);
                    if (dist < 150) {
                        ctx.beginPath();
                        ctx.moveTo(a.x, a.y);
                        ctx.lineTo(b.x, b.y);
                        ctx.strokeStyle = "rgba(255, 204, 0, " + (0.05 * (1 - dist / 150)) + " )";
                        ctx.stroke();
                    }
                });
            });
            animationId = requestAnimationFrame(animate);
        };
        animate();

        return () => {
            cancelAnimationFrame(animationId);
            window.removeEventListener('resize', resize);
        };
    }, []);

    return (
        <Section id="home" className="hero-section" isFirst={true} hasGap={true}>
            <canvas ref={canvasRef} className="hero-particles" />
            <div className="hero-container">
                <div className="hero-content">
                    <p className="greeting">Hello World, I'm</p>
                    <h1 className="name">Kittipop Sanpho</h1>
                    <TextType
                        text={["Computer Science Student", "Full-Stack Developer", "Frontend Developer"]}
                        className="title"
                        typingSpeed={80}
                        deletingSpeed={40}
                        pauseDuration={2000}
                        showCursor={true}
                        cursorCharacter="|"
                        loop={true}
                    />
                    <p className="tagline">Building elegant digital experiences with modern technologies</p>
                    <div className="hero-cta">
                        <a href="#portfolio" className="cta-btn cta-primary">View My Work</a>
                        <ResumeButton variant="secondary" />
                    </div>
                </div>
                <div className="hero-image">
                    <ElectricBorder color="#ffcc00" thickness={4} speed={0.7} chaos={0.3} circular={true}>
                        <div className="profile-circle">
                            <img src={profileImg} alt="Kittipop Sanpho" />
                        </div>
                    </ElectricBorder>
                </div>
            </div>
        </Section>
    );
};

export default HeroSection;
