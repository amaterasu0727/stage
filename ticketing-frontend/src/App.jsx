import { Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import Login from './pages/Login'
import TicketList from './pages/TicketList'
import TicketDetail from './pages/TicketDetail'
import CreateTicket from './pages/CreateTicket'

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Routes>
        <Route path="/" element={<Navigate to="/tickets" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/tickets" element={<TicketList />} />
        <Route path="/tickets/new" element={<CreateTicket />} />
        <Route path="/tickets/:id" element={<TicketDetail />} />
      </Routes>
    </div>
  )
}
