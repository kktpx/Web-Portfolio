import React, { useState, useRef, useEffect } from 'react';
import './ResumeButton.css';

const ResumeButton = ({ variant = 'default' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

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
          <a href="/resume/resume-th.pdf" target="_blank" rel="noopener noreferrer">
            🇹🇭 ภาษาไทย (TH)
          </a>
          <a href="/resume/resume-en.pdf" target="_blank" rel="noopener noreferrer">
            🇺🇸 English (ENG)
          </a>
        </div>
      )}
    </div>
  );
};

export default ResumeButton;
