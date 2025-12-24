import React from 'react';
import Section from '../common/Section';
import ElectricBorder from '../ElectricBorder/ElectricBorder';
import TextType from '../TextType/TextType';
import './HeroSection.css';
import profileImg from '../../../public/images/profile.webp'

const HeroSection = () => {
    return (
        <Section id="home" className="hero-section" isFirst={true} hasGap={true}>
            <div className="hero-container">
                <div className="hero-content">
                    <p className="greeting">Hello World, I'm</p>
                    <h1 className="name">Kittipop Sanpho</h1>
                    <TextType
                        text={["Computer Science Student", "Web Developer", "UI/UX Designer"]}
                        className="title"
                        typingSpeed={80}
                        deletingSpeed={40}
                        pauseDuration={2000}
                        showCursor={true}
                        cursorCharacter="|"
                        loop={true}
                    />
                    <p className="tagline">Welcome to My personal website</p>
                </div>
                <div className="hero-image">
                    <ElectricBorder color="#ffcc00" thickness={4} speed={0.7} chaos={0.3} circular={true}>
                        <div className="profile-circle">
                            <img src={profileImg} alt="Kittipop Sanpho" />
                        </div>
                    </ElectricBorder>
                </div>
            </div>
        </Section>
    );
};

export default HeroSection;
