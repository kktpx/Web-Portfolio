import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { ArrowUpRight, Maximize2, X } from 'lucide-react';
import { GithubIcon } from '../common/BrandIcons';
import { trackEvent } from '../../services/analyticsService';

// Project details: large screenshot, full description, every tech tag and links.
const ProjectModal = ({ project, onClose }) => {
    const closeRef = useRef(null);

    useEffect(() => {
        if (!project) return;

        const trigger = document.activeElement;
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose();
        };
        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        document.addEventListener('keydown', handleKeyDown);
        closeRef.current?.focus();

        return () => {
            document.body.style.overflow = prevOverflow;
            document.removeEventListener('keydown', handleKeyDown);
            // Return focus to the card control that opened the modal
            if (trigger instanceof HTMLElement) trigger.focus({ preventScroll: true });
        };
    }, [project, onClose]);

    if (!project) return null;

    const titleId = `project-modal-title-${project.id}`;

    // Portal to <body>: Section's GSAP transform would otherwise become the
    // containing block for this fixed overlay and push it off-screen.
    return createPortal(
        <div className="pm-backdrop" onClick={onClose}>
            <div
                className="pm-dialog"
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                onClick={(e) => e.stopPropagation()}
            >
                <button ref={closeRef} type="button" className="pm-close" onClick={onClose} aria-label="Close">
                    <X size={20} aria-hidden="true" />
                </button>

                {project.image && (
                    <div className="pm-media">
                        <img src={project.image} alt={`${project.title} screenshot`} />
                        <a
                            href={project.image}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="pm-fullsize"
                        >
                            <Maximize2 size={14} aria-hidden="true" />
                            Full size
                        </a>
                    </div>
                )}

                <div className="pm-body">
                    <h3 id={titleId} className="pm-title">{project.title}</h3>
                    <p className="pm-description">{project.description}</p>

                    {project.tech.length > 0 && (
                        <div className="project-tech pm-tech">
                            {project.tech.map((t, i) => (
                                <span key={i} className="tech-tag">{t}</span>
                            ))}
                        </div>
                    )}

                    {(project.liveUrl || project.githubUrl) && (
                        <div className="project-buttons pm-buttons">
                            {project.liveUrl && (
                                <a href={project.liveUrl} className="btn btn-live" target="_blank" rel="noopener noreferrer" onClick={() => trackEvent('demo_click', { projectId: project.id })}>
                                    <ArrowUpRight size={16} aria-hidden="true" />
                                    Live
                                </a>
                            )}
                            {project.githubUrl && (
                                <a href={project.githubUrl} className="btn btn-github" target="_blank" rel="noopener noreferrer" onClick={() => trackEvent('github_click', { projectId: project.id })}>
                                    <GithubIcon size={15} />
                                    GitHub
                                </a>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
};

export default ProjectModal;
