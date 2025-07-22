import Anthropic from '@anthropic-ai/sdk';
import { config } from '../config';
import type { ChatMessage } from '../types';

export class AnthropicService {
  private client: Anthropic;

  constructor() {
    this.client = new Anthropic({
      apiKey: config.anthropic.apiKey,
    });
  }

  async generateResponse(
    messages: ChatMessage[],
    options: {
      model?: string;
      maxTokens?: number;
      temperature?: number;
    } = {}
  ) {
    const {
      model = config.anthropic.defaultModel,
      maxTokens = config.anthropic.defaultMaxTokens,
      temperature = config.anthropic.defaultTemperature
    } = options;

    // Convertir les messages au format Anthropic
    const anthropicMessages = messages
      .filter(msg => msg.role !== 'system')
      .map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content
      }));

    // Extraire le message système s'il existe
    const systemMessage = messages.find(msg => msg.role === 'system')?.content;

    try {
      const response = await this.client.messages.create({
        model,
        max_tokens: maxTokens,
        temperature,
        messages: anthropicMessages,
        ...(systemMessage && { system: systemMessage })
      });

      return {
        content: response.content[0].type === 'text' ? response.content[0].text : '',
        usage: {
          inputTokens: response.usage.input_tokens,
          outputTokens: response.usage.output_tokens
        }
      };
    } catch (error) {
      console.error('Erreur Anthropic:', error);
      throw new Error('Erreur lors de la génération de la réponse');
    }
  }
}