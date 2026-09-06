import React from 'react';
import './TopProjects.css';

const TopProjects = ({ data, loading }) => {
  return (
    <div className="admin-card top-projects-card">
      <h3>Top Projects</h3>
      
      {loading ? (
        <div className="top-projects-loading loading-pulse"></div>
      ) : data && data.length > 0 ? (
        <div className="top-projects-table-wrapper">
          <table className="top-projects-table">
            <thead>
              <tr>
                <th>Project</th>
                <th className="text-right">Views</th>
                <th className="text-right">GitHub</th>
                <th className="text-right">Demo</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, idx) => (
                <tr key={idx}>
                  <td className="project-title-cell">{item.title}</td>
                  <td className="text-right font-medium">{item.views.toLocaleString()}</td>
                  <td className="text-right text-muted">{item.githubClicks.toLocaleString()}</td>
                  <td className="text-right text-muted">{item.demoClicks.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="analytics-empty-inline">No project data available yet.</div>
      )}
    </div>
  );
};

export default TopProjects;
