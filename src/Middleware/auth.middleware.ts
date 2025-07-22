import Elysia from "elysia"

const authMiddleware = (app: Elysia) => {
  return app.derive(({ headers }) => {
    const apiKey = headers['x-api-key']
    
    if (!apiKey) {
      throw new Error('Clé API manquante')
    }
    
    // Ici vous pouvez ajouter votre logique d'authentification
    return { authenticated: true }
  })
}
export default authMiddleware;