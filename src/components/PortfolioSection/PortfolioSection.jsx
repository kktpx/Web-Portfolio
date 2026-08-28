import React from 'react';
import Section from '../common/Section';
import projectsData from '../../data/projects.json';
import './PortfolioSection.css';


const TiltCard = ({ children, className }) => {
    const ref = React.useRef(null);
    React.useEffect(() => {
        const card = ref.current;
        if (!card || window.matchMedia("(pointer: coarse)").matches) return;

        const handleMouseMove = (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = ((y - centerY) / 20) * -1;
            const rotateY = (x - centerX) / 20;
            
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
        };
        const handleMouseLeave = () => {
            card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
        };
        card.addEventListener('mousemove', handleMouseMove);
        card.addEventListener('mouseleave', handleMouseLeave);
        return () => {
            card.removeEventListener('mousemove', handleMouseMove);
            card.removeEventListener('mouseleave', handleMouseLeave);
        };
    }, []);
    return (
        <div ref={ref} className={className} style={{ transition: 'transform 0.1s ease-out' }}>
            {children}
        </div>
    );
};

const PortfolioSection = () => {
    return (
        <Section id="portfolio" className="portfolio-section" hasGap={true}>
            <div className="portfolio-container">
                <div className="portfolio-header">
                    <h2 className="portfolio-title">
                        Portfolio <span className="highlight">Showcase</span>
                    </h2>
                    <div className="title-underline"></div>
                </div>
                <div className="portfolio-grid">
                    {projectsData.map((project) => (
                        <TiltCard key={project.id} className="project-card">
                            <div className="project-image">
                                {project.image ? (
                                    <img src={project.image} alt={project.title} />
                                ) : (
                                    <div className="image-placeholder"></div>
                                )}
                            </div>
                            <div className="project-content">
                                <h3 className="project-title">{project.title}</h3>
                                <p className="project-description">{project.description}</p>
                                {project.tech && (
                                    <div className="project-tech">
                                        {project.tech.map((t, i) => (
                                            <span key={i} className="tech-tag">{t}</span>
                                        ))}
                                    </div>
                                )}
                                <div className="project-buttons">
                                    <a href={project.liveUrl} className="btn btn-live" target="_blank" rel="noopener noreferrer">
                                        Live
                                    </a>
                                    <a href={project.githubUrl} className="btn btn-github" target="_blank" rel="noopener noreferrer">
                                        Github
                                    </a>
                                </div>
                            </div>
                        </TiltCard>
                    ))}
                </div>
            </div>
        </Section>
    );
};

export default PortfolioSection;
