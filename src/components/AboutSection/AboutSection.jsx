import React from 'react';
import Section from '../common/Section';
import './AboutSection.css';
import { FileJson } from 'lucide-react';

const dev = (slug) => `https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/${slug}/${slug}-original.svg`;
const simple = (slug, hex) => `https://cdn.simpleicons.org/${slug}/${hex}`;

const skills = [
    { name: "HTML5", logo: dev("html5") },
    { name: "CSS3", logo: dev("css3") },
    { name: "JAVASCRIPT", logo: dev("javascript") },
    { name: "TYPESCRIPT", logo: dev("typescript") },
    { name: "REACT", logo: dev("react") },
    { name: "VUE.JS", logo: dev("vuejs") },
    { name: "NEXT.JS", logo: simple("nextdotjs", "FFFFFF") },
    { name: "VITE", logo: dev("vitejs") },
    { name: "TAILWIND CSS", logo: dev("tailwindcss") },
    { name: "GSAP", logo: simple("greensock", "88CE02") },
    { name: "REACT NATIVE", logo: dev("react") },
    { name: "EXPO", logo: simple("expo", "FFFFFF") },
    { name: "PYTHON", logo: dev("python") },
    { name: "FASTAPI", logo: dev("fastapi") },
    { name: "FLASK", logo: simple("flask", "FFFFFF") },
    { name: "PRISMA", logo: simple("prisma", "FFFFFF") },
    { name: "SUPABASE", logo: dev("supabase") },
    { name: "POSTGRESQL", logo: dev("postgresql") },
    { name: "SQLITE", logo: dev("sqlite") },
    { name: "REST API", icon: FileJson, color: "#fff" },
    { name: "GOOGLE GEMINI", logo: simple("googlegemini", "8E75B2") },
    { name: "SCIKIT-LEARN", logo: dev("scikitlearn") },
    { name: "JEST", logo: simple("jest", "C21325") },
    { name: "VITEST", logo: dev("vitest") },
    { name: "PYTEST", logo: dev("pytest") },
    { name: "NODE.JS", logo: dev("nodejs") },
    { name: "GIT", logo: dev("git") },
    { name: "GITHUB ACTIONS", logo: dev("githubactions") },
    { name: "VERCEL", logo: simple("vercel", "FFFFFF") },
    { name: "RENDER", logo: simple("render", "FFFFFF") },
];

const skillRows = [
    skills.slice(0, 8),
    skills.slice(8, 15),
    skills.slice(15, 23),
    skills.slice(23),
];

const AboutSection = () => {
    return (
        <Section id="about" className="about-section" hasGap={true}>
            <div className="about-stack">
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

            {/* Core Stack: separate box. id="skills" keeps nav, footer and section tracking working. */}
            <div id="skills" className="core-stack-card">
                <div className="skills-header">
                    <h2 className="skills-title">Core <span className="highlight-yellow">Stack</span></h2>
                </div>
                <div className="marquee-container">
                    {skillRows.map((row, rowIndex) => (
                        <div key={rowIndex} className={`marquee-track-container track-${rowIndex}`}>
                            <div className={`marquee-track direction-${rowIndex % 2 === 0 ? 'left' : 'right'}`}>
                                {[...Array(6)].map((_, setIndex) => (
                                    <div key={setIndex} className="marquee-set">
                                        {row.map((skill) => (
                                            <div key={skill.name} className="skill-item">
                                                {skill.logo ? (
                                                    <img src={skill.logo} alt={skill.name} className="skill-logo" />
                                                ) : skill.icon ? (
                                                    <skill.icon size={18} className="skill-icon" color={skill.color || "currentColor"} />
                                                ) : null}
                                                <span className="skill-name">{skill.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            </div>
        </Section>
    );
};

export default AboutSection;
