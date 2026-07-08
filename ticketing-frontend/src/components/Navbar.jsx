import { Link, useNavigate } from 'react-router-dom'
import useAuthStore from '../hooks/useAuthStore'

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
      <Link to="/" className="font-semibold text-primary">Support Interventions</Link>
      <div className="flex items-center gap-4 text-sm">
        <Link to="/tickets" className="text-gray-600 hover:text-primary">Tickets</Link>
        <Link to="/tickets/new" className="text-gray-600 hover:text-primary">Nouveau ticket</Link>
        {isAuthenticated ? (
          <>
            <span className="text-gray-400">{user?.nom} ({user?.role})</span>
            <button onClick={handleLogout} className="text-red-500 hover:underline">Déconnexion</button>
          </>
        ) : (
          <Link to="/login" className="text-primary font-medium">Connexion</Link>
        )}
      </div>
    </nav>
  )
}
