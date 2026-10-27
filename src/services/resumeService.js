import { supabase } from '../lib/supabase';
import { validateResumeFile } from './resumeFile';

export { validateResumeFile, formatBytes, MAX_RESUME_BYTES } from './resumeFile';

const BUCKET = 'resumes';

export const RESUME_LANGS = [
  { code: 'th', label: 'ภาษาไทย (TH)', flag: '🇹🇭' },
  { code: 'en', label: 'English (ENG)', flag: '🇺🇸' },
];

// Bundled files in /public, used until a resume is uploaded (or if Supabase is unreachable)
export const DEFAULT_RESUME_URLS = {
  th: '/resume/resume-th.pdf',
  en: '/resume/resume-en.pdf',
};

export function resumePublicUrl(filePath) {
  return supabase.storage.from(BUCKET).getPublicUrl(filePath).data.publicUrl;
}

// ─── Public ─────────────────────────────────────────
let urlsPromise = null;

/** { th, en } download URLs. Fetched once per page load and shared by every button. */
export function getResumeUrls() {
  if (!urlsPromise) {
    urlsPromise = getResumes()
      .then((rows) => {
        const urls = { ...DEFAULT_RESUME_URLS };
        rows.forEach((row) => { urls[row.lang] = resumePublicUrl(row.file_path); });
        return urls;
      })
      .catch((err) => {
        console.warn('Falling back to bundled resumes:', err?.message || err);
        return { ...DEFAULT_RESUME_URLS };
      });
  }
  return urlsPromise;
}

// ─── Admin ──────────────────────────────────────────
export async function getResumes() {
  const { data, error } = await supabase.from('site_resumes').select('*');
  if (error) throw error;
  return data || [];
}

/**
 * Upload a new resume for `lang`, point site_resumes at it, then remove the old file.
 * A unique path per upload avoids the CDN serving a cached older PDF.
 * If saving the row fails, the freshly uploaded file is removed and the old one is kept.
 */
export async function uploadResume(lang, file, previous) {
  const problem = validateResumeFile(file);
  if (problem) throw new Error(problem);

  const filePath = `${lang}/resume-${Date.now()}.pdf`;
  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(filePath, file, { cacheControl: '3600', upsert: false, contentType: 'application/pdf' });
  if (uploadError) throw uploadError;

  const { data, error } = await supabase
    .from('site_resumes')
    .upsert({ lang, file_path: filePath, file_name: file.name, file_size: file.size }, { onConflict: 'lang' })
    .select()
    .single();
  if (error) {
    await supabase.storage.from(BUCKET).remove([filePath]);
    throw error;
  }

  if (previous?.file_path && previous.file_path !== filePath) {
    const { error: removeError } = await supabase.storage.from(BUCKET).remove([previous.file_path]);
    if (removeError) console.warn('Failed to delete old resume:', removeError.message);
  }
  return data;
}

/** Drop the uploaded resume for this language so the site uses the bundled default again. */
export async function resetResume(row) {
  const { error } = await supabase.from('site_resumes').delete().eq('lang', row.lang);
  if (error) throw error;

  const { error: removeError } = await supabase.storage.from(BUCKET).remove([row.file_path]);
  if (removeError) console.warn('Failed to delete resume file:', removeError.message);
}
