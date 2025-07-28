import { Elysia, t } from 'elysia'
import { SessionService } from '../services/session.service'

export class SessionController {
  private sessionService = new SessionService()

  routes() {
    return new Elysia({ prefix: '/sessions' })
      // 🟢 Démarrer une session
      .post('/start', async ({ body }) => {
        return await this.sessionService.createSession(body)
      }, {
        body: t.Object({
          shopId: t.String(),
          userId: t.Optional(t.String())
        })
      })

      // 🔴 Terminer une session
      .patch('/end/:id', async ({ params }) => {
        return await this.sessionService.endSession(params.id)
      })

      // 🔍 Récupérer une session par ID
      .get('/:id', async ({ params }) => {
        return await this.sessionService.getSession(params.id)
      })

      // 📋 Lister les sessions actives (optionnellement filtrées)
      .get('/active', async ({ query }) => {
        return await this.sessionService.getActiveSessions(query.userId, query.shopId)
      }, {
        query: t.Object({
          userId: t.Optional(t.String()),
          shopId: t.Optional(t.String())
        })
      })

      // 🗑️ Supprimer une session
      .delete('/:id', async ({ params }) => {
        await this.sessionService.deleteSession(params.id)
        return { success: true }
      })
  }
}
