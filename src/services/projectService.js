import { supabase } from '../lib/supabase';

// ─── Public ─────────────────────────────────────────
export async function getPublishedProjects() {
  const { data, error } = await supabase
    .from('portfolio_projects')
    .select('*')
    .eq('is_published', true)
    .order('sort_order', { ascending: true });
  if (error) throw error;
  return data;
}

// ─── Admin ──────────────────────────────────────────
export async function getAllProjects() {
  const { data, error } = await supabase
    .from('portfolio_projects')
    .select('*')
    .order('sort_order', { ascending: true });
  if (error) throw error;
  return data;
}

export async function createProject(project) {
  const { data, error } = await supabase
    .from('portfolio_projects')
    .insert([project])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateProject(id, updates) {
  const { data, error } = await supabase
    .from('portfolio_projects')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteProject(id) {
  const { error } = await supabase
    .from('portfolio_projects')
    .delete()
    .eq('id', id);
  if (error) throw error;
}

// ─── Storage ────────────────────────────────────────
export async function uploadProjectImage(file) {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
  const filePath = `projects/${fileName}`;

  const { error } = await supabase.storage
    .from('portfolio-images')
    .upload(filePath, file);
  if (error) throw error;

  const { data: { publicUrl } } = supabase.storage
    .from('portfolio-images')
    .getPublicUrl(filePath);

  return publicUrl;
}

export async function deleteProjectImage(imageUrl) {
  if (!imageUrl || !imageUrl.includes('portfolio-images')) return;
  // Extract the storage path from the full URL
  const path = imageUrl.split('portfolio-images/')[1];
  if (!path) return;
  const { error } = await supabase.storage
    .from('portfolio-images')
    .remove([path]);
  if (error) console.warn('Failed to delete image:', error.message);
}

// ─── Admin check ────────────────────────────────────
export async function checkIsAdmin(userId) {
  const { data, error } = await supabase
    .from('admin_users')
    .select('user_id')
    .eq('user_id', userId)
    .single();
  if (error) return false;
  return !!data;
}
