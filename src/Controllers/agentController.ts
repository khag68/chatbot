import { Elysia, t } from 'elysia'
import { AgentService } from '../services/agent.service'

export class AgentController {
  private agentService = new AgentService()

  routes() {
    return new Elysia({ prefix: '/agent' })
      .post('/create', async ({ body }) => {
        return await this.agentService.createAgent(body)
      }, {
        body: t.Object({
          shopId: t.String(),
          username: t.String(),
          role: t.Optional(t.String())
        })
      })
      .get('/list', async ({ query }) => {
        return await this.agentService.getAllAgents(query.shopId)
      }, {
        query: t.Object({
          shopId: t.Optional(t.String())
        })
      })
      .get('/:id', async ({ params }) => {
        return await this.agentService.getAgent(params.id)
      })
      .patch('/:id', async ({ params, body }) => {
        return await this.agentService.updateAgent(params.id, body)
      }, {
        body: t.Object({
          username: t.Optional(t.String()),
          role: t.Optional(t.String())
        })
      })
      .delete('/:id', async ({ params }) => {
        await this.agentService.deleteAgent(params.id)
        return { success: true }
      })
  }
}