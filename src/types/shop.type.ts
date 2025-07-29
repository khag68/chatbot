import { AgentResponse } from "./agent.type";
import { ConversationResponse } from "./conversation.type";
import { SessionResponse } from "./session.type";
import { UserResponse } from "./user.type";

export interface CreateShopDto {
  name: string;
  description: string;
  domain: string;
  location?: string;
  email?: string;
  phone?: string;
}

export interface UpdateShopDto {
  name?: string;
  description?: string;
  domain?: string;
  location?: string;
  email?: string;
  phone?: string;
}

export interface ShopResponse {
  id: string;
  name: string;
  description: string;
  domain: string;
  location?: string;
  email?: string;
  phone?: string;
  createdAt: Date;
  updatedAt: Date;
  agents?: AgentResponse[];
  users?: UserResponse[];
  conversations?: ConversationResponse[];
  sessions?: SessionResponse[];
}

// Types pour les requêtes de recherche
