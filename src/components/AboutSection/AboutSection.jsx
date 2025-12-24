import React from 'react';
import Section from '../common/Section';
import ElectricBorder from '../ElectricBorder/ElectricBorder';
import './AboutSection.css';
import profileImg from '../../../public/images/profile2.jpg'

const AboutSection = () => {
    return (
        <Section id="about" className="about-section" hasGap={true}>
            <div className="about-card">
                <div className="about-header">
                    <h2 className="about-title">About Me</h2>
                    <div className="title-line"></div>
                </div>
                <div className="about-content">
                    <div className="about-image-container">
                        <ElectricBorder color="#ffcc00" thickness={4} speed={0.7} chaos={0.4} circular={true}>
                            <div className="about-profile-circle">
                                <img src={profileImg} alt="Kittipop Sanpho" />
                            </div>
                        </ElectricBorder>
                    </div>
                    <div className="about-text">
                        <p>
                            I'm a Computer Science student with a deep passion for creating
                            elegant solutions to complex problems. My journey in tech started
                            with curiosity about how things work, and has evolved into a
                            commitment to building innovative digital experiences.
                        </p>
                        <p>
                            When I'm not coding, you can find me exploring new design trends,
                            learning about emerging technologies, or working on personal
                            projects that challenge me to grow. I believe in the power of
                            continuous learning and pushing boundaries.
                        </p>
                        <p>
                            Currently, I'm focused on full-stack web development and creating
                            user-centric interfaces that are both beautiful and functional.
                        </p>
                    </div>
                </div>
            </div>
        </Section>
    );
};

export default AboutSection;
