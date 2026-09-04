import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import './DeleteConfirmModal.css';

const DeleteConfirmModal = ({ project, onClose, onConfirm }) => {
  if (!project) return null;

  return (
    <div className="admin-modal-overlay">
      <div className="admin-modal-content delete-modal">
        <button className="admin-modal-close" onClick={onClose}>
          <X size={20} />
        </button>
        
        <div className="delete-modal-header">
          <div className="delete-icon-wrapper">
            <AlertTriangle size={32} />
          </div>
          <h2>Delete Project?</h2>
        </div>
        
        <div className="delete-modal-body">
          <p>Are you sure you want to delete the project:</p>
          <p className="delete-target-name">"{project.title}"?</p>
          <p className="delete-warning">This action cannot be undone and will remove the associated image if one exists.</p>
        </div>
        
        <div className="delete-modal-footer">
          <button className="admin-btn admin-btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="admin-btn admin-btn-danger" onClick={onConfirm}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;
