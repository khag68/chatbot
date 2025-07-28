import { Elysia, t } from 'elysia'
import { MessageService } from '../services/message.service'

export class MessageController {
  private messageService = new MessageService()

  routes() {
    return new Elysia({ prefix: '/messages' })
      .post('/create', async ({ body }) => {
        return await this.messageService.createMessage(body)
      }, {
        body: t.Object({
          conversationId: t.String(),
          senderId: t.String(),
          role: t.String(), // 'user' ou 'assistant'
          content: t.String()
        })
      })
      .get('/conversation/:id', async ({ params }) => {
        return await this.messageService.getMessagesByConversation(params.id)
      })
      .get('/:id', async ({ params }) => {
        return await this.messageService.getMessage(params.id)
      })
      .delete('/:id', async ({ params }) => {
        await this.messageService.deleteMessage(params.id)
        return { success: true }
      })
  }
}
