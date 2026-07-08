# Ticketing Interventions — Frontend

## Démarrage

```bash
npm install
```

### 1. Lancer le mock backend (données fictives, en attendant l'API réelle)

```bash
npm run mock-api
```
→ Sert `src/mocks/db.json` sur `http://localhost:4000` avec les routes `/tickets`, `/users`.

### 2. Lancer le frontend (dans un autre terminal)

```bash
npm run dev
```
→ App disponible sur `http://localhost:5173`

## Brancher l'API réelle de ton binôme

Un seul endroit à changer : crée un fichier `.env` à la racine avec :
```
VITE_API_URL=http://localhost:3000/api
```
(remplace par l'URL réelle du backend). Tout le reste du code (`src/services/api.js`) reste inchangé si les routes suivent la même structure (`/tickets`, `/login`, etc.) — sinon adapte les chemins dans `api.js` uniquement.

## Structure

```
src/
  components/   → StatusBadge, PriorityTag, TicketCard, Navbar (réutilisables)
  pages/        → Login, TicketList, TicketDetail, CreateTicket
  services/     → api.js (TOUS les appels réseau centralisés ici)
  hooks/        → useAuthStore.js (état global : utilisateur connecté)
  mocks/        → db.json (données fictives pour dev sans backend)
```

## Prochaines étapes suggérées

1. Ajouter la page Dashboard agent/admin (stats, tickets assignés)
2. Ajouter la pagination sur la liste de tickets
3. Gérer l'upload de pièces jointes sur un ticket
4. Ajouter des notifications (toast) sur changement de statut
5. Protéger les routes selon le rôle (agent/admin only pour certaines pages)
