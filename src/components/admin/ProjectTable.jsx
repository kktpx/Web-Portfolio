import React from 'react';
import { Pencil, Trash2, Eye, EyeOff, ExternalLink } from 'lucide-react';
import './ProjectTable.css';

const ProjectTable = ({ projects, searchQuery, onEdit, onDelete, onTogglePublish }) => {
  const filteredProjects = projects.filter(project => 
    project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (project.description && project.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (projects.length === 0) {
    return (
      <div className="project-table-empty">
        <p>No projects found. Click "Add Project" to get started.</p>
      </div>
    );
  }

  if (filteredProjects.length === 0) {
    return (
      <div className="project-table-empty">
        <p>No projects match your search.</p>
      </div>
    );
  }

  return (
    <div className="project-table-container">
      <table className="project-table">
        <thead>
          <tr>
            <th>Project</th>
            <th>Technologies</th>
            <th className="text-center">Order</th>
            <th className="text-center">Status</th>
            <th className="text-center">Links</th>
            <th className="text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredProjects.map(project => (
            <tr key={project.id} className={!project.is_published ? 'unpublished-row' : ''}>
              <td>
                <div className="project-cell-main">
                  <div className="project-cell-image">
                    {project.image_url ? (
                      <img src={project.image_url} alt={project.title} loading="lazy" />
                    ) : (
                      <div className="project-image-placeholder" />
                    )}
                  </div>
                  <div className="project-cell-info">
                    <span className="project-title">{project.title}</span>
                    <span className="project-desc" title={project.description}>
                      {project.description?.substring(0, 60)}
                      {project.description?.length > 60 ? '...' : ''}
                    </span>
                  </div>
                </div>
              </td>
              <td>
                <div className="project-tech-tags">
                  {project.tech?.slice(0, 3).map((t, i) => (
                    <span key={i} className="admin-tech-tag">{t}</span>
                  ))}
                  {project.tech?.length > 3 && (
                    <span className="admin-tech-tag more">+{project.tech.length - 3}</span>
                  )}
                </div>
              </td>
              <td className="text-center font-mono text-muted">{project.sort_order}</td>
              <td className="text-center">
                <button 
                  className={`status-badge ${project.is_published ? 'published' : 'hidden'}`}
                  onClick={() => onTogglePublish(project)}
                  title={project.is_published ? "Click to unpublish" : "Click to publish"}
                >
                  {project.is_published ? <Eye size={14} /> : <EyeOff size={14} />}
                  {project.is_published ? 'Published' : 'Hidden'}
                </button>
              </td>
              <td className="text-center">
                <div className="project-links">
                  {project.live_url && (
                    <a href={project.live_url} target="_blank" rel="noopener noreferrer" title="Live Site">
                      <ExternalLink size={16} />
                    </a>
                  )}
                  {project.github_url && (
                    <a href={project.github_url} target="_blank" rel="noopener noreferrer" title="GitHub">
                      Code
                    </a>
                  )}
                </div>
              </td>
              <td className="text-right">
                <div className="project-actions">
                  <button className="action-btn edit" onClick={() => onEdit(project)} title="Edit">
                    <Pencil size={18} />
                  </button>
                  <button className="action-btn delete" onClick={() => onDelete(project)} title="Delete">
                    <Trash2 size={18} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProjectTable;
