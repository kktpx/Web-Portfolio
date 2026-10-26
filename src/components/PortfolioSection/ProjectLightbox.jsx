import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

const ProjectLightbox = ({ project, onClose }) => {
    const closeRef = useRef(null);

    useEffect(() => {
        if (!project) return;

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
        };
    }, [project, onClose]);

    if (!project) return null;

    // Portal to <body>: Section's GSAP transform would otherwise become the
    // containing block for this fixed overlay and push it off-screen.
    return createPortal(
        <div
            className="lightbox"
            role="dialog"
            aria-modal="true"
            aria-label={`${project.title} screenshot`}
            onClick={onClose}
        >
            <button ref={closeRef} className="lightbox-close" onClick={onClose} aria-label="Close">
                &times;
            </button>
            <figure className="lightbox-figure" onClick={(e) => e.stopPropagation()}>
                <img src={project.image} alt={project.title} />
                <figcaption>{project.title}</figcaption>
            </figure>
        </div>,
        document.body
    );
};

export default ProjectLightbox;
