import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { ticketsApi } from '../services/api'
import StatusBadge from '../components/StatusBadge'
import PriorityTag from '../components/PriorityTag'

export default function TicketDetail() {
  const { id } = useParams()
  const [ticket, setTicket] = useState(null)
  const [nouveauCommentaire, setNouveauCommentaire] = useState('')

  useEffect(() => {
    ticketsApi.getById(id).then((res) => setTicket(res.data))
  }, [id])

  const changerStatut = async (statut) => {
    const res = await ticketsApi.update(id, { statut })
    setTicket(res.data)
  }

  const envoyerCommentaire = async () => {
    if (!nouveauCommentaire.trim()) return
    const comment = { auteur: 'Moi', texte: nouveauCommentaire, date: new Date().toISOString() }
    await ticketsApi.addComment(id, comment)
    setTicket({ ...ticket, commentaires: [...(ticket.commentaires || []), comment] })
    setNouveauCommentaire('')
  }

  if (!ticket) return <p className="p-6 text-gray-400 text-sm">Chargement...</p>

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-start justify-between mb-2">
          <h1 className="text-lg font-semibold">{ticket.titre}</h1>
          <StatusBadge statut={ticket.statut} />
        </div>
        <div className="flex items-center gap-3 text-sm text-gray-500 mb-4">
          <PriorityTag priorite={ticket.priorite} />
          <span>·</span>
          <span>Demandeur : {ticket.demandeur}</span>
        </div>
        <p className="text-gray-700 mb-6">{ticket.description}</p>

        <div className="flex gap-2 mb-6">
          {['nouveau', 'assigne', 'en_cours', 'resolu', 'ferme'].map((s) => (
            <button
              key={s}
              onClick={() => changerStatut(s)}
              className={`text-xs px-3 py-1.5 rounded-md border ${
                ticket.statut === s ? 'bg-primary text-white border-primary' : 'border-gray-300 text-gray-600'
              }`}
            >
              {s.replace('_', ' ')}
            </button>
          ))}
        </div>

        <h2 className="text-sm font-medium mb-3">Échanges</h2>
        <div className="space-y-3 mb-4">
          {(ticket.commentaires || []).map((c, i) => (
            <div key={i} className="bg-gray-50 rounded-md p-3 text-sm">
              <p className="font-medium text-gray-700">{c.auteur}</p>
              <p className="text-gray-600">{c.texte}</p>
            </div>
          ))}
          {(!ticket.commentaires || ticket.commentaires.length === 0) && (
            <p className="text-gray-400 text-sm">Aucun échange pour l'instant.</p>
          )}
        </div>

        <div className="flex gap-2">
          <input
            value={nouveauCommentaire}
            onChange={(e) => setNouveauCommentaire(e.target.value)}
            placeholder="Ajouter un commentaire..."
            className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm"
          />
          <button
            onClick={envoyerCommentaire}
            className="bg-primary text-white px-4 py-2 rounded-md text-sm font-medium"
          >
            Envoyer
          </button>
        </div>
      </div>
    </div>
  )
}
