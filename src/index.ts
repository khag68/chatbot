//import { Elysia } from 'elysia'
//import { cors } from '@elysiajs/cors'
//import { staticPlugin } from '@elysiajs/static'
//import { swagger } from '@elysiajs/swagger'
//import { v4 as uuidv4 } from 'uuid'

import Elysia from 'elysia'
import { AnthropicService } from './services/anthropic'
//import { SessionManager } from './services/session'
//import { ChatRequest, ChatResponse, Message } from './types'
import swagger from '@elysiajs/swagger'
import { SessionManager } from './services/sessions'
import { ChatRequest, ChatResponse } from '../types'
import { Message } from '@anthropic-ai/sdk/resources/messages/messages'

const app = new Elysia()
  .use(cors({
    origin: true,
    methods: ['GET', 'POST'],
    credentials: true
  }))
  .use(staticPlugin({
    assets: 'public',
    prefix: '/'
  }))
  .use(swagger({
    documentation: {
      info: {
        title: 'Chatbot API',
        version: '1.0.0',
        description: 'API pour chatbot avec Anthropic Claude'
      }
    }
  }))
  .state('anthropic', new AnthropicService(process.env.ANTHROPIC_API_KEY!))
  .state('sessionManager', new SessionManager())

// Route pour démarrer une nouvelle session
app.post('/api/session/new', ({ store }) => {
  const session = store.sessionManager.createSession()
  return {
    success: true,
    sessionId: session.id,
    message: 'Nouvelle session créée'
  }
})

// Route pour envoyer un message
app.post('/api/chat', async ({ body, store, set }) => {
  try {
    const { message, sessionId, stream = false } = body as ChatRequest

    if (!message?.trim()) {
      set.status = 400
      return { success: false, error: 'Message requis' }
    }

    // Récupérer ou créer une session
    let session = sessionId ? store.sessionManager.getSession(sessionId) : null
    if (!session) {
      session = store.sessionManager.createSession()
    }

    // Ajouter le message utilisateur
    const userMessage: Message = {
      id: uuidv4(),
      role: 'user',
      content: message.trim(),
      timestamp: new Date()
    }
    store.sessionManager.addMessage(session.id, userMessage)

    if (stream) {
      // Streaming response
      const streamResponse = await store.anthropic.sendMessage(
        session.messages,
        { stream: true }
      ) as ReadableStream

      set.headers = {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      }

      let fullResponse = ''
      const encoder = new TextEncoder()

      return new Response(
        new ReadableStream({
          async start(controller) {
            try {
              controller.enqueue(encoder.encode(`data: {"type":"session","sessionId":"${session.id}"}\n\n`))

              for await (const chunk of store.anthropic.streamResponse(streamResponse)) {
                fullResponse += chunk
                controller.enqueue(encoder.encode(`data: {"type":"chunk","content":"${chunk.replace(/"/g, '\\"')}"}\n\n`))
              }

              // Sauvegarder la réponse complète
              const assistantMessage: Message = {
                id: uuidv4(),
                role: 'assistant',
                content: fullResponse,
                timestamp: new Date()
              }
              store.sessionManager.addMessage(session.id, assistantMessage)

              controller.enqueue(encoder.encode(`data: {"type":"done","message":"${fullResponse.replace(/"/g, '\\"')}"}\n\n`))
              controller.close()
            } catch (error) {
              controller.enqueue(encoder.encode(`data: {"type":"error","error":"${error instanceof Error ? error.message : 'Erreur inconnue'}"}\n\n`))
              controller.close()
            }
          }
        }),
        {
          headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive'
          }
        }
      )
    } else {
      // Réponse normale
      const response = await store.anthropic.sendMessage(session.messages)
      const assistantMessage: Message = {
        id: uuidv4(),
        role: 'assistant',
        content: response.content[0]?.text || '',
        timestamp: new Date()
      }
      store.sessionManager.addMessage(session.id, assistantMessage)

      const chatResponse: ChatResponse = {
        success: true,
        sessionId: session.id,
        message: assistantMessage.content,
        usage: response.usage
      }

      return chatResponse
    }
  } catch (error) {
    set.status = 500
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur serveur'
    }
  }
})

// Route pour récupérer l'historique d'une session
app.get('/api/session/:sessionId', ({ params, store }) => {
  const session = store.sessionManager.getSession(params.sessionId)
  if (!session) {
    return { success: false, error: 'Session non trouvée' }
  }

  return {
    success: true,
    session: {
      id: session.id,
      messages: session.messages,
      createdAt: session.createdAt
    }
  }
})

// Route de statistiques
app.get('/api/stats', ({ store }) => ({
  activeSessions: store.sessionManager.getSessionCount(),
  uptime: process.uptime(),
  timestamp: new Date().toISOString()
}))

// Route de santé
app.get('/api/health', () => ({
  status: 'OK',
  service: 'Chatbot API',
  anthropic: !!process.env.ANTHROPIC_API_KEY
}))

const port = parseInt(process.env.PORT || '3000')
app.listen(port)

console.log(`🤖 Chatbot API démarré sur http://localhost:${port}`)
console.log(`📚 Documentation Swagger: http://localhost:${port}/swagger`)

export default app

function cors(arg0: { origin: boolean; methods: string[]; credentials: boolean }): any {
  throw new Error('Function not implemented.')
}
function staticPlugin(arg0: { assets: string; prefix: string }): any {
  throw new Error('Function not implemented.')
}

function uuidv4(): string {
  throw new Error('Function not implemented.')
}

