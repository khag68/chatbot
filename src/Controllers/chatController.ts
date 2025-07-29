import { Elysia, t } from 'elysia';
import { AnthropicService } from '../services/anthropic.service';
import { ConversationService } from '../services/conversation.service';
import type { ChatRequest, ChatResponse, ApiError } from '../types';
import { ObjectId } from 'mongodb';

const objectId = new ObjectId();
export class ChatController {
  private anthropicService: AnthropicService;
  private conversationService: ConversationService;

  constructor() {
    this.anthropicService = new AnthropicService();
    this.conversationService = new ConversationService();
  }

  routes() {
    return new Elysia({ prefix: '/chat' })
      .post('/message', async ({ body, set }) => {
        try {
          const {
            message,
            conversationId,
            model,
            maxTokens,
            temperature
          } = body as ChatRequest;

          let conversation;
          if (conversationId) {
            conversation = await this.conversationService.getConversation(conversationId);
          }

          if (!conversation) {
            const shopId = objectId.toHexString();
            conversation = await this.conversationService.createConversation(shopId);
          }

          const userMessage = await this.conversationService.addMessage(conversation.id, {
            sender: 'user',
            content: message
          });
          
          const response = await this.anthropicService.generateResponse(
            await this.conversationService.getConversation(conversation.id).then(c =>
              (c?.messages || []).map(msg => ({
                ...msg,
                role: msg.sender as 'user' | 'assistant' | 'system',
                content: msg.content
              }))
            ),
            { model, maxTokens, temperature }
          );

          const assistantMessage = await this.conversationService.addMessage(conversation.id, {
            sender: 'assistant',
            content: response.content
          });

          const chatResponse = {
            message: {
              role: assistantMessage.sender,
              content: assistantMessage.content,
            },
            conversationId: conversation.id,
            usage: response.usage
          };

          return chatResponse;
        } catch (error) {
          set.status = 500;
          const apiError: ApiError = {
            error: error instanceof Error ? error.message : 'Erreur interne',
            code: 'CHAT_ERROR',
            timestamp: new Date()
          };
          return apiError;
        }
      }, {
        body: t.Object({
          message: t.String(),
          conversationId: t.Optional(t.String()),
          model: t.Optional(t.String()),
          maxTokens: t.Optional(t.Number()),
          temperature: t.Optional(t.Number())
        })
      })
      .get('/conversations/:id/messages', async ({ params, set }) => {
        try {
          const messages = await this.conversationService.getMessages(params.id);
          return { messages };
        } catch (error) {
          set.status = 500;
          return {
            error: 'Erreur lors de la récupération des messages',
            code: 'FETCH_ERROR',
            timestamp: new Date()
          };
        }
      })
      .get('/conversations', async ({ query }) => {
        try {
          const conversations = await this.conversationService.getAllConversations(query.userId);
          return { conversations };
        } catch (error) {
          return {
            error: 'Erreur lors de la récupération des conversations',
            code: 'FETCH_ERROR',
            timestamp: new Date()
          };
        }
      }, {
        query: t.Object({
          userId: t.Optional(t.String())
        })
      })
      .get('/conversations/:id', async ({ params, set }) => {
        try {
          const conversation = await this.conversationService.getConversation(params.id);
          if (!conversation) {
            set.status = 404;
            return {
              error: 'Conversation non trouvée',
              code: 'NOT_FOUND',
              timestamp: new Date()
            };
          }
          return conversation;
        } catch (error) {
          set.status = 500;
          return {
            error: 'Erreur lors de la récupération de la conversation',
            code: 'FETCH_ERROR',
            timestamp: new Date()
          };
        }
      })
      .delete('/conversations/:id', async ({ params, set }) => {
        try {
          const deleted = await this.conversationService.deleteConversation(params.id);
          if (!deleted) {
            set.status = 404;
            return {
              error: 'Conversation non trouvée',
              code: 'NOT_FOUND',
              timestamp: new Date()
            };
          }
          return { success: true, message: 'Conversation supprimée' };
        } catch (error) {
          set.status = 500;
          return {
            error: 'Erreur lors de la suppression',
            code: 'DELETE_ERROR',
            timestamp: new Date()
          };
        }
      })
      .patch('/conversations/:id/title', async ({ params, body, set }) => {
        try {
          const { title } = body as { title: string };
          const updated = await this.conversationService.updateConversationTitle(params.id, title);

          if (!updated) {
            set.status = 404;
            return {
              error: 'Conversation non trouvée',
              code: 'NOT_FOUND',
              timestamp: new Date()
            };
          }

          return { success: true, message: 'Titre mis à jour' };
        } catch (error) {
          set.status = 500;
          return {
            error: 'Erreur lors de la mise à jour',
            code: 'UPDATE_ERROR',
            timestamp: new Date()
          };
        }
      }, {
        body: t.Object({
          title: t.String()
        })
      });


  }
}
