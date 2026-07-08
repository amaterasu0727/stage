import axios from 'axios'

// IMPORTANT : une seule base URL à changer le jour où le backend réel est prêt.
// En attendant, on pointe vers json-server (mock-api) qui lit src/mocks/db.json
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' }
})

// Injecte automatiquement le token JWT si présent
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Gestion centralisée des erreurs (401 -> déconnexion, etc.)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// --- Endpoints tickets ---
export const ticketsApi = {
  getAll: (params) => api.get('/tickets', { params }),
  getById: (id) => api.get(`/tickets/${id}`),
  create: (data) => api.post('/tickets', data),
  update: (id, data) => api.patch(`/tickets/${id}`, data),
  addComment: (id, comment) => api.post(`/tickets/${id}/comments`, comment)
}

// --- Endpoints auth ---
export const authApi = {
  login: (credentials) => api.post('/login', credentials),
  register: (data) => api.post('/register', data),
  me: () => api.get('/me')
}

export default api
