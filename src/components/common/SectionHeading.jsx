import React from 'react';
import './SectionHeading.css';

// Shared section header: small mono eyebrow ("01 — ABOUT") over a large title.
const SectionHeading = ({ index, label, children }) => (
    <header className="section-heading">
        <span className="section-eyebrow">
            {index} <span className="section-eyebrow-dash">—</span> {label}
        </span>
        <h2 className="section-heading-title">{children}</h2>
    </header>
);

export default SectionHeading;
