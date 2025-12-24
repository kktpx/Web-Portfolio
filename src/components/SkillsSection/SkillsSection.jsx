import React from 'react';
import Section from '../common/Section';
import './SkillsSection.css';

const skills = [
    {
        name: 'HTML',
        logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg'
    },
    {
        name: 'CSS',
        logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg'
    },
    {
        name: 'Javascript',
        logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg'
    },
    {
        name: 'React',
        logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg'
    },
    {
        name: 'Figma',
        logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/figma/figma-original.svg'
    },
];

const SkillsSection = () => {
    return (
        <Section id="skills" className="skills-section" hasGap={true}>
            <div className="skills-card">
                <div className="skills-header">
                    <div className="title-line"></div>
                    <h2 className="skills-title">Skills</h2>
                </div>
                <div className="skills-list">
                    {skills.map((skill, index) => (
                        <div key={index} className="skill-item">
                            <img
                                src={skill.logo}
                                alt={skill.name}
                                className="skill-logo"
                            />
                            <span className="skill-name">{skill.name}</span>
                        </div>
                    ))}
                </div>
            </div>
        </Section>
    );
};

export default SkillsSection;
