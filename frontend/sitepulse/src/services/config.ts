// Integration boundary configuration.
//
// The API is served by the NestJS backend under the `/api` prefix. In
// development the Vite dev server proxies `/api` → http://localhost:6542;
// in production the backend serves the built frontend from the same origin.
export const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? '/api';
