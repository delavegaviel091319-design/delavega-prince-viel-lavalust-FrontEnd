import axios from 'axios'

// Base URL of the deployed (or local) LavaLust API. Set VITE_API_URL in .env
export const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/+$/, '')

const STORAGE_KEY = 'pm_auth'

/* ---------- token storage ---------- */
export function loadAuth() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || null
  } catch {
    return null
  }
}
export function saveAuth(auth) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(auth)) } catch { /* ignore */ }
}
export function clearAuth() {
  try { localStorage.removeItem(STORAGE_KEY) } catch { /* ignore */ }
}

/* ---------- axios instance ---------- */
const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: { 'Content-Type': 'application/json' },
})

// Attach the access token to every request
api.interceptors.request.use((config) => {
  const auth = loadAuth()
  if (auth?.tokens?.access_token) {
    config.headers.Authorization = `Bearer ${auth.tokens.access_token}`
  }
  return config
})

// When the access token expires (401) try ONE silent refresh, then retry.
let refreshing = null
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config
    const status = error.response?.status
    const isAuthCall = original?.url?.startsWith('/auth/')

    if (status === 401 && !original._retry && !isAuthCall) {
      original._retry = true
      const auth = loadAuth()
      if (auth?.tokens?.refresh_token) {
        try {
          refreshing =
            refreshing ||
            axios.post(`${API_URL}/api/auth/refresh`, { refresh_token: auth.tokens.refresh_token })
          const { data } = await refreshing
          refreshing = null
          saveAuth({ ...auth, tokens: data.tokens })
          original.headers.Authorization = `Bearer ${data.tokens.access_token}`
          return api(original)
        } catch (e) {
          refreshing = null
        }
      }
      clearAuth()
      window.dispatchEvent(new Event('pm:logout'))
    }
    return Promise.reject(error)
  }
)

/* ---------- helpers ---------- */
export function errorMessage(err) {
  const d = err?.response?.data
  if (d?.errors) return Object.values(d.errors).join(' ')
  if (d?.error) return d.error
  if (err?.code === 'ERR_NETWORK') return 'Cannot reach the API. Is the server running and is CORS configured?'
  return err?.message || 'Something went wrong.'
}

/* ---------- auth ---------- */
export const login = (username, password) => api.post('/auth/login', { username, password }).then((r) => r.data)
export const register = (payload) => api.post('/auth/register', payload).then((r) => r.data)
export const logout = (refresh_token) => api.post('/auth/logout', { refresh_token }).then((r) => r.data)

/* ---------- products ---------- */
export const getProducts = () => api.get('/products').then((r) => r.data.data)
export const addProduct = (p) => api.post('/products', p).then((r) => r.data)
export const updateProduct = (id, p) => api.put(`/products/${id}`, p).then((r) => r.data)
export const deleteProduct = (id) => api.delete(`/products/${id}`).then((r) => r.data)

export default api
