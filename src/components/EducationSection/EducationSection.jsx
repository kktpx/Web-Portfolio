import React from 'react';
import Section from '../common/Section';
import './EducationSection.css';

const educationData = [
    {
        period: '2023 - Present',
        degree: 'Bachelor of Science in Computer Science',
        institution: 'Ragamangala University of Technology Suvarnabhumi Huntra',
        description: 'Studying computer science fundamentals, software engineering, data structures, algorithms, and modern development practices.'
    },
    {
        period: '2020 - 2022',
        degree: 'Vocational certificate in Information Technology',
        institution: 'Ayutthaya Technological Commercial College',
        description: 'Focused on practical IT skills, including hardware maintenance, software troubleshooting, and basic web development.'
    }
];

const EducationSection = () => {
    return (
        <Section id="education" className="education-section" hasGap={true}>
            <div className="education-card">
                <div className="timeline">
                    {educationData.map((item, index) => (
                        <div key={index} className="timeline-item">
                            <div className="timeline-marker">
                                <div className="timeline-dot"></div>
                                {index < educationData.length - 1 && <div className="timeline-line"></div>}
                            </div>
                            <div className="timeline-content">
                                <span className="timeline-period">{item.period}</span>
                                <h3 className="timeline-degree">{item.degree}</h3>
                                <p className="timeline-institution">{item.institution}</p>
                                <p className="timeline-description">{item.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </Section>
    );
};

export default EducationSection;
