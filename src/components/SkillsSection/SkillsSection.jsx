import React from 'react';
import Section from '../common/Section';
import './SkillsSection.css';
import { FileJson } from 'lucide-react';

const dev = (slug) => `https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/${slug}/${slug}-original.svg`;
const simple = (slug, hex) => `https://cdn.simpleicons.org/${slug}/${hex}`;

const skillGroups = [
    {
        title: "Languages & Frontend",
        skills: [
            { name: "HTML5", logo: dev("html5") },
            { name: "CSS3", logo: dev("css3") },
            { name: "JAVASCRIPT", logo: dev("javascript") },
            { name: "TYPESCRIPT", logo: dev("typescript") },
            { name: "REACT", logo: dev("react") },
            { name: "VUE.JS", logo: dev("vuejs") },
            { name: "VITE", logo: dev("vitejs") },
            { name: "TAILWIND CSS", logo: dev("tailwindcss") },
            { name: "GSAP", logo: simple("greensock", "88CE02") },
        ],
    },
    {
        title: "Mobile Development",
        skills: [
            { name: "REACT NATIVE", logo: dev("react") },
            { name: "EXPO", logo: simple("expo", "FFFFFF") },
        ],
    },
    {
        title: "Backend & Database",
        skills: [
            { name: "PYTHON", logo: dev("python") },
            { name: "FASTAPI", logo: dev("fastapi") },
            { name: "SUPABASE", logo: dev("supabase") },
            { name: "POSTGRESQL", logo: dev("postgresql") },
            { name: "REST API", icon: FileJson, color: "#fff" },
        ],
    },
    {
        title: "AI, Testing & Tools",
        skills: [
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
        ],
    },
];

// Repeat short groups so a marquee set is always wide enough to loop without gaps.
const MIN_PER_SET = 8;
const fillRow = (skills) => {
    const times = Math.max(1, Math.ceil(MIN_PER_SET / skills.length));
    return Array.from({ length: times }, () => skills).flat();
};

const SkillsSection = () => {
    return (
        <Section id="skills" className="skills-section" hasGap={true}>
            <div className="skills-header">
                <h2 className="skills-title">Core <span className="highlight-yellow">Stack</span></h2>
            </div>
            <div className="marquee-container">
                {skillGroups.map((group, rowIndex) => {
                    const row = fillRow(group.skills);
                    return (
                        <div key={group.title} className="skill-group">
                            <h3 className="skill-group-title">{group.title}</h3>
                            <div className={`marquee-track-container track-${rowIndex}`}>
                                <div className={`marquee-track direction-${rowIndex % 2 === 0 ? 'left' : 'right'}`}>
                                    {[...Array(6)].map((_, setIndex) => (
                                        <div key={setIndex} className="marquee-set">
                                            {row.map((skill, index) => (
                                                <div key={index} className="skill-item">
                                                    {skill.logo ? (
                                                        <img src={skill.logo} alt={skill.name} className="skill-logo" />
                                                    ) : skill.icon ? (
                                                        <skill.icon size={18} className="skill-icon" color={skill.color || "currentColor"} fill={skill.fill || "none"} />
                                                    ) : null}
                                                    <span className="skill-name">{skill.name}</span>
                                                </div>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </Section>
    );
};

export default SkillsSection;
