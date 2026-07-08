import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { ticketsApi } from '../services/api'

export default function CreateTicket() {
  const { register, handleSubmit, formState: { errors } } = useForm()
  const navigate = useNavigate()

  const onSubmit = async (data) => {
    const res = await ticketsApi.create({
      ...data,
      statut: 'nouveau',
      dateCreation: new Date().toISOString(),
      commentaires: []
    })
    navigate(`/tickets/${res.data.id}`)
  }

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-xl font-semibold mb-6">Nouveau ticket</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
        <div>
          <label className="block text-sm text-gray-600 mb-1">Titre</label>
          <input
            {...register('titre', { required: 'Le titre est requis' })}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
            placeholder="Résumé court du problème"
          />
          {errors.titre && <p className="text-xs text-red-500 mt-1">{errors.titre.message}</p>}
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">Description</label>
          <textarea
            {...register('description', { required: 'La description est requise' })}
            rows={4}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
            placeholder="Décrivez le problème en détail..."
          />
          {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Catégorie</label>
            <select {...register('categorie')} className="w-full border border-gray-300 rounded-md px-3 py-2">
              <option value="materiel">Matériel</option>
              <option value="logiciel">Logiciel</option>
              <option value="reseau">Réseau</option>
              <option value="autre">Autre</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Priorité</label>
            <select {...register('priorite')} className="w-full border border-gray-300 rounded-md px-3 py-2">
              <option value="low">Basse</option>
              <option value="medium">Moyenne</option>
              <option value="high">Haute</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
        </div>

        <button type="submit" className="w-full bg-primary text-white rounded-md py-2 font-medium">
          Créer le ticket
        </button>
      </form>
    </div>
  )
}
