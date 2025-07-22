export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  conversationId: string;
}

export interface Conversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
  userId?: string;
}

export interface ChatRequest {
  message: string;
  conversationId?: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

export interface ChatResponse {
  message: ChatMessage;
  conversationId: string;
  usage?: {
    inputTokens: number;
    outputTokens: number;
  };
}

export interface ApiError {
  error: string;
  code: string;
  timestamp: Date;
}
