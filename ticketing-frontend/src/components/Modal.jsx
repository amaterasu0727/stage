export default function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Fond sombre cliquable pour fermer */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />

      {/* Contenu de la modale */}
      <div className="relative bg-white rounded-lg shadow-lg w-full max-w-md p-6 mx-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl leading-none"
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
