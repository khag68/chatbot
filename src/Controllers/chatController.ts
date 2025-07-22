import ChatbotService from "../services/service"
import { ChatRequest, ChatResponse, ChatMessage } from "../../types"

class ChatbotController {
  constructor(private chatbotService: ChatbotService) {}

  async chat(body: ChatRequest): Promise<ChatResponse> {
    return await this.chatbotService.generateResponse(body)
  }

  async streamChat(body: ChatRequest): Promise<Response> {
    const stream = await this.chatbotService.streamResponse(body)
    
    const encoder = new TextEncoder()
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const data = `data: ${JSON.stringify({ content: chunk })}\n\n`
            controller.enqueue(encoder.encode(data))
          }
          controller.enqueue(encoder.encode('data: [DONE]\n\n'))
          controller.close()
        } catch (error) {
          controller.error(error)
        }
      }
    })

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
      }
    })
  }
}

export default ChatbotController;