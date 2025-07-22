

import { Message } from "@anthropic-ai/sdk/resources/messages/messages"
import { ChatMessage } from '../../types';

export class AnthropicService {
  private apiKey: string
  private baseUrl = 'https://api.anthropic.com/v1'

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  async sendMessage(
    messages: Message[],
    options: {
      model?: string
      maxTokens?: number
      temperature?: number
      stream?: boolean
    } = {}
  ) {
    const {
      model = 'claude-sonnet-4-20250514',
      maxTokens = 1000,
      temperature = 0.7,
      stream = false
    } = options

    // Convertir les messages au format Anthropic
    const ChatMessage: ChatMessage[] = messages.map(msg => ({
      role: msg.role,
      content: msg.content
    }))

    const requestBody = {
      model,
      max_tokens: maxTokens,
      temperature,
      messages: ChatMessage,
      ...(stream && { stream: true })
    }

    const response = await fetch(`${this.baseUrl}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(requestBody)
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Erreur Anthropic API: ${response.status} - ${error}`)
    }

    return stream ? response.body : response.json()
  }

  async *streamResponse(stream: ReadableStream) {
    const reader = stream.getReader()
    const decoder = new TextDecoder()

    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim()
            if (data === '[DONE]') return
            
            try {
              const parsed = JSON.parse(data)
              if (parsed.type === 'content_block_delta') {
                yield parsed.delta.text || ''
              }
            } catch (e) {
              // Ignorer les lignes non-JSON
            }
          }
        }
      }
    } finally {
      reader.releaseLock()
    }
  }
}