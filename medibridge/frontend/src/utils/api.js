import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' }
})

// Request interceptor for auth token
api.interceptors.request.use(async (config) => {
  try {
    const { auth } = await import('./firebase')
    const token = await auth.currentUser?.getIdToken()
    if (token) config.headers.Authorization = `Bearer ${token}`
  } catch {}
  return config
})

api.interceptors.response.use(
  res => res,
  err => {
    const message = err.response?.data?.detail || 'Something went wrong. Please try again.'
    return Promise.reject(new Error(message))
  }
)

// ── Chat ──────────────────────────────────────────
export const sendMessage = (data) => api.post('/api/chat/message', data)
export const getChatHistory = (sessionId) => api.get(`/api/chat/history/${sessionId}`)
export const createChatSession = (data) => api.post('/api/chat/session', data)

// ── Reports ───────────────────────────────────────
export const analyzeReport = (formData) =>
  api.post('/api/reports/analyze', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
export const getUserReports = () => api.get('/api/reports/')

// ── Doctor Prep ───────────────────────────────────
export const generateDoctorPrep = (data) => api.post('/api/doctor-prep/generate', data)
export const getDoctorPreps = () => api.get('/api/doctor-prep/')

// ── User ──────────────────────────────────────────
export const getUserStats = () => api.get('/api/user/stats')
export const updateUserProfile = (data) => api.put('/api/user/profile', data)

// ── MediFlow AI ───────────────────────────────────
export const getMediFlowState = () => api.get('/api/mediflow/state')
export const runMediFlowDecision = () => api.post('/api/mediflow/run')
export const simulateMediFlowFailure = () => api.post('/api/mediflow/failure')
export const approveMediFlowReferral = () => api.post('/api/mediflow/approve')
export const resetMediFlowDemo = () => api.post('/api/mediflow/reset')

export default api
