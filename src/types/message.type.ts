import { ConversationResponse } from "./conversation.type";
import { SearchParams } from "./search.type";


export interface CreateMessageDto {
  conversationId: string;
  sender: string;
  content: string;
}

export interface MessageResponse {
  id: string;
  conversationId: string;
  sender: string;
  content: string;
  timestamp: Date;
  conversation?: ConversationResponse;
}

//Les types pour les requêtes de recherche
