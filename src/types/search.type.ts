// Types pour les requêtes de recherche
export interface SearchParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
export interface ShopSearchParams extends SearchParams {
  domain?: string;
  name?: string;
  email?: string;
}

export interface MessageSearchParams extends SearchParams {
  conversationId?: string;
  sender?: string;
  startDate?: Date;
  endDate?: Date;
}

export interface ConversationSearchParams extends SearchParams {
  userId?: string;
  shopId?: string;
  sessionId?: string;
}