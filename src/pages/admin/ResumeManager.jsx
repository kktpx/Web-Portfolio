import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Download, Eye, FileText, RotateCcw, UploadCloud } from 'lucide-react';
import {
  RESUME_LANGS,
  DEFAULT_RESUME_URLS,
  getResumes,
  uploadResume,
  resetResume,
  resumePublicUrl,
  validateResumeFile,
  formatBytes,
} from '../../services/resumeService';
import { getOverview } from '../../services/analyticsApi';
import Toast from '../../components/admin/Toast';
import './ResumeManager.css';

const DOWNLOAD_WINDOW_DAYS = 30;

const formatDate = (iso) =>
  new Date(iso).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

// Missing table = resumes.sql has not been run yet
const isMissingTable = (error) =>
  error?.code === '42P01' || error?.code === 'PGRST205' || /site_resumes/.test(error?.message || '');

const ResumeCard = ({ lang, row, busy, confirming, onUpload, onAskReset, onCancelReset, onReset }) => {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const previewUrl = row ? resumePublicUrl(row.file_path) : DEFAULT_RESUME_URLS[lang.code];

  const pickFile = (file) => {
    if (file) onUpload(file);
  };

  return (
    <div
      className={`admin-card resume-card${dragging ? ' resume-card--dragging' : ''}`}
      onDragOver={(e) => { e.preventDefault(); if (!busy) setDragging(true); }}
      onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setDragging(false); }}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        if (!busy) pickFile(e.dataTransfer.files?.[0]);
      }}
    >
      <div className="resume-card-header">
        <h2 className="resume-card-title">
          <span aria-hidden="true">{lang.flag}</span> {lang.label}
        </h2>
        <span className={`resume-status ${row ? 'resume-status--custom' : ''}`}>
          {row ? 'Uploaded' : 'Bundled default'}
        </span>
      </div>

      <div className="resume-file">
        <FileText size={28} className="resume-file-icon" aria-hidden="true" />
        {row ? (
          <div className="resume-file-meta">
            <span className="resume-file-name" title={row.file_name}>{row.file_name}</span>
            <span className="resume-file-sub">
              {formatBytes(row.file_size)} · Updated {formatDate(row.updated_at)}
            </span>
          </div>
        ) : (
          <div className="resume-file-meta">
            <span className="resume-file-name">{DEFAULT_RESUME_URLS[lang.code].split('/').pop()}</span>
            <span className="resume-file-sub">File shipped with the site in /public/resume</span>
          </div>
        )}
      </div>

      <button
        type="button"
        className="resume-dropzone"
        onClick={() => inputRef.current?.click()}
        disabled={busy}
      >
        {busy ? (
          <>
            <span className="resume-spinner" aria-hidden="true" />
            Working…
          </>
        ) : (
          <>
            <UploadCloud size={22} aria-hidden="true" />
            <span><strong>Replace PDF</strong> — click or drop a file here</span>
            <span className="resume-dropzone-hint">PDF only · up to 5 MB</span>
          </>
        )}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,.pdf"
        hidden
        onChange={(e) => {
          pickFile(e.target.files?.[0]);
          e.target.value = '';
        }}
      />

      <div className="resume-actions">
        <a href={previewUrl} target="_blank" rel="noopener noreferrer" className="admin-btn admin-btn-secondary">
          <Eye size={16} aria-hidden="true" /> Preview
        </a>
        {row && !confirming && (
          <button type="button" className="admin-btn admin-btn-danger" onClick={onAskReset} disabled={busy}>
            <RotateCcw size={16} aria-hidden="true" /> Reset to default
          </button>
        )}
      </div>

      {row && confirming && (
        <div className="resume-confirm" role="alert">
          <p>Delete the uploaded file and go back to the bundled default?</p>
          <div className="resume-confirm-actions">
            <button type="button" className="admin-btn admin-btn-secondary" onClick={onCancelReset}>Cancel</button>
            <button type="button" className="admin-btn admin-btn-danger" onClick={onReset} disabled={busy}>Reset</button>
          </div>
        </div>
      )}
    </div>
  );
};

const ResumeManager = () => {
  const [rows, setRows] = useState({});
  const [loading, setLoading] = useState(true);
  const [setupNeeded, setSetupNeeded] = useState(false);
  const [busyLang, setBusyLang] = useState(null);
  const [confirmLang, setConfirmLang] = useState(null);
  const [downloads, setDownloads] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => setToast({ show: true, message, type });
  const closeToast = useCallback(() => setToast((t) => ({ ...t, show: false })), []);

  useEffect(() => {
    getResumes()
      .then((data) => setRows(Object.fromEntries(data.map((r) => [r.lang, r]))))
      .catch((error) => {
        if (isMissingTable(error)) setSetupNeeded(true);
        else showToast(error?.message || 'Failed to load resumes', 'error');
      })
      .finally(() => setLoading(false));

    const to = new Date();
    const from = new Date(to.getTime() - DOWNLOAD_WINDOW_DAYS * 24 * 60 * 60 * 1000);
    getOverview(from, to)
      .then((d) => setDownloads(d?.resume_downloads ?? 0))
      .catch(() => setDownloads(null));
  }, []);

  const handleUpload = async (lang, file) => {
    const problem = validateResumeFile(file);
    if (problem) {
      showToast(problem, 'error');
      return;
    }
    setBusyLang(lang);
    try {
      const saved = await uploadResume(lang, file, rows[lang]);
      setRows((prev) => ({ ...prev, [lang]: saved }));
      showToast(`${lang.toUpperCase()} resume updated`);
    } catch (error) {
      showToast(error?.message || 'Upload failed', 'error');
    } finally {
      setBusyLang(null);
    }
  };

  const handleReset = async (lang) => {
    setBusyLang(lang);
    try {
      await resetResume(rows[lang]);
      setRows((prev) => {
        const next = { ...prev };
        delete next[lang];
        return next;
      });
      showToast(`${lang.toUpperCase()} resume reset to the bundled default`);
    } catch (error) {
      showToast(error?.message || 'Reset failed', 'error');
    } finally {
      setBusyLang(null);
      setConfirmLang(null);
    }
  };

  return (
    <div className="admin-page-container">
      <div className="admin-page-header">
        <h1 className="admin-page-title">Resume</h1>
        <div className="resume-downloads" title={`resume_download events, last ${DOWNLOAD_WINDOW_DAYS} days`}>
          <Download size={16} aria-hidden="true" />
          <span className="resume-downloads-value">{downloads ?? '—'}</span>
          downloads · {DOWNLOAD_WINDOW_DAYS} days
        </div>
      </div>

      {setupNeeded && (
        <div className="admin-card resume-setup">
          <strong>Database setup required.</strong> Run <code>supabase/resumes.sql</code> in the Supabase
          SQL Editor to create the <code>resumes</code> bucket and <code>site_resumes</code> table.
          Until then the site keeps serving the bundled PDFs.
        </div>
      )}

      {loading ? (
        <div className="resume-loading">
          <span className="resume-spinner" aria-hidden="true" />
          Loading resumes…
        </div>
      ) : (
        <div className="resume-grid">
          {RESUME_LANGS.map((lang) => (
            <ResumeCard
              key={lang.code}
              lang={lang}
              row={rows[lang.code]}
              busy={busyLang === lang.code || setupNeeded}
              confirming={confirmLang === lang.code}
              onUpload={(file) => handleUpload(lang.code, file)}
              onAskReset={() => setConfirmLang(lang.code)}
              onCancelReset={() => setConfirmLang(null)}
              onReset={() => handleReset(lang.code)}
            />
          ))}
        </div>
      )}

      {toast.show && <Toast message={toast.message} type={toast.type} onClose={closeToast} />}
    </div>
  );
};

export default ResumeManager;
