import React, { useState, useEffect, useRef, useCallback } from 'react';
import Section from '../common/Section';
import { getPublishedProjects } from '../../services/projectService';
import { trackEvent } from '../../services/analyticsService';
import ProjectLightbox from './ProjectLightbox';
import './PortfolioSection.css';

const PortfolioSection = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lightbox, setLightbox] = useState(null);
    const closeLightbox = useCallback(() => setLightbox(null), []);

    useEffect(() => {
        getPublishedProjects()
            .then((data) => {
                setProjects(data.map(p => ({
                    id: p.id,
                    title: p.title,
                    description: p.description,
                    image: p.image_url,
                    liveUrl: p.live_url,
                    githubUrl: p.github_url,
                    tech: p.tech || [],
                })));
            })
            .catch((err) => {
                console.error('Failed to load projects:', err);
                setError('Unable to load projects. Please try again later.');
            })
            .finally(() => setLoading(false));
    }, []);

    const viewedProjects = useRef(new Set());

    useEffect(() => {
        if (!projects.length) return;
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const projectId = entry.target.dataset.projectId;
                        if (projectId && !viewedProjects.current.has(projectId)) {
                            viewedProjects.current.add(projectId);
                            trackEvent('project_view', { projectId });
                        }
                    }
                });
            },
            { threshold: 0.5 }
        );

        document.querySelectorAll('.project-card').forEach((card) => {
            observer.observe(card);
        });

        return () => observer.disconnect();
    }, [projects]);

    return (
        <Section id="portfolio" className="portfolio-section" hasGap={true}>
            <div className="portfolio-container">
                <div className="portfolio-header">
                    <h2 className="portfolio-title">
                        Portfolio <span className="highlight">Showcase</span>
                    </h2>
                    <div className="title-underline"></div>
                </div>

                {loading && (
                    <div className="portfolio-loading">
                        <div className="portfolio-spinner"></div>
                        <p>Loading projects...</p>
                    </div>
                )}

                {error && (
                    <div className="portfolio-error">
                        <p>{error}</p>
                    </div>
                )}

                {!loading && !error && projects.length === 0 && (
                    <div className="portfolio-empty">
                        <p>No projects to display yet.</p>
                    </div>
                )}

                {!loading && !error && projects.length > 0 && (
                    <div className="portfolio-grid">
                        {projects.map((project) => (
                            <article key={project.id} className="project-card" data-project-id={project.id}>
                                {project.image ? (
                                    <button
                                        type="button"
                                        className="project-image"
                                        onClick={() => setLightbox(project)}
                                        aria-label={`View ${project.title} screenshot`}
                                    >
                                        <img src={project.image} alt={project.title} loading="lazy" />
                                        <span className="project-image-badge">⤢ View</span>
                                    </button>
                                ) : (
                                    <div className="project-image">
                                        <div className="image-placeholder"></div>
                                    </div>
                                )}
                                <div className="project-content">
                                    <h3 className="project-title">{project.title}</h3>
                                    <p className="project-description">{project.description}</p>
                                    {project.tech && project.tech.length > 0 && (
                                        <div className="project-tech">
                                            {project.tech.map((t, i) => (
                                                <span key={i} className="tech-tag">{t}</span>
                                            ))}
                                        </div>
                                    )}
                                    <div className="project-buttons">
                                        {project.liveUrl && (
                                            <a href={project.liveUrl} className="btn btn-live" target="_blank" rel="noopener noreferrer" onClick={() => trackEvent('demo_click', { projectId: project.id })}>
                                                Live
                                            </a>
                                        )}
                                        {project.githubUrl && (
                                            <a href={project.githubUrl} className="btn btn-github" target="_blank" rel="noopener noreferrer" onClick={() => trackEvent('github_click', { projectId: project.id })}>
                                                Github
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </div>
            <ProjectLightbox project={lightbox} onClose={closeLightbox} />
        </Section>
    );
};

export default PortfolioSection;
