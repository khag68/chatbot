import { Messages } from "@anthropic-ai/sdk/resources/messages";
import prisma from "./prisma.service";

interface ChatMessage {
  id: string;
  conversationId: string;
  sender: string;
  content: string;
  timestamp: Date;
}

interface Conversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
  userId?: string;
  shopId: string;
  historique?: string;
  contexte?: string;
  sessionId?: string;
}

export class ConversationService {
  getMessages(id: string) {
    throw new Error('Method not implemented.');
  }
  updateConversationTitle(id: string, title: string) {
    throw new Error('Method not implemented.');
  }
  async createConversation(shopId: string, title?: string, userId?: string, sessionId?: string): Promise<Conversation> {
    if (!shopId) {
      throw new Error('shopId is required to create a conversation.');
    }

    try {
      const newConversation = await prisma.conversation.create({
        data: {
          title: title || `Conversation ${new Date().toLocaleString()}`,
          historique: title || `Conversation ${new Date().toLocaleString()}`,
          userId: userId || null,
          shopId: shopId,
          sessionId: sessionId || null,
        },
      });

      return {
        id: newConversation.id,
        title: newConversation.historique || newConversation.title || '',
        messages: [],
        createdAt: newConversation.createdAt,
        updatedAt: newConversation.updatedAt,
        userId: newConversation.userId || undefined,
        shopId: newConversation.shopId || '',
        historique: newConversation.historique || undefined,
        contexte: newConversation.contexte || undefined,
        sessionId: newConversation.sessionId || undefined,
      };
    } catch (error) {
      console.error('Error creating conversation:', error);
      throw new Error('Failed to create conversation in the database.');
    }
  }

  async saveConversation(id: string | undefined, data: { title: string; shopId: string; userId?: string; historique?: string; contexte?: string; sessionId?: string; }): Promise<Conversation> {
    try {
      let savedConversation;
      if (id) {
        savedConversation = await prisma.conversation.update({
          where: { id: id },
          data: {
            historique: data.historique || data.title,
            contexte: data.contexte,
            updatedAt: new Date(),
            sessionId: data.sessionId || null,
          },
        });
      } else {
        if (!data.shopId) {
          throw new Error('shopId is required to create a new conversation.');
        }
        savedConversation = await prisma.conversation.create({
          data: {
            title: data.title,
            historique: data.historique || data.title,
            userId: data.userId || null,
            shopId: data.shopId,
            contexte: data.contexte,
            sessionId: data.sessionId || null,
          },
        });
      }

      return {
        id: savedConversation.id,
        title: savedConversation.historique || savedConversation.title || '',
        messages: [],
        createdAt: savedConversation.createdAt,
        updatedAt: savedConversation.updatedAt,
        userId: savedConversation.userId || undefined,
        shopId: savedConversation.shopId || '',
        historique: savedConversation.historique || undefined,
        contexte: savedConversation.contexte || undefined,
        sessionId: savedConversation.sessionId || undefined,
      };
    } catch (error) {
      console.error('Error saving conversation:', error);
      throw new Error(`Failed to save conversation: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async getConversation(id: string): Promise<Conversation | undefined> {
    try {
      const conversation = await prisma.conversation.findUnique({
        where: { id },
        include: {
          messages: true,
        },
      });

      if (!conversation) {
        return undefined;
      }

      const chatMessages: ChatMessage[] = conversation.messages.map(msg => ({
        id: msg.id,
        conversationId: msg.conversationId,
        sender: msg.sender,
        content: msg.content,
        timestamp: msg.timestamp,
      }));

      return chatMessages.length > 0 ? {
        id: conversation.id,
        title: conversation.historique || conversation.title || '',
        messages: chatMessages,
        createdAt: conversation.createdAt,
        updatedAt: conversation.updatedAt,
        userId: conversation.userId || undefined,
        shopId: conversation.shopId || '',
        historique: conversation.historique || undefined,
        contexte: conversation.contexte || undefined,
        sessionId: conversation.sessionId || undefined,
      } : undefined ;
    } catch (error) {
      console.error(`Error getting conversation with ID ${id}:`, error);
      return undefined;
    }
  }

  async getAllConversations(userId?: string): Promise<Conversation[]> {
    try {
      const whereClause = userId ? { userId: userId } : {};
      const conversations = await prisma.conversation.findMany({
        where: whereClause,
        include: {
          messages: true,
        },
      });

      return conversations.map(conv => ({
        id: conv.id,
        title: conv.historique || conv.title || '',
        messages: [
          ...conv.messages.map(msg => ({
            id: msg.id,
            conversationId: msg.conversationId,
            sender: msg.sender,
            content: msg.content,
            timestamp: msg.timestamp,
          }))
        ],
        createdAt: conv.createdAt,
        updatedAt: conv.updatedAt,
        userId: conv.userId || undefined,
        shopId: conv.shopId || '',
        historique: conv.historique || undefined,
        contexte: conv.contexte || undefined,
        sessionId: conv.sessionId || undefined,
      }));
    } catch (error) {
      console.error('Error getting all conversations:', error);
      return [];
    }
  }

  async addMessage(conversationId: string, messageData: { sender: string; content: string }): Promise<ChatMessage> {
    try {
      const conversationExists = await prisma.conversation.findUnique({
        where: { id: conversationId },
        select: { id: true },
      });

      if (!conversationExists) {
        throw new Error(`Conversation with ID ${conversationId} not found.`);
      }

      const newMessage = await prisma.message.create({
        data: {
          conversationId: conversationId,
          sender: messageData.sender,
          content: messageData.content,
          timestamp: new Date(),
        },
      });

      await prisma.conversation.update({
        where: { id: conversationId },
        data: { updatedAt: new Date() },
      });

      return {
        id: newMessage.id,
        conversationId: newMessage.conversationId,
        sender: newMessage.sender,
        content: newMessage.content,
        timestamp: newMessage.timestamp,
      };
    } catch (error) {
      console.error(`Error adding message to conversation ${conversationId}:`, error);
      throw new Error(`Failed to add message: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async deleteConversation(messageId: string): Promise<boolean> {
    try {
      const result = await prisma.message.delete({
      where: { id: messageId },
    });

      //const result = await prisma.conversation.delete({
       // where: { id },
      //});
      return !!result;
    } catch (error) {
      console.error(`Error deleting conversation with ID ${messageId}:`, error);
      return false;
    }
  }

 /* async updateConversationTitle(id: string, title: string): Promise<boolean> {
    try {
      const updatedConversation = await prisma.conversation.update({
        where: { id },
        data: {
          historique: title,
          updatedAt: new Date(),
        },
      });
      return !!updatedConversation;
    } catch (error) {
      console.error(`Error updating conversation title for ID ${id}:`, error);
      return false;
    }
  }
}*/


async updateMessageContentAndTitle(
  messageId: string,
  newContent?: string, // Rendre optionnel
  newTitle?: string // Rendre optionnel
): Promise<boolean> {
  try {
    const dataToUpdate: { content?: string; title?: string; updatedAt?: Date } = {};

    if (newContent !== undefined) {
      dataToUpdate.content = newContent;
    }
    if (newTitle !== undefined) {
      dataToUpdate.title = newTitle;
    }

    // Toujours mettre à jour la date de modification si au moins un champ est fourni
    if (Object.keys(dataToUpdate).length > 0) {
      dataToUpdate.updatedAt = new Date();
    } else {
      // Si aucun champ n'est fourni, il n'y a rien à mettre à jour.
      // Vous pouvez choisir de retourner true ou false selon votre logique.
      console.warn(`No content or title provided to update for message ID ${messageId}.`);
      return false; // Ou true si vous considérez que c'est une "réussite" de ne rien faire.
    }

    const updatedMessage = await prisma.message.update({
      where: { id: messageId },
      data: dataToUpdate,
    });

    return !!updatedMessage;
  } catch (error) {
    console.error(`Error updating message with ID ${messageId}:`, error);
    return false;
  }
}}