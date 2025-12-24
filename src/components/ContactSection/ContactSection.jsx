import React, { useState } from 'react';
import Section from '../common/Section';
import './ContactSection.css';

const ContactSection = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Form submitted:', formData);
    };

    return (
        <Section id="contact" className="contact-section" hasGap={true}>
            <div className="contact-container">
                <h2 className="contact-main-title">Contact <span className="highlight">Me</span></h2>

                <div className="contact-grid">
                    {/* Left Side - Form Card (Original Style) */}
                    <div className="contact-card">
                        <h3 className="card-title">Send a Message</h3>
                        <form onSubmit={handleSubmit} className="contact-form">
                            <input
                                type="text"
                                name="name"
                                placeholder="Name"
                                value={formData.name}
                                onChange={handleChange}
                                className="form-input"
                                required
                            />
                            <input
                                type="email"
                                name="email"
                                placeholder="Email"
                                value={formData.email}
                                onChange={handleChange}
                                className="form-input"
                                required
                            />
                            <input
                                type="text"
                                name="subject"
                                placeholder="Subject"
                                value={formData.subject}
                                onChange={handleChange}
                                className="form-input"
                                required
                            />
                            <textarea
                                name="message"
                                placeholder="Message"
                                value={formData.message}
                                onChange={handleChange}
                                className="form-textarea"
                                rows="5"
                                required
                            ></textarea>
                            <button type="submit" className="submit-btn">Send a Message</button>
                        </form>
                    </div>

                    {/* Right Side - Contact Details */}
                    <div className="contact-card contact-card--details">
                        <h3 className="card-title">Connect With Me</h3>
                        <div className="contact-details">
                            <a className="detail-item">
                                <div className="detail-icon">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <rect width="20" height="16" x="2" y="4" rx="2" />
                                        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                                    </svg>
                                </div>
                                <div className="detail-content">
                                    <span className="detail-label">EMAIL</span>
                                    <span className="detail-value">kittipop.sanpho@gmail.com</span>
                                </div>
                            </a>
                            <a className="detail-item">
                                <div className="detail-icon">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                                    </svg>
                                </div>
                                <div className="detail-content">
                                    <span className="detail-label">PHONE</span>
                                    <span className="detail-value">092 949 6271</span>
                                </div>
                            </a>
                            <div className="detail-item detail-item--static">
                                <div className="detail-icon">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                                        <circle cx="12" cy="10" r="3" />
                                    </svg>
                                </div>
                                <div className="detail-content">
                                    <span className="detail-label">LOCATION</span>
                                    <span className="detail-value">Ayutthaya, Thailand</span>
                                </div>
                            </div>
                        </div>

                        <div className="social-section">
                            <span className="social-label">Follow Me</span>
                            <div className="social-icons">
                                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="social-icon-link">
                                    <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/linkedin/linkedin-original.svg" alt="LinkedIn" />
                                </a>
                                <a href="https://github.com/kktpx" target="_blank" rel="noopener noreferrer" className="social-icon-link">
                                    <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg" alt="GitHub" className="github-icon" />
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Section>
    );
};

export default ContactSection;
