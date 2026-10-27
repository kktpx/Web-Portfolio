// Pure helpers for resume uploads (no Supabase import, so they run under node:test).
export const MAX_RESUME_BYTES = 5 * 1024 * 1024;

/** Returns an error message, or null when the file is acceptable. */
export function validateResumeFile(file) {
  if (!file) return 'No file selected';
  const isPdf = file.type === 'application/pdf' || /\.pdf$/i.test(file.name || '');
  if (!isPdf) return 'Only PDF files are allowed';
  if (file.size === 0) return 'File is empty';
  if (file.size > MAX_RESUME_BYTES) return 'File is larger than 5 MB';
  return null;
}

export function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 KB';
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}
