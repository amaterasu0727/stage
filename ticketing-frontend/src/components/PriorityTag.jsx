const PRIORITY_CONFIG = {
  urgent: { label: 'Urgent', dot: 'bg-urgent', text: 'text-urgent' },
  high: { label: 'Haute', dot: 'bg-high', text: 'text-high' },
  medium: { label: 'Moyenne', dot: 'bg-medium', text: 'text-medium' },
  low: { label: 'Basse', dot: 'bg-low', text: 'text-low' }
}

export default function PriorityTag({ priorite }) {
  const config = PRIORITY_CONFIG[priorite] || PRIORITY_CONFIG.medium
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${config.text}`}>
      <span className={`w-2 h-2 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  )
}
