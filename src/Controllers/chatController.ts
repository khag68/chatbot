import { Elysia, t } from 'elysia';
import { AnthropicService } from '../services/anthropic.service';
import { ConversationService } from '../services/conversation.service';
import type { ChatRequest, ChatResponse, ApiError } from '../types';

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

          // Créer ou récupérer la conversation
          let conversation = conversationId 
            ? this.conversationService.getConversation(conversationId)
            : null;

          if (!conversation) {
            conversation = this.conversationService.createConversation();
          }

          // Ajouter le message utilisateur
          const userMessage = this.conversationService.addMessage(conversation.id, {
            role: 'user',
            content: message
          });

          // Générer la réponse avec Anthropic
          const response = await this.anthropicService.generateResponse(
            conversation.messages,
            { model, maxTokens, temperature }
          );

          // Ajouter la réponse de l'assistant
          const assistantMessage = this.conversationService.addMessage(conversation.id, {
            role: 'assistant',
            content: response.content
          });

          const chatResponse: ChatResponse = {
            message: assistantMessage,
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
      .get('/conversations', ({ query }) => {
        try {
          const conversations = this.conversationService.getAllConversations(query.userId);
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
      .get('/conversations/:id', ({ params, set }) => {
        try {
          const conversation = this.conversationService.getConversation(params.id);
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
      .delete('/conversations/:id', ({ params, set }) => {
        try {
          const deleted = this.conversationService.deleteConversation(params.id);
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
      .patch('/conversations/:id/title', ({ params, body, set }) => {
        try {
          const { title } = body as { title: string };
          const updated = this.conversationService.updateConversationTitle(params.id, title);
          
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