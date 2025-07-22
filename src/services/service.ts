//import { OpenAI } from 'openai';
import { AnthropicBeta } from '@anthropic-ai/sdk/resources/index';
import { ChatMessage, ChatRequest, ChatResponse } from '../../types';
import Anthropic from '@anthropic-ai/sdk';
export const config =  {
  defaultModel: 'claude-opus-4-20250514',
  temperature: 1,
  maxTokens: 1000,system: "Respond only with short poems.",
  messages: [
    {
      role: "user",
      content: [
        {
          type: "text",
          text: "Why is the ocean salty?"
        }
      ]
    }
  ],
  anthtopicApiKey: process.env.ANTHROPIC_API_KEY || '',
  port: parseInt(process.env['PORT'] || '3000', 10),
};

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY, // This is the default and can be omitted
});


// Services
class ChatbotService {
  private systemMessage: ChatMessage = {
    role: 'system',
    content: 'Tu es un assistant IA utile et bienveillant. Réponds de manière claire et concise en français.'
  }

  async generateResponse(request: ChatRequest): Promise<ChatResponse> {
    try {
      // Préparer la conversation
      const messages: ChatMessage[] = [
        this.systemMessage,
        ...(request.conversation || []),
        { role: 'user', content: request.message }
      ]

      // Appeler OpenAI
      const completion = await anthropic.chat.completions.create({
        model: request.model || config.defaultModel,
        messages: messages,
        max_tokens: request.maxTokens || config.maxTokens,
        temperature: request.temperature || config.temperature,
      })

      const assistantMessage = completion.choices[0]?.message?.content || 'Désolé, je n\'ai pas pu générer une réponse.'

      // Construire la réponse
      const updatedConversation: ChatMessage[] = [
        ...(request.conversation || []),
        { role: 'user', content: request.message },
        { role: 'assistant', content: assistantMessage }
      ]

      return {
        message: assistantMessage,
        conversation: updatedConversation,
        usage: {
          promptTokens: completion.usage?.prompt_tokens || 0,
          completionTokens: completion.usage?.completion_tokens || 0,
          totalTokens: completion.usage?.total_tokens || 0
        }
      }
    } catch (error) {
      console.error('Erreur lors de la génération de la réponse:', error)
      throw new Error('Impossible de générer une réponse')
    }
  }

  async streamResponse(request: ChatRequest): Promise<AsyncIterable<string>> {
    const messages: ChatMessage[] = [
      this.systemMessage,
      ...(request.conversation || []),
      { role: 'user', content: request.message }
    ]

    const stream = await anthropic.chat.completions.create({
      model: request.model || config.defaultModel,
      messages: messages,
      max_tokens: request.maxTokens || config.maxTokens,
      temperature: request.temperature || config.temperature,
      stream: true,
    })

    return this.processStream(stream)
  }

  private async* processStream(stream: AsyncIterable<Anthropic.Chat.Completions.ChatCompletionChunk>): AsyncIterable<string> {
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || ''
      if (content) {
        yield content
      }
    }
  }
}

export { ChatbotService };
export default ChatbotService;