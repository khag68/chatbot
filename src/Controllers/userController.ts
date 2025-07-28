import { Elysia, t } from 'elysia'
import { UserService } from '../services/user.service'

export class UserController {
  private userService = new UserService()

  routes() {
    return new Elysia({ prefix: '/users' })
      .post('/create', async ({ body }) => {
        return await this.userService.createUser(body)
      }, {
        body: t.Object({
          shopId: t.String(),
          externalId: t.String(),
          nom: t.Optional(t.String()),
          prenom: t.Optional(t.String()),
          email: t.Optional(t.String())
        })
      })
      .get('/list', async () => {
        return await this.userService.getAllUsers()
      })
      .get('/:id', async ({ params }) => {
        return await this.userService.getUser(params.id)
      })
      .patch('/:id', async ({ params, body }) => {
        return await this.userService.updateUser(params.id, body)
      }, {
        body: t.Object({
          shopId: t.Optional(t.String()),
          externalId: t.Optional(t.String()),
          nom: t.Optional(t.String()),
          prenom: t.Optional(t.String()),
          email: t.Optional(t.String())
        })
      })
      .delete('/:id', async ({ params }) => {
        await this.userService.deleteUser(params.id)
        return { success: true }
      })
  }
}
