import type { Conversation, ChatMessage } from '../types';

export class ConversationService {
  private conversations = new Map<string, Conversation>();

  generateId(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }

  createConversation(title?: string, userId?: string): Conversation {
    const id = this.generateId();
    const conversation: Conversation = {
      id,
      title: title || `Conversation ${new Date().toLocaleString()}`,
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      userId
    };

    this.conversations.set(id, conversation);
    return conversation;
  }

  getConversation(id: string): Conversation | undefined {
    return this.conversations.get(id);
  }

  getAllConversations(userId?: string): Conversation[] {
    const conversations = Array.from(this.conversations.values());
    if (userId) {
      return conversations.filter(conv => conv.userId === userId);
    }
    return conversations;
  }

  addMessage(conversationId: string, message: Omit<ChatMessage, 'id' | 'timestamp' | 'conversationId'>): ChatMessage {
    const conversation = this.conversations.get(conversationId);
    if (!conversation) {
      throw new Error('Conversation non trouvée');
    }

    const chatMessage: ChatMessage = {
      id: this.generateId(),
      ...message,
      timestamp: new Date(),
      conversationId
    };

    conversation.messages.push(chatMessage);
    conversation.updatedAt = new Date();

    return chatMessage;
  }

  deleteConversation(id: string): boolean {
    return this.conversations.delete(id);
  }

  updateConversationTitle(id: string, title: string): boolean {
    const conversation = this.conversations.get(id);
    if (!conversation) return false;

    conversation.title = title;
    conversation.updatedAt = new Date();
    return true;
  }
}