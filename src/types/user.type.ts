import { ConversationResponse } from "./conversation.type";
import { SessionResponse } from "./session.type";
import { ShopResponse } from "./shop.type";


export interface CreateUserDto {
  shopId: string;
  externalId: string;
  nom?: string;
  prenom?: string;
  email?: string;
}

export interface UpdateUserDto {
  nom?: string;
  prenom?: string;
  email?: string;
}

export interface UserResponse {
  id: string;
  shopId: string;
  externalId: string;
  nom?: string | null;
  prenom?: string | null;
  email?: string | null;
  createdAt: Date;
  updatedAt: Date;
  shop?: ShopResponse;
  conversations?: ConversationResponse[];
  session?: SessionResponse[];
}