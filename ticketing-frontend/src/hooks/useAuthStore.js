import { create } from 'zustand'

// State global simple : qui est connecté, quel rôle.
// Rôles possibles : 'user' (demandeur), 'agent' (technicien), 'admin'
const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,

  login: (userData, token) => {
    localStorage.setItem('token', token)
    set({ user: userData, isAuthenticated: true })
  },

  logout: () => {
    localStorage.removeItem('token')
    set({ user: null, isAuthenticated: false })
  },

  setUser: (userData) => set({ user: userData, isAuthenticated: !!userData })
}))

export default useAuthStore
