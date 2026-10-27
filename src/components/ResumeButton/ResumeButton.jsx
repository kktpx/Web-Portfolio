import React, { useState, useRef, useEffect } from 'react';
import { trackEvent } from '../../services/analyticsService';
import { getResumeUrls, DEFAULT_RESUME_URLS, RESUME_LANGS } from '../../services/resumeService';
import './ResumeButton.css';

const ResumeButton = ({ variant = 'default' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [urls, setUrls] = useState(DEFAULT_RESUME_URLS);
  const dropdownRef = useRef(null);

  // Uploaded resumes (admin) override the bundled defaults
  useEffect(() => {
    let active = true;
    getResumeUrls().then((next) => { if (active) setUrls(next); });
    return () => { active = false; };
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`resume-btn-wrapper resume-btn--${variant}`} ref={dropdownRef}>
      <button className="resume-btn" onClick={() => setIsOpen(!isOpen)}>
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="7 10 12 15 17 10"/>
          <line x1="12" x2="12" y1="15" y2="3"/>
        </svg>
        Resume
      </button>
      
      {isOpen && (
        <div className="resume-dropdown">
          {RESUME_LANGS.map(({ code, label, flag }) => (
            <a key={code} href={urls[code]} target="_blank" rel="noopener noreferrer" onClick={() => trackEvent('resume_download')}>
              {flag} {label}
            </a>
          ))}
        </div>
      )}
    </div>
  );
};

export default ResumeButton;
