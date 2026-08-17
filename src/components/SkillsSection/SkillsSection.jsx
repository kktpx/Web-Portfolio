import React from 'react';
import Section from '../common/Section';
import './SkillsSection.css';
import { Database, FileJson, Sparkles, Cloud, Triangle, Workflow } from 'lucide-react';

const allSkills = [
    { name: "HTML5", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/html5/html5-original.svg" },
    { name: "CSS3", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/css3/css3-original.svg" },
    { name: "JAVASCRIPT", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/javascript/javascript-original.svg" },
    { name: "TYPESCRIPT", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/typescript/typescript-original.svg" },
    { name: "REACT", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/react/react-original.svg" },
    { name: "NEXT.JS", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nextjs/nextjs-original.svg" },
    { name: "VITE", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/vitejs/vitejs-original.svg" },
    { name: "TAILWIND CSS", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/tailwindcss/tailwindcss-original.svg" },
    { name: "NODE.JS", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nodejs/nodejs-original.svg" },
    { name: "PYTHON", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/python/python-original.svg" },
    { name: "FLASK", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/flask/flask-original.svg" },
    { name: "PRISMA", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/prisma/prisma-original.svg" },
    { name: "SQLITE", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/sqlite/sqlite-original.svg" },
    { name: "SQL", icon: Database, color: "#fff" },
    { name: "REST API", icon: FileJson, color: "#fff" },
    { name: "GOOGLE GEMINI", icon: Sparkles, color: "#8E24AA" },
    { name: "SCIKIT-LEARN", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/scikitlearn/scikitlearn-original.svg" },
    { name: "NUMPY", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/numpy/numpy-original.svg" },
    { name: "GITHUB ACTIONS", icon: Workflow, color: "#2088FF" },
    { name: "VERCEL", icon: Triangle, color: "#fff", fill: "#fff" },
    { name: "RENDER", icon: Cloud, color: "#fff", fill: "#fff" },
    { name: "GIT", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/git/git-original.svg" },
];

const row1 = allSkills.slice(0, 6);
const row2 = allSkills.slice(6, 12);
const row3 = allSkills.slice(12, 17);
const row4 = allSkills.slice(17, 22);
const skillRows = [row1, row2, row3, row4];

const SkillsSection = () => {
    return (
        <Section id="skills" className="skills-section" hasGap={true}>
            <div className="skills-header">
                <h2 className="skills-title">My <span className="highlight-yellow">Skills</span></h2>
            </div>
            <div className="marquee-container">
                {skillRows.map((row, rowIndex) => (
                    <div key={rowIndex} className={`marquee-track-container track-${rowIndex}`}>
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
                ))}
            </div>
        </Section>
    );
};

export default SkillsSection;
