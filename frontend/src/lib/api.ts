// Base URL of the backend API.
// - Local dev: empty string → Vite proxies /api to localhost:8000
// - Production (Render/Vercel): set VITE_API_URL to the deployed backend,
//   e.g. https://call-analyser-api.onrender.com
export const API_BASE: string = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '')

export const api = (path: string) => `${API_BASE}${path}`
