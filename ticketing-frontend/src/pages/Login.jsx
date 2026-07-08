import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../hooks/useAuthStore'

export default function Login() {
  const { register, handleSubmit, formState: { errors } } = useForm()
  const login = useAuthStore((s) => s.login)
  const navigate = useNavigate()

  const onSubmit = async (data) => {
    // TODO: remplacer par authApi.login(data) une fois le backend branché
    // Simulation pour le développement en mock :
    const fakeUser = { nom: 'Utilisateur Démo', email: data.email, role: 'user' }
    login(fakeUser, 'fake-jwt-token')
    navigate('/tickets')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 w-full max-w-sm"
      >
        <h1 className="text-xl font-semibold mb-6">Connexion</h1>

        <label className="block text-sm text-gray-600 mb-1">Email</label>
        <input
          type="email"
          {...register('email', { required: 'Email requis' })}
          className="w-full border border-gray-300 rounded-md px-3 py-2 mb-1 focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="vous@exemple.com"
        />
        {errors.email && <p className="text-xs text-red-500 mb-3">{errors.email.message}</p>}

        <label className="block text-sm text-gray-600 mb-1 mt-3">Mot de passe</label>
        <input
          type="password"
          {...register('password', { required: 'Mot de passe requis' })}
          className="w-full border border-gray-300 rounded-md px-3 py-2 mb-1 focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="••••••••"
        />
        {errors.password && <p className="text-xs text-red-500 mb-3">{errors.password.message}</p>}

        <button
          type="submit"
          className="w-full bg-primary text-white rounded-md py-2 mt-4 font-medium hover:bg-blue-700 transition"
        >
          Se connecter
        </button>
      </form>
    </div>
  )
}
