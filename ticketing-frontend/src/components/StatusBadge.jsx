const STATUS_CONFIG = {
  nouveau: { label: 'Nouveau', classes: 'bg-blue-100 text-blue-700' },
  assigne: { label: 'Assigné', classes: 'bg-purple-100 text-purple-700' },
  en_cours: { label: 'En cours', classes: 'bg-amber-100 text-amber-700' },
  resolu: { label: 'Résolu', classes: 'bg-green-100 text-green-700' },
  ferme: { label: 'Fermé', classes: 'bg-gray-100 text-gray-600' }
}

export default function StatusBadge({ statut }) {
  const config = STATUS_CONFIG[statut] || STATUS_CONFIG.nouveau
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${config.classes}`}>
      {config.label}
    </span>
  )
}
