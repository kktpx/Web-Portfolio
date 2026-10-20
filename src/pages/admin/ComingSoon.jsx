import React from 'react';

const ComingSoon = ({ title }) => (
  <div className="admin-page-container">
    <h1 className="admin-page-title">{title}</h1>
    <div className="admin-card" style={{ marginTop: '1.5rem' }}>
      <p>Coming soon</p>
    </div>
  </div>
);

export default ComingSoon;
