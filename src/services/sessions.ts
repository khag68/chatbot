//import { v4 as uuidv4 } from 'uuid'
import { Message } from '@anthropic-ai/sdk/resources/messages/messages'
import { ChatSession } from '../../types'
//import { ChatSession, Message } from '../types'

export class SessionManager {
  private sessions = new Map<string, ChatSession>()
  private sessionTimeout: number

  constructor(sessionTimeout = 3600000) { // 1 heure par défaut
    this.sessionTimeout = sessionTimeout
    this.startCleanupInterval()
  }

  createSession(): ChatSession {
    const session: ChatSession = {
      id: uuidv4(),
      messages: [],
      createdAt: new Date(),
      lastActivity: new Date()
    }
    
    this.sessions.set(session.id, session)
    return session
  }

  getSession(sessionId: string): ChatSession | undefined {
    const session = this.sessions.get(sessionId)
    if (session) {
      session.lastActivity = new Date()
    }
    return session
  }

  addMessage(sessionId: string, message: Message): void {
    const session = this.getSession(sessionId)
    if (session) {
      session.messages.push(message)
      session.lastActivity = new Date()
      
      // Limiter l'historique pour éviter la surcharge
      if (session.messages.length > parseInt(process.env.MAX_MESSAGE_HISTORY || '50')) {
        session.messages = session.messages.slice(-parseInt(process.env.MAX_MESSAGE_HISTORY || '50'))
      }
    }
  }

  private startCleanupInterval(): void {
    setInterval(() => {
      const now = new Date()
      for (const [sessionId, session] of this.sessions) {
        if (now.getTime() - session.lastActivity.getTime() > this.sessionTimeout) {
          this.sessions.delete(sessionId)
        }
      }
    }, 300000) // Nettoyage toutes les 5 minutes
  }

  getSessionCount(): number {
    return this.sessions.size
  }
}

function uuidv4(): string {
    throw new Error('Function not implemented.')
}
