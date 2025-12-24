import React from 'react';
import Section from '../common/Section';
import projectsData from '../../data/projects.json';
import './PortfolioSection.css';

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
                        <div key={project.id} className="project-card">
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
                                <div className="project-buttons">
                                    <a href={project.liveUrl} className="btn btn-live" target="_blank" rel="noopener noreferrer">
                                        Live
                                    </a>
                                    <a href={project.githubUrl} className="btn btn-github" target="_blank" rel="noopener noreferrer">
                                        Github
                                    </a>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </Section>
    );
};

export default PortfolioSection;
