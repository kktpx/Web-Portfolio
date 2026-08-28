import React from 'react';
import Section from '../common/Section';
import './AboutSection.css';

const AboutSection = () => {
    return (
        <Section id="about" className="about-section" hasGap={true}>
            <div className="about-card">
                <div className="about-grid">
                    {/* Left: About Me */}
                    <div className="about-left">
                        <h2 className="about-title">About me</h2>
                        <p className="about-paragraph">
                            I'm a Computer Science student driven by a passion for crafting elegant, 
                            scalable software solutions. My journey into tech began with a deep curiosity 
                            about how digital systems operate, and it has since grown into a strong 
                            commitment to building impactful and innovative web applications.
                        </p>
                        <p className="about-paragraph">
                            Beyond coding, I enjoy staying ahead of emerging technology trends, exploring 
                            modern UI/UX design principles, and building side projects that constantly push 
                            my technical boundaries. I strongly believe in continuous growth and the power 
                            of collaborative problem-solving.
                        </p>
                        <p className="about-paragraph">
                            Currently, my focus is on full-stack web development, where I strive to 
                            architect robust backends and design seamless, accessible, and user-centric 
                            frontend experiences.
                        </p>
                    </div>

                    {/* Right: Education + Core Skills */}
                    <div className="about-right">
                        <div className="about-education">
                            <h3 className="about-subtitle">Education</h3>
                            <div className="edu-item">
                                <h4 className="edu-degree">Bachelor of Computer Science</h4>
                                <p className="edu-meta">RMUTSB • GPA: 3.49 • 2023 - Present</p>
                                <p className="edu-detail">
                                    Rajamangala University of Technology Suvarnabhumi (Huntra Campus). 
                                    Faculty of Science and Technology, majoring in Computer Science.
                                </p>
                            </div>
                        </div>

                        <div className="about-skills">
                            <h3 className="about-subtitle">Core Skills</h3>
                            <ul className="core-skills-list">
                                <li>Positive Attitude</li>
                                <li>Curiosity and Lifelong Learning</li>
                                <li>Teamwork and Collaboration</li>
                                <li>Communication</li>
                                <li>Flexibility and Adaptability</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </Section>
    );
};

export default AboutSection;
