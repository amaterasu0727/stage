import { Link } from 'react-router-dom'
import StatusBadge from './StatusBadge'
import PriorityTag from './PriorityTag'

export default function TicketCard({ ticket }) {
  return (
    <Link
      to={`/tickets/${ticket.id}`}
      className="block bg-white border border-gray-200 rounded-lg p-4 hover:border-primary hover:shadow-sm transition"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs text-gray-400 mb-1">#{ticket.id} · {ticket.categorie}</p>
          <h3 className="font-medium text-gray-900 truncate">{ticket.titre}</h3>
          <p className="text-sm text-gray-500 mt-1 line-clamp-2">{ticket.description}</p>
        </div>
        <div className="flex flex-col items-end gap-2 shrink-0">
          <StatusBadge statut={ticket.statut} />
          <PriorityTag priorite={ticket.priorite} />
        </div>
      </div>
      <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
        <span>Demandeur : {ticket.demandeur}</span>
        <span>{ticket.assigneA ? `Assigné à ${ticket.assigneA}` : 'Non assigné'}</span>
      </div>
    </Link>
  )
}
