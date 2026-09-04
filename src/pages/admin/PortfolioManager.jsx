import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search } from 'lucide-react';
import { getAllProjects, updateProject, deleteProject, deleteProjectImage } from '../../services/projectService';
import ProjectTable from '../../components/admin/ProjectTable';
import ProjectForm from '../../components/admin/ProjectForm';
import DeleteConfirmModal from '../../components/admin/DeleteConfirmModal';
import Toast from '../../components/admin/Toast';
import './PortfolioManager.css';

const PortfolioManager = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [deletingProject, setDeletingProject] = useState(null);
  
  // Toast state
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const loadProjects = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getAllProjects();
      setProjects(data);
    } catch (error) {
      showToast(error?.message || 'Failed to load projects', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
  };

  const handleAddClick = () => {
    setEditingProject(null);
    setIsFormOpen(true);
  };

  const handleEditClick = (project) => {
    setEditingProject(project);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (project) => {
    setDeletingProject(project);
    setIsDeleteOpen(true);
  };

  const handleTogglePublish = async (project) => {
    try {
      const newStatus = !project.is_published;
      await updateProject(project.id, { is_published: newStatus });
      setProjects(projects.map(p => 
        p.id === project.id ? { ...p, is_published: newStatus } : p
      ));
      showToast(`Project ${newStatus ? 'published' : 'unpublished'} successfully`);
    } catch {
      showToast('Failed to update status', 'error');
    }
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    loadProjects();
    showToast(`Project ${editingProject ? 'updated' : 'created'} successfully`);
  };

  const handleDeleteConfirm = async () => {
    try {
      if (deletingProject.image_url) {
        await deleteProjectImage(deletingProject.image_url);
      }
      await deleteProject(deletingProject.id);
      setIsDeleteOpen(false);
      loadProjects();
      showToast('Project deleted successfully');
    } catch {
      showToast('Failed to delete project', 'error');
      setIsDeleteOpen(false);
    }
  };

  return (
    <div className="admin-page-container">
      <div className="admin-page-header">
        <h1 className="admin-page-title">Portfolio Manager</h1>
        <button className="admin-btn admin-btn-primary" onClick={handleAddClick}>
          <Plus size={18} /> Add Project
        </button>
      </div>

      <div className="admin-card portfolio-manager-card">
        <div className="portfolio-manager-toolbar">
          <div className="admin-search-wrapper">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="admin-input search-input"
            />
          </div>
        </div>

        {loading ? (
          <div className="portfolio-loading">
            <div className="admin-spinner" style={{ width: 30, height: 30, border: '3px solid rgba(255, 204, 0, 0.2)', borderTopColor: '#ffcc00', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            <p>Loading projects...</p>
          </div>
        ) : (
          <ProjectTable 
            projects={projects}
            searchQuery={searchQuery}
            onEdit={handleEditClick}
            onDelete={handleDeleteClick}
            onTogglePublish={handleTogglePublish}
          />
        )}
      </div>

      {isFormOpen && (
        <ProjectForm 
          project={editingProject}
          onClose={() => setIsFormOpen(false)}
          onSuccess={handleFormSuccess}
          onError={(msg) => showToast(msg, 'error')}
        />
      )}

      {isDeleteOpen && (
        <DeleteConfirmModal
          project={deletingProject}
          onClose={() => setIsDeleteOpen(false)}
          onConfirm={handleDeleteConfirm}
        />
      )}

      {toast.show && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast({ ...toast, show: false })} 
        />
      )}
    </div>
  );
};

export default PortfolioManager;
