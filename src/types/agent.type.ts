import { ShopResponse } from "./shop.type";


export interface CreateAgentDto {
  shopId: string;
  identification: string;
  role?: string;
}

export interface UpdateAgentDto {
  identification?: string;
  role?: string;
}

export interface AgentResponse {
  id: string;
  shopId: string;
  identification: string;
  role?: string;
  createdAt: Date;
  updatedAt: Date;
  shop?: ShopResponse;
}