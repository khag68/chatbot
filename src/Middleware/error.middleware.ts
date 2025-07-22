import { Elysia } from 'elysia';

export const errorMiddleware = (app: Elysia) => 
  app.onError(({ code, error, set }) => {
    console.error(`[${code}] ${error}`);
    
    switch (code) {
      case 'VALIDATION':
        set.status = 400;
        return {
          error: 'Données de requête invalides',
          code: 'VALIDATION_ERROR',
          timestamp: new Date()
        };
      case 'NOT_FOUND':
        set.status = 404;
        return {
          error: 'Endpoint non trouvé',
          code: 'NOT_FOUND',
          timestamp: new Date()
        };
      default:
        set.status = 500;
        return {
          error: 'Erreur interne du serveur',
          code: 'INTERNAL_ERROR',
          timestamp: new Date()
        };
    }
  });