import { Message } from "@anthropic-ai/sdk/resources/messages"

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
  timestamp: Date
}
export interface ChatSession {
  id: string
  messages: Message[]
  createdAt: Date
  lastActivity: Date
}

export interface ChatRequest {
  message: string
  conversation?: ChatMessage[]
  model?: string
  temperature?: number
  maxTokens?: number
  sessionId?: string
  stream?: boolean
}

export interface ChatResponse {
  success: boolean
  sessionId: string
  message?: string
  error?: string
  conversation: ChatMessage[]
  usage?: {
    input_tokens: number
    output_tokens: number
    totalTokens: number
  }
}