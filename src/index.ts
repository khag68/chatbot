import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import { swagger } from '@elysiajs/swagger';
import { config } from './config';
import { errorMiddleware } from './Middleware/error.middleware';
import { ChatController } from './Controllers/chatController';
import { AgentController } from './Controllers/agentController';

const chatController = new ChatController();
const agentController = new AgentController();

const app = new Elysia()
  .use(cors(config.cors))
  .use(swagger({
    documentation: {
      info: {
        title: 'Chatbot API',
        version: '1.0.0',
        description: 'API pour chatbot utilisant Anthropic Claude'
      },
      tags: [
        { name: 'Chat', description: 'Endpoints de chat' },
        { name: 'Conversations', description: 'Gestion des conversations' }
      ]
    }
  }))
  .use(errorMiddleware)
  .get('/', () => ({
    message: 'API Chatbot démarrée',
    version: '1.0.0',
    timestamp: new Date()
  }))
  .get('/health', () => ({
    status: 'OK',
    timestamp: new Date()
  }))
  .use(chatController.routes())
  .use(agentController.routes())
  .listen(config.port);

console.log(`🚀 Serveur démarré sur http://localhost:${config.port}`);
console.log(`📖 Documentation disponible sur http://localhost:${config.port}/swagger`);