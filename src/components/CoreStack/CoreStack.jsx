import React from 'react';
import { FileJson } from 'lucide-react';
import './CoreStack.css';

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

const ROW_SIZE = 5;
const skillRows = Array.from({ length: Math.ceil(skills.length / ROW_SIZE) }, (_, i) =>
    skills.slice(i * ROW_SIZE, (i + 1) * ROW_SIZE),
);

// id="skills" keeps the navbar, footer link and section tracking working.
const CoreStack = () => (
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
);

export default CoreStack;
