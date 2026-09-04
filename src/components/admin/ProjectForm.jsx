import React, { useState, useEffect } from 'react';
import { X, Upload, Image as ImageIcon } from 'lucide-react';
import { createProject, updateProject, uploadProjectImage, deleteProjectImage } from '../../services/projectService';
import './ProjectForm.css';

const ProjectForm = ({ project, onClose, onSuccess, onError }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    live_url: '',
    github_url: '',
    sort_order: 0,
    is_published: true,
    tech: []
  });
  const [techInput, setTechInput] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditing = !!project;

  useEffect(() => {
    if (project) {
      setFormData({
        title: project.title || '',
        description: project.description || '',
        live_url: project.live_url || '',
        github_url: project.github_url || '',
        sort_order: project.sort_order || 0,
        is_published: project.is_published ?? true,
        tech: project.tech || []
      });
      if (project.image_url) {
        setImagePreview(project.image_url);
      }
    }
  }, [project]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleTechKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = techInput.trim();
      if (val && !formData.tech.includes(val)) {
        setFormData(prev => ({ ...prev, tech: [...prev.tech, val] }));
      }
      setTechInput('');
    }
  };

  const removeTech = (techToRemove) => {
    setFormData(prev => ({
      ...prev,
      tech: prev.tech.filter(t => t !== techToRemove)
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      onError('Image size must be less than 5MB');
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description) {
      onError('Title and description are required');
      return;
    }

    setIsSubmitting(true);
    try {
      let finalImageUrl = project?.image_url || '';

      if (imageFile) {
        finalImageUrl = await uploadProjectImage(imageFile);
        if (isEditing && project.image_url) {
          await deleteProjectImage(project.image_url);
        }
      }

      const projectData = {
        ...formData,
        image_url: finalImageUrl
      };

      if (isEditing) {
        await updateProject(project.id, projectData);
      } else {
        await createProject(projectData);
      }

      onSuccess();
    } catch (error) {
      console.error(error);
      onError(error.message || 'An error occurred while saving the project');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="admin-modal-overlay">
      <div className="admin-modal-content project-form-modal">
        <button className="admin-modal-close" onClick={onClose}>
          <X size={20} />
        </button>
        
        <h2 className="project-form-title">
          {isEditing ? 'Edit Project' : 'Add New Project'}
        </h2>

        <form onSubmit={handleSubmit} className="project-form">
          <div className="form-layout">
            <div className="form-column main-col">
              <div className="admin-form-group">
                <label htmlFor="title">Project Title *</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="admin-input"
                  placeholder="e.g. Awesome Website"
                />
              </div>

              <div className="admin-form-group">
                <label htmlFor="description">Description *</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  className="admin-input admin-textarea"
                  placeholder="Project details..."
                  rows={4}
                />
              </div>

              <div className="admin-form-group">
                <label>Technologies</label>
                <div className="tech-input-wrapper">
                  <input
                    type="text"
                    value={techInput}
                    onChange={(e) => setTechInput(e.target.value)}
                    onKeyDown={handleTechKeyDown}
                    className="admin-input"
                    placeholder="Type and press Enter (e.g. React)"
                  />
                  <div className="tech-tags-container">
                    {formData.tech.map((t, i) => (
                      <span key={i} className="form-tech-tag">
                        {t}
                        <button type="button" onClick={() => removeTech(t)}>
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="form-row">
                <div className="admin-form-group half">
                  <label htmlFor="live_url">Live URL</label>
                  <input
                    type="url"
                    id="live_url"
                    name="live_url"
                    value={formData.live_url}
                    onChange={handleChange}
                    className="admin-input"
                    placeholder="https://..."
                  />
                </div>
                <div className="admin-form-group half">
                  <label htmlFor="github_url">GitHub URL</label>
                  <input
                    type="url"
                    id="github_url"
                    name="github_url"
                    value={formData.github_url}
                    onChange={handleChange}
                    className="admin-input"
                    placeholder="https://github.com/..."
                  />
                </div>
              </div>
            </div>

            <div className="form-column side-col">
              <div className="admin-form-group">
                <label>Project Image</label>
                <div className="image-upload-container">
                  {imagePreview ? (
                    <div className="image-preview">
                      <img src={imagePreview} alt="Preview" />
                      <label className="change-image-btn">
                        <Upload size={14} /> Change
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          onChange={handleImageChange}
                          hidden
                        />
                      </label>
                    </div>
                  ) : (
                    <label className="image-upload-empty">
                      <ImageIcon size={32} />
                      <span>Click to upload image</span>
                      <span className="upload-hint">Max 5MB (JPG, PNG, WebP)</span>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleImageChange}
                        hidden
                      />
                    </label>
                  )}
                </div>
              </div>

              <div className="admin-form-group">
                <label htmlFor="sort_order">Display Order</label>
                <input
                  type="number"
                  id="sort_order"
                  name="sort_order"
                  value={formData.sort_order}
                  onChange={handleChange}
                  className="admin-input"
                />
              </div>

              <div className="admin-form-group toggle-group">
                <label htmlFor="is_published" className="toggle-label">
                  Published Status
                </label>
                <div className="toggle-wrapper">
                  <input
                    type="checkbox"
                    id="is_published"
                    name="is_published"
                    checked={formData.is_published}
                    onChange={handleChange}
                    className="toggle-checkbox"
                  />
                  <label htmlFor="is_published" className="toggle-switch"></label>
                  <span className="toggle-text">
                    {formData.is_published ? 'Visible to public' : 'Hidden from public'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="form-footer">
            <button type="button" className="admin-btn admin-btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="admin-btn admin-btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectForm;
