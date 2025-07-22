# Chatbot API avec Anthropic Claude et ElysiaJS

Une API moderne et scalable pour chatbot utilisant le SDK Anthropic Claude avec ElysiaJS.

## Fonctionnalités

- 🤖 Intégration complète avec Anthropic Claude
- 💬 Gestion des conversations persistantes
- 🔄 Support des messages multiples par conversation
- 📝 Documentation API automatique avec Swagger
- 🎛️ Configuration flexible des modèles
- ⚡ Performance optimisée avec Bun
- 🛡️ Gestion d'erreurs robuste
- 🌐 Support CORS configuré

## Installation

1. Cloner le projet
2. Installer les dépendances :
   ```bash
   bun install
   ```
3. Copier `.env.example` vers `.env` et configurer vos variables
4. Démarrer en mode développement :
   ```bash
   bun run dev
   ```

## Endpoints principaux

### POST /chat/message
Envoie un message et reçoit une réponse du chatbot.

### GET /chat/conversations
Récupère toutes les conversations.

### GET /chat/conversations/:id
Récupère une conversation spécifique.

### DELETE /chat/conversations/:id
Supprime une conversation.

### PATCH /chat/conversations/:id/title
Met à jour le titre d'une conversation.

## Architecture

```
src/
├── config/          # Configuration
├── controllers/     # Contrôleurs API
├── services/        # Services métier
├── middleware/      # Middlewares
├── types/          # Types TypeScript
└── index.ts        # Point d'entrée
```

## Utilisation

```javascript
// Exemple d'envoi de message
const response = await fetch('http://localhost:3000/chat/message', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: "Bonjour, comment allez-vous ?",
    model: "claude-3-sonnet-20240229",
    maxTokens: 1024,
    temperature: 0.7
  })
});

const data = await response.json();
console.log(data.message.content);
```
