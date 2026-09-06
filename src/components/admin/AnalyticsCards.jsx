import React from 'react';
import { Users, Eye, FolderOpen, Code, ExternalLink, Download, Mail } from 'lucide-react';
import './AnalyticsCards.css';

const AnalyticsCards = ({ data, loading }) => {
  const cards = [
    { label: 'Visitors', value: data?.visitors, icon: Users, color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.1)' },
    { label: 'Page Views', value: data?.pageViews, icon: Eye, color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)' },
    { label: 'Project Views', value: data?.projectViews, icon: FolderOpen, color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' },
    { label: 'GitHub Clicks', value: data?.githubClicks, icon: Code, color: '#a0a0a0', bg: 'rgba(160, 160, 160, 0.1)' },
    { label: 'Demo Clicks', value: data?.demoClicks, icon: ExternalLink, color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' },
    { label: 'Resume Downloads', value: data?.resumeDownloads, icon: Download, color: '#06b6d4', bg: 'rgba(6, 182, 212, 0.1)' },
    { label: 'Contact Submits', value: data?.contactSubmissions, icon: Mail, color: '#ec4899', bg: 'rgba(236, 72, 153, 0.1)' },
  ];

  return (
    <div className="analytics-cards-grid">
      {cards.map((card, idx) => (
        <div key={idx} className="admin-stat-card">
          <div className="admin-stat-icon" style={{ color: card.color, backgroundColor: card.bg }}>
            <card.icon size={24} />
          </div>
          <div className="admin-stat-content">
            <h3>{card.label}</h3>
            <div className={`admin-stat-value ${loading ? 'loading-text' : ''}`}>
              {loading ? '-' : (card.value || 0).toLocaleString()}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AnalyticsCards;
