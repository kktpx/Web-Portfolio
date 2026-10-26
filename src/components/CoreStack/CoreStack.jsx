import React from 'react';
import { FileJson, CodeXml } from 'lucide-react';
import './CoreStack.css';

const dev = (slug) => `https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/${slug}/${slug}-original.svg`;
const simple = (slug, hex) => `https://cdn.simpleicons.org/${slug}/${hex}`;

const skills = [
    { name: "HTML5", logo: dev("html5") },
    { name: "CSS3", logo: dev("css3") },
    { name: "JavaScript", logo: dev("javascript") },
    { name: "TypeScript", logo: dev("typescript") },
    { name: "React", logo: dev("react") },
    { name: "Vue.js", logo: dev("vuejs") },
    { name: "Next.js", logo: simple("nextdotjs", "FFFFFF") },
    { name: "Vite", logo: dev("vitejs") },
    { name: "Tailwind CSS", logo: dev("tailwindcss") },
    { name: "GSAP", logo: simple("greensock", "88CE02") },
    { name: "React Native", logo: dev("react") },
    { name: "Expo", logo: simple("expo", "FFFFFF") },
    { name: "Python", logo: dev("python") },
    { name: "FastAPI", logo: dev("fastapi") },
    { name: "Flask", logo: simple("flask", "FFFFFF") },
    { name: "Prisma", logo: simple("prisma", "FFFFFF") },
    { name: "Supabase", logo: dev("supabase") },
    { name: "PostgreSQL", logo: dev("postgresql") },
    { name: "SQLite", logo: dev("sqlite") },
    { name: "REST API", icon: FileJson, color: "#fff" },
    { name: "Google Gemini", logo: simple("googlegemini", "8E75B2") },
    { name: "scikit-learn", logo: dev("scikitlearn") },
    { name: "Jest", logo: simple("jest", "C21325") },
    { name: "Vitest", logo: dev("vitest") },
    { name: "Pytest", logo: dev("pytest") },
    { name: "Node.js", logo: dev("nodejs") },
    { name: "Git", logo: dev("git") },
    { name: "GitHub Actions", logo: dev("githubactions") },
    { name: "Vercel", logo: simple("vercel", "FFFFFF") },
    { name: "Render", logo: simple("render", "FFFFFF") },
];

const ROW_SIZE = 10;
const skillRows = Array.from({ length: Math.ceil(skills.length / ROW_SIZE) }, (_, i) =>
    skills.slice(i * ROW_SIZE, (i + 1) * ROW_SIZE),
);

// id="skills" keeps the navbar, footer link and section tracking working.
const CoreStack = () => (
    <div id="skills" className="core-stack-card">
        <div className="skills-header">
            <CodeXml size={26} className="skills-title-icon" />
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
