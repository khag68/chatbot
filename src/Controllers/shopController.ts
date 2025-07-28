import { Elysia, t } from 'elysia'
import { ShopService } from '../services/shop.service'

export class ShopController {
  private shopService = new ShopService()

  routes() {
    return new Elysia({ prefix: '/shop' })
      .post('/create', async ({ body }) => {
        return await this.shopService.createShop(body)
      }, {
        body: t.Object({
          name: t.String(),
          ownerId: t.String(),
          location: t.Optional(t.String())
        })
      })
      .get('/list', async () => {
        return await this.shopService.getAllShop()
      })
      .get('/:id', async ({ params }) => {
        return await this.shopService.getShop(params.id)
      })
      .patch('/:id', async ({ params, body }) => {
        return await this.shopService.updateShop(params.id, body)
      }, {
        body: t.Object({
          name: t.Optional(t.String()),
          location: t.Optional(t.String())
        })
      })
      .delete('/:id', async ({ params }) => {
        await this.shopService.deleteShop(params.id)
        return { success: true }
      })
  }
}
