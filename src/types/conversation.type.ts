import { MessageResponse } from "./message.type";
import { SessionResponse } from "./session.type";
import { ShopResponse } from "./shop.type";
import { UserResponse } from "./user.type";


export interface CreateConversationDto {
  shopId: string;
  userId?: string;
  sessionId?: string;
  historique?: string;
  contexte?: string;
}

export interface UpdateConversationDto {
  historique?: string;
  contexte?: string;
  userId?: string;
  sessionId?: string;
}

export interface ConversationResponse {
  id: string;
  historique?: string;
  contexte?: string;
  userId?: string;
  shopId: string;
  sessionId?: string;
  createdAt: Date;
  updatedAt: Date;
  user?: UserResponse;
  shop?: ShopResponse;
  session?: SessionResponse;
  messages?: MessageResponse[];
}

//Types pour les requêtes de recherche

