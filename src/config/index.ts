export const config = {
  port: process.env.PORT || 3000,
  anthropic: {
    apiKey: process.env.ANTHROPIC_API_KEY!,
    defaultModel: 'claude-3-sonnet-20240229',
    defaultMaxTokens: 1024,
    defaultTemperature: 0.7
  },
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true
  }
};

if (!config.anthropic.apiKey) {
  throw new Error('ANTHROPIC_API_KEY environment variable is required');
}