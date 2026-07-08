import { useEffect, useState } from 'react'
import { ticketsApi } from '../services/api'
import TicketCard from '../components/TicketCard'
import Modal from '../components/Modal'
import CreateTicketForm from '../components/CreateTicketForm'


export default function TicketList() {
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [filtreStatut, setFiltreStatut] = useState('tous')
  const [recherche, setRecherche] = useState('')
  const [modaleOuverte, setModaleOuverte] = useState(false)


  useEffect(() => {
    ticketsApi
      .getAll()
      .then((res) => setTickets(res.data))
      .catch((err) => console.error('Erreur chargement tickets', err))
      .finally(() => setLoading(false))
  }, [])

  const ticketsFiltres = tickets.filter((t) => {
    const matchStatut = filtreStatut === 'tous' || t.statut === filtreStatut
    const matchRecherche = t.titre.toLowerCase().includes(recherche.toLowerCase())
    return matchStatut && matchRecherche
  })

    const gererNouveauTicket = (ticketCree) => {
    setTickets([ticketCree, ...tickets])
    setModaleOuverte(false)
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold">Tickets</h1>
        <button
          onClick={() => setModaleOuverte(true)}
          className="bg-primary text-white text-sm px-4 py-2 rounded-md font-medium"
        >
          + Nouveau ticket
        </button> 
      </div>


      <div className="flex gap-3 mb-4">
        <input
          type="text"
          placeholder="Rechercher un ticket..."
          value={recherche}
          onChange={(e) => setRecherche(e.target.value)}
          className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <select
          value={filtreStatut}
          onChange={(e) => setFiltreStatut(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm"
        >
          <option value="tous">Tous les statuts</option>
          <option value="nouveau">Nouveau</option>
          <option value="assigne">Assigné</option>
          <option value="en_cours">En cours</option>
          <option value="resolu">Résolu</option>
          <option value="ferme">Fermé</option>
        </select>
      </div>

      {loading && <p className="text-gray-400 text-sm">Chargement...</p>}
      {!loading && ticketsFiltres.length === 0 && (
        <p className="text-gray-400 text-sm">Aucun ticket ne correspond à votre recherche.</p>
      )}

      <div className="space-y-3">
        {ticketsFiltres.map((ticket) => (
          <TicketCard key={ticket.id} ticket={ticket} />
        ))}
      </div>

            <Modal
        isOpen={modaleOuverte}
        onClose={() => setModaleOuverte(false)}
        title="Créer un ticket"
      >
        <CreateTicketForm onSuccess={gererNouveauTicket} />
      </Modal>
    </div>
  )
}
