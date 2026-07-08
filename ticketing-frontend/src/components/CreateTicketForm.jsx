import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { ticketsApi } from '../services/api'

const CATEGORIES = [
  { value: 'materiel', label: 'Matériel' },
  { value: 'logiciel', label: 'Logiciel' },
  { value: 'reseau', label: 'Réseau' },
  { value: 'autre', label: 'Autre' }
]

export default function CreateTicketForm({ onSuccess }) {
  const { register, handleSubmit, formState: { errors } } = useForm()
  const [categorie, setCategorie] = useState('materiel')
  const [fichiers, setFichiers] = useState([])

  const gererAjoutFichiers = (e) => {
    const nouveauxFichiers = Array.from(e.target.files)
    setFichiers([...fichiers, ...nouveauxFichiers])
  }

  const retirerFichier = (index) => {
    setFichiers(fichiers.filter((_, i) => i !== index))
  }

  const onSubmit = async (data) => {
    // TODO (avec le binôme) : une fois l'API réelle prête, envoyer les fichiers
    // en multipart/form-data plutôt que juste leurs noms.
    const res = await ticketsApi.create({
      ...data,
      categorie,
      statut: 'nouveau',
      priorite: 'medium',
      dateCreation: new Date().toISOString(),
      commentaires: [],
      piecesJointes: fichiers.map((f) => f.name)
    })
    onSuccess(res.data)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm text-gray-600 mb-1">Titre</label>
        <input
          {...register('titre')}
          className="w-full border border-gray-300 rounded-md px-3 py-2"
          placeholder="Résumé court du problème (optionnel)"
        />
      </div>

      <div>
        <label className="block text-sm text-gray-600 mb-1">Description *</label>
        <textarea
          {...register('description', { required: 'La description est requise' })}
          rows={3}
          className="w-full border border-gray-300 rounded-md px-3 py-2"
          placeholder="Décrivez le problème en détail..."
        />
        {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description.message}</p>}
      </div>

      <div>
        <label className="block text-sm text-gray-600 mb-1">Pièces jointes</label>
        <input
          type="file"
          multiple
          accept="image/*,.pdf,.doc,.docx"
          onChange={gererAjoutFichiers}
          className="w-full text-sm text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
        />
        {fichiers.length > 0 && (
          <ul className="mt-2 space-y-1">
            {fichiers.map((f, i) => (
              <li key={i} className="flex items-center justify-between text-xs bg-gray-50 rounded-md px-3 py-1.5">
                <span className="truncate">{f.name}</span>
                <button
                  type="button"
                  onClick={() => retirerFichier(i)}
                  className="text-red-500 hover:underline ml-2"
                >
                  Retirer
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <label className="block text-sm text-gray-600 mb-2">Catégorie</label>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              type="button"
              onClick={() => setCategorie(cat.value)}
              className={`text-sm px-3 py-1.5 rounded-md border transition ${
                categorie === cat.value
                  ? 'bg-primary text-white border-primary'
                  : 'border-gray-300 text-gray-600 hover:bg-hoverAccent hover:text-white hover:border-hoverAccent'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      <button type="submit" className="w-full bg-primary text-white rounded-md py-2 font-medium hover:bg-hoverAccent transition">
        Créer le ticket
      </button>
    </form>
  )
}