const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

// 1. Create Magnetic.jsx
const magneticPath = path.join(srcDir, 'components', 'common', 'Magnetic.jsx');
const magneticContent = `import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';

const Magnetic = ({ children }) => {
    const ref = useRef(null);

    useEffect(() => {
        const element = ref.current;
        if (!element || window.matchMedia("(pointer: coarse)").matches) return;

        const xTo = gsap.quickTo(element, "x", { duration: 1, ease: "elastic.out(1, 0.3)" });
        const yTo = gsap.quickTo(element, "y", { duration: 1, ease: "elastic.out(1, 0.3)" });

        const mouseMove = (e) => {
            const { clientX, clientY } = e;
            const { height, width, left, top } = element.getBoundingClientRect();
            const x = clientX - (left + width / 2);
            const y = clientY - (top + height / 2);
            xTo(x * 0.35);
            yTo(y * 0.35);
        };
        const mouseLeave = () => { xTo(0); yTo(0); };

        element.addEventListener("mousemove", mouseMove);
        element.addEventListener("mouseleave", mouseLeave);
        return () => {
            element.removeEventListener("mousemove", mouseMove);
            element.removeEventListener("mouseleave", mouseLeave);
        };
    }, []);

    return React.cloneElement(children, { ref });
};

export default Magnetic;
`;
fs.writeFileSync(magneticPath, magneticContent);
console.log('Created Magnetic.jsx');

// 2. Wrap Buttons in Hero, Contact, Footer, Portfolio
const replaceInFile = (filePath, search, replace) => {
    let content = fs.readFileSync(filePath, 'utf8');
    content = content.replace(search, replace);
    fs.writeFileSync(filePath, content);
};

// HeroSection
let heroContent = fs.readFileSync(path.join(srcDir, 'components', 'HeroSection', 'HeroSection.jsx'), 'utf8');
if (!heroContent.includes('Magnetic')) {
    heroContent = heroContent.replace(`import Section from '../common/Section';`, `import Section from '../common/Section';\nimport Magnetic from '../common/Magnetic';`);
    heroContent = heroContent.replace(`<a href="#portfolio" className="cta-btn cta-primary">View My Work</a>`, `<Magnetic><a href="#portfolio" className="cta-btn cta-primary">View My Work</a></Magnetic>`);
    heroContent = heroContent.replace(`<ResumeButton variant="secondary" />`, `<Magnetic><div><ResumeButton variant="secondary" /></div></Magnetic>`);
    fs.writeFileSync(path.join(srcDir, 'components', 'HeroSection', 'HeroSection.jsx'), heroContent);
}

// ContactSection
let contactContent = fs.readFileSync(path.join(srcDir, 'components', 'ContactSection', 'ContactSection.jsx'), 'utf8');
if (!contactContent.includes('Magnetic')) {
    contactContent = contactContent.replace(`import Section from '../common/Section';`, `import Section from '../common/Section';\nimport Magnetic from '../common/Magnetic';`);
    contactContent = contactContent.replace(`<button\n                                type="submit"`, `<Magnetic>\n                            <button\n                                type="submit"`);
    contactContent = contactContent.replace(`{status === 'loading' ? 'Sending...' : 'Send a Message'}\n                            </button>`, `{status === 'loading' ? 'Sending...' : 'Send a Message'}\n                            </button>\n                            </Magnetic>`);
    
    // Social icons in contact
    contactContent = contactContent.replace(
        `<a href="https://www.linkedin.com/in/kittipop-sanpho-7b734739b/" target="_blank" rel="noopener noreferrer" className="social-icon-link">`,
        `<Magnetic><a href="https://www.linkedin.com/in/kittipop-sanpho-7b734739b/" target="_blank" rel="noopener noreferrer" className="social-icon-link">`
    );
    contactContent = contactContent.replace(
        `<img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/linkedin/linkedin-original.svg" alt="LinkedIn" />\n                                </a>`,
        `<img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/linkedin/linkedin-original.svg" alt="LinkedIn" />\n                                </a></Magnetic>`
    );
    contactContent = contactContent.replace(
        `<a href="https://github.com/kktpx" target="_blank" rel="noopener noreferrer" className="social-icon-link">`,
        `<Magnetic><a href="https://github.com/kktpx" target="_blank" rel="noopener noreferrer" className="social-icon-link">`
    );
    contactContent = contactContent.replace(
        `<img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg" alt="GitHub" className="github-icon" />\n                                </a>`,
        `<img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg" alt="GitHub" className="github-icon" />\n                                </a></Magnetic>`
    );
    contactContent = contactContent.replace(`<ResumeButton variant="default" />`, `<Magnetic><div><ResumeButton variant="default" /></div></Magnetic>`);
    fs.writeFileSync(path.join(srcDir, 'components', 'ContactSection', 'ContactSection.jsx'), contactContent);
}

// Footer
let footerContent = fs.readFileSync(path.join(srcDir, 'components', 'Footer', 'Footer.jsx'), 'utf8');
if (!footerContent.includes('Magnetic')) {
    footerContent = footerContent.replace(`import ResumeButton from '../ResumeButton/ResumeButton';`, `import ResumeButton from '../ResumeButton/ResumeButton';\nimport Magnetic from '../common/Magnetic';`);
    footerContent = footerContent.replace(`<li><a href="#education">Education</a></li>`, ``); // Clean up education
    footerContent = footerContent.replace(`<a href="https://github.com/kktpx" target="_blank" rel="noreferrer" className="social-pill">GitHub</a>`, `<Magnetic><a href="https://github.com/kktpx" target="_blank" rel="noreferrer" className="social-pill">GitHub</a></Magnetic>`);
    footerContent = footerContent.replace(`<a href="https://www.linkedin.com/in/kittipop-sanpho-7b734739b/" target="_blank" rel="noreferrer" className="social-pill">LinkedIn</a>`, `<Magnetic><a href="https://www.linkedin.com/in/kittipop-sanpho-7b734739b/" target="_blank" rel="noreferrer" className="social-pill">LinkedIn</a></Magnetic>`);
    footerContent = footerContent.replace(`<ResumeButton variant="pill" />`, `<Magnetic><div><ResumeButton variant="pill" /></div></Magnetic>`);
    fs.writeFileSync(path.join(srcDir, 'components', 'Footer', 'Footer.jsx'), footerContent);
}


// 3. Hover Card Tilt (Portfolio)
let portfolioContent = fs.readFileSync(path.join(srcDir, 'components', 'PortfolioSection', 'PortfolioSection.jsx'), 'utf8');
if (!portfolioContent.includes('TiltCard')) {
    const tiltComponent = `
const TiltCard = ({ children, className }) => {
    const ref = React.useRef(null);
    React.useEffect(() => {
        const card = ref.current;
        if (!card || window.matchMedia("(pointer: coarse)").matches) return;

        const handleMouseMove = (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = ((y - centerY) / 20) * -1;
            const rotateY = (x - centerX) / 20;
            
            card.style.transform = \`perspective(1000px) rotateX(\${rotateX}deg) rotateY(\${rotateY}deg) scale3d(1.02, 1.02, 1.02)\`;
        };
        const handleMouseLeave = () => {
            card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
        };
        card.addEventListener('mousemove', handleMouseMove);
        card.addEventListener('mouseleave', handleMouseLeave);
        return () => {
            card.removeEventListener('mousemove', handleMouseMove);
            card.removeEventListener('mouseleave', handleMouseLeave);
        };
    }, []);
    return (
        <div ref={ref} className={className} style={{ transition: 'transform 0.1s ease-out' }}>
            {children}
        </div>
    );
};
`;
    portfolioContent = portfolioContent.replace(`const PortfolioSection = () => {`, `${tiltComponent}\nconst PortfolioSection = () => {`);
    portfolioContent = portfolioContent.replace(/<div key=\{project\.id\} className="project-card">/g, `<TiltCard key={project.id} className="project-card">`);
    portfolioContent = portfolioContent.replace(/<\/div>\n\s*\}\)\}/g, `</TiltCard>\n                    })}`); // close tag replace
    
    // Replace buttons with Magnetic in portfolio
    portfolioContent = portfolioContent.replace(`import Section from '../common/Section';`, `import Section from '../common/Section';\nimport Magnetic from '../common/Magnetic';`);
    portfolioContent = portfolioContent.replace(
        `<a href={project.liveUrl} className="btn btn-live" target="_blank" rel="noopener noreferrer">\n                                        Live\n                                    </a>`,
        `<Magnetic><a href={project.liveUrl} className="btn btn-live" target="_blank" rel="noopener noreferrer">\n                                        Live\n                                    </a></Magnetic>`
    );
    portfolioContent = portfolioContent.replace(
        `<a href={project.githubUrl} className="btn btn-github" target="_blank" rel="noopener noreferrer">\n                                        Github\n                                    </a>`,
        `<Magnetic><a href={project.githubUrl} className="btn btn-github" target="_blank" rel="noopener noreferrer">\n                                        Github\n                                    </a></Magnetic>`
    );

    fs.writeFileSync(path.join(srcDir, 'components', 'PortfolioSection', 'PortfolioSection.jsx'), portfolioContent);
}

// 4. Section Divider Lines
let sectionCss = fs.readFileSync(path.join(srcDir, 'components', 'common', 'Section.css'), 'utf8');
if (!sectionCss.includes('::after')) {
    sectionCss += `
.section--gap {
    position: relative;
}
.section--gap::after {
    content: '';
    position: absolute;
    bottom: -75px; 
    left: 50%;
    transform: translateX(-50%);
    width: 70%;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(255, 204, 0, 0.3), transparent);
    pointer-events: none;
}
`;
    fs.writeFileSync(path.join(srcDir, 'components', 'common', 'Section.css'), sectionCss);
}
// Remove divider from contact section
let contactCss = fs.readFileSync(path.join(srcDir, 'components', 'ContactSection', 'ContactSection.css'), 'utf8');
if (!contactCss.includes('::after')) {
    contactCss += `\n.contact-section::after {\n    display: none;\n}\n`;
    fs.writeFileSync(path.join(srcDir, 'components', 'ContactSection', 'ContactSection.css'), contactCss);
}

// 5. Section Title Glow
let sectionJsx = fs.readFileSync(path.join(srcDir, 'components', 'common', 'Section.jsx'), 'utf8');
if (!sectionJsx.includes('textShadow')) {
    sectionJsx = sectionJsx.replace(
        `{ opacity: 0, y: 30 },`,
        `{ opacity: 0, y: 30, textShadow: "0px 0px 0px rgba(255,204,0,0)" },`
    );
    sectionJsx = sectionJsx.replace(
        `{ opacity: 1, y: 0, duration: 0.8, stagger: 0.15, ease: 'power3.out' }`,
        `{ opacity: 1, y: 0, textShadow: "0px 0px 15px rgba(255,204,0,0)", duration: 0.8, stagger: 0.15, ease: 'power3.out' }`
    );
    
    sectionJsx = sectionJsx.replace(
        `{ opacity: 0, y: 40 },`,
        `{ opacity: 0, y: 40, textShadow: "0px 0px 0px rgba(255,204,0,0)" },`
    );
    sectionJsx = sectionJsx.replace(
        `opacity: 1,\n                    y: 0,\n                    duration: 0.8,`,
        `opacity: 1,\n                    y: 0,\n                    textShadow: "0px 0px 15px rgba(255,204,0,0)",\n                    duration: 0.8,`
    );
    fs.writeFileSync(path.join(srcDir, 'components', 'common', 'Section.jsx'), sectionJsx);
}

console.log('Successfully applied all pro decorations!');
