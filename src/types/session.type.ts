import { ConversationResponse } from "./conversation.type";
import { ShopResponse } from "./shop.type";
import { UserResponse } from "./user.type";


export interface CreateSessionDto {
  shopId: string;
  userId?: string;
}

export interface UpdateSessionDto {
  endedAt?: Date;
}

export interface SessionResponse {
  id: string;
  userId?: string;
  shopId: string;
  startedAt: Date;
  endedAt?: Date;
  user?: UserResponse;
  shop?: ShopResponse;
  conversations?: ConversationResponse[];
}