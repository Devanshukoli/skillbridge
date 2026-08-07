export const API_URL = import.meta.env.VITE_API_URL || '';

/**
 * Helper function for making API requests using VITE_API_URL.
 * Calls fetch(`${API_URL}${path}`, init) for relative paths.
 */
export async function api(path: string, init?: RequestInit): Promise<Response> {
  const url = path.startsWith('http') ? path : (path.startsWith('/') ? `${API_URL}${path}` : `${API_URL}/${path}`);
  return fetch(url, init);
}
