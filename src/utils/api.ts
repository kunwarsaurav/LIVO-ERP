// A lightweight fetch wrapper that mimics axios to avoid Next.js client bundling errors with axios
const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || '/api';

const request = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${baseURL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const response = await fetch(url, { ...options, headers });
  
  if (!response.ok) {

    // For other endpoints that fail (404), return empty array so UI doesn't crash
    if (response.status === 404) {
      return { data: [] };
    }
    
    throw new Error(`API error: ${response.statusText}`);
  }
  
  const data = await response.json();
  return { data };
};

const api = {
  get: (endpoint: string) => request(endpoint, { method: 'GET' }),
  post: (endpoint: string, body?: any) => request(endpoint, { method: 'POST', body: body ? JSON.stringify(body) : undefined }),
  put: (endpoint: string, body?: any) => request(endpoint, { method: 'PUT', body: body ? JSON.stringify(body) : undefined }),
  delete: (endpoint: string) => request(endpoint, { method: 'DELETE' }),
};

export default api;
